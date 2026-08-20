#!/usr/bin/env python3
"""
Render helper for Human Image.

The intelligence stays in Claude: it writes the visual prompt and chooses the
creative direction. This script only checks Higgsfield CLI/login, submits the
prompt, waits for the result, and downloads the generated image.

Two render providers are supported (see providers.md):

  higgsfield_cli  -> this script drives the CLI end to end (`render`)
  magnific_mcp    -> Claude calls the `mcp__magnific__*` tools directly and then
                     hands the resulting URL/file to `save-external`, so both
                     providers land in the exact same folder structure.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import shutil
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
UUID_RE = re.compile(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}", re.I)
URL_RE = re.compile(r"https://[^ \"']+\.(?:png|jpg|jpeg|webp)(?:\?[^ \"']*)?", re.I)

ASPECT_RATIOS = {"auto", "1:1", "3:2", "2:3", "4:3", "3:4", "4:5", "5:4", "9:16", "16:9", "21:9"}
RESOLUTIONS = {"1k", "2k", "4k"}


def now_slug() -> str:
    return dt.datetime.now().strftime("%Y-%m-%d-%H%M%S")


def now_iso() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")


def model_name() -> str:
    return os.environ.get("HIGGSFIELD_IMAGE_MODEL", "nano_banana_2")


def run_cmd(args: list[str], timeout: int = 1800) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        args,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        timeout=timeout,
        check=False,
    )


def parse_first_uuid(text: str) -> str | None:
    match = UUID_RE.search(text)
    return match.group(0) if match else None


def parse_first_url(text: str) -> str | None:
    match = URL_RE.search(text)
    return match.group(0) if match else None


def upload_reference(path: Path) -> str | None:
    result = run_cmd(["higgsfield", "upload", "create", str(path)], timeout=300)
    uuid = parse_first_uuid(result.stdout)
    if not uuid:
        print(f"ERRO: nao consegui extrair UUID do upload de referencia {path.name}. Saida: {result.stdout[:800]}", file=sys.stderr)
    return uuid


def check_cli() -> int:
    if not shutil.which("higgsfield"):
        print(json.dumps({
            "status": "missing",
            "message": "Higgsfield CLI nao encontrado. Instale com: npm install -g @higgsfield/cli",
        }, ensure_ascii=False))
        return 1

    result = run_cmd(["higgsfield", "account", "status"], timeout=60)
    if result.returncode == 0:
        print(json.dumps({
            "status": "ok",
            "message": "Higgsfield CLI instalado e autenticado.",
            "detail": result.stdout.strip()[:800],
        }, ensure_ascii=False))
        return 0

    print(json.dumps({
        "status": "login_required",
        "message": "Higgsfield CLI existe, mas precisa de login. Rode higgsfield auth login.",
        "detail": result.stdout.strip()[:800],
    }, ensure_ascii=False))
    return 2


def higgsfield_status() -> dict:
    if not shutil.which("higgsfield"):
        return {
            "available": False,
            "status": "missing",
            "message": "Higgsfield CLI nao encontrado.",
            "fix": "npm install -g @higgsfield/cli",
        }

    result = run_cmd(["higgsfield", "account", "status"], timeout=60)
    if result.returncode == 0:
        return {
            "available": True,
            "status": "ok",
            "message": "Higgsfield CLI instalado e autenticado.",
            "model": model_name(),
            "detail": result.stdout.strip()[:400],
        }

    return {
        "available": False,
        "status": "login_required",
        "message": "Higgsfield CLI existe, mas precisa de login.",
        "fix": "higgsfield auth login",
        "detail": result.stdout.strip()[:400],
    }


def check_providers() -> int:
    """Report render providers. Higgsfield is probed here; Magnific lives in the
    MCP layer, so only Claude can confirm it — we return the instructions."""
    higgs = higgsfield_status()
    preferred = os.environ.get("HUMAN_IMAGE_PROVIDER", "").strip().lower() or None
    if preferred and preferred not in {"higgsfield", "magnific"}:
        preferred = None

    payload = {
        "preferred_provider_env": preferred,
        "providers": {
            "higgsfield_cli": higgs,
            "magnific_mcp": {
                "available": "unknown_from_script",
                "message": "Verifique na sessao se existem ferramentas mcp__magnific__*. Se estiverem diferidas, use ToolSearch com a query 'magnific'.",
                "fix": "claude mcp add --transport http --scope user magnific https://mcp.magnific.com/mcp",
                "save_results_with": "save-external",
            },
        },
        "resolution_order": [
            "1. pedido explicito do usuario",
            "2. env HUMAN_IMAGE_PROVIDER (higgsfield|magnific)",
            "3. auto-deteccao: magnific se o CLI nao estiver pronto; higgsfield se estiver",
            "4. os dois disponiveis -> higgsfield (padrao da casa)",
            "5. nenhum -> salvar prompt e conduzir o setup, sem renderizar",
        ],
    }
    print(json.dumps(payload, indent=2, ensure_ascii=False))
    return 0 if higgs["available"] else 2


def render(prompt_file: str, aspect_ratio: str, resolution: str, output_dir: str | None, output_name: str | None, reference_images: list[str]) -> int:
    if aspect_ratio not in ASPECT_RATIOS:
        print(f"ERRO: aspect_ratio invalido: {aspect_ratio}. Use: {', '.join(sorted(ASPECT_RATIOS))}", file=sys.stderr)
        return 1

    if resolution not in RESOLUTIONS:
        print(f"ERRO: resolution invalida: {resolution}. Use: 1k, 2k ou 4k.", file=sys.stderr)
        return 1

    check = check_cli()
    if check != 0:
        return check

    prompt_path = Path(prompt_file).expanduser().resolve()
    if not prompt_path.exists():
        print(f"ERRO: prompt-file nao existe: {prompt_path}", file=sys.stderr)
        return 1

    prompt = prompt_path.read_text(encoding="utf-8")
    out_dir = Path(output_dir).expanduser().resolve() if output_dir else ROOT / "output" / now_slug()
    out_dir.mkdir(parents=True, exist_ok=True)
    logs_dir = out_dir / "_logs"
    logs_dir.mkdir(exist_ok=True)

    model = model_name()
    uploaded_refs: list[str] = []
    for ref in reference_images:
        ref_path = Path(ref).expanduser().resolve()
        if not ref_path.exists():
            print(f"ERRO: referencia nao existe: {ref_path}", file=sys.stderr)
            return 1
        uuid = upload_reference(ref_path)
        if uuid:
            uploaded_refs.append(uuid)

    args = [
        "higgsfield", "generate", "create", model,
        "--prompt", prompt,
        "--aspect_ratio", aspect_ratio,
        "--resolution", resolution,
        "--json",
    ]

    for ref in uploaded_refs:
        args.extend(["--image", ref])

    create = run_cmd(args, timeout=300)
    job_id = parse_first_uuid(create.stdout)
    if not job_id:
        print(f"ERRO: Higgsfield nao retornou job_id. Saida: {create.stdout[:1200]}", file=sys.stderr)
        return 1

    wait = run_cmd(["higgsfield", "generate", "wait", job_id, "--timeout", "30m", "--json"], timeout=2100)
    combined = create.stdout + "\n" + wait.stdout
    out_url = parse_first_url(combined)
    if not out_url:
        print(f"ERRO: Higgsfield nao retornou URL de imagem. Saida: {combined[:1600]}", file=sys.stderr)
        return 1

    out_path = out_dir / (output_name or "image.png")
    try:
        with urllib.request.urlopen(out_url, timeout=120) as resp:
            img_bytes = resp.read()
        out_path.write_bytes(img_bytes)
    except (urllib.error.HTTPError, urllib.error.URLError) as exc:
        print(f"ERRO ao baixar imagem gerada: {exc}", file=sys.stderr)
        return 1

    metadata = {
        "status": "ok",
        "created_at": now_iso(),
        "provider": "higgsfield_cli",
        "model": model,
        "job_id": job_id,
        "aspect_ratio": aspect_ratio,
        "resolution": resolution,
        "prompt_file": str(prompt_path),
        "output_path": str(out_path),
        "output_size_kb": len(img_bytes) // 1024,
        "higgsfield_url": out_url,
        "references": [str(Path(ref).expanduser().resolve()) for ref in reference_images],
        "reference_uuids": uploaded_refs,
    }
    (out_dir / "metadata.json").write_text(json.dumps(metadata, indent=2, ensure_ascii=False), encoding="utf-8")
    (logs_dir / f"{out_path.stem}.json").write_text(json.dumps({
        "stdout": combined[-5000:],
        **metadata,
    }, indent=2, ensure_ascii=False), encoding="utf-8")

    print(json.dumps(metadata, indent=2, ensure_ascii=False))
    return 0


def save_external(
    url: str | None,
    file: str | None,
    output_dir: str | None,
    output_name: str | None,
    provider: str,
    model: str | None,
    prompt_file: str | None,
    aspect_ratio: str | None,
    resolution: str | None,
    reference_images: list[str],
) -> int:
    """Land an image produced outside this script (typically by the Magnific MCP)
    in the same folder structure the Higgsfield path produces."""
    if bool(url) == bool(file):
        print("ERRO: informe exatamente um de --url ou --file.", file=sys.stderr)
        return 1

    if aspect_ratio and aspect_ratio not in ASPECT_RATIOS:
        print(f"ERRO: aspect_ratio invalido: {aspect_ratio}. Use: {', '.join(sorted(ASPECT_RATIOS))}", file=sys.stderr)
        return 1

    if resolution and resolution not in RESOLUTIONS:
        print(f"ERRO: resolution invalida: {resolution}. Use: 1k, 2k ou 4k.", file=sys.stderr)
        return 1

    out_dir = Path(output_dir).expanduser().resolve() if output_dir else ROOT / "output" / now_slug()
    out_dir.mkdir(parents=True, exist_ok=True)
    logs_dir = out_dir / "_logs"
    logs_dir.mkdir(exist_ok=True)

    if url:
        if not url.lower().startswith(("http://", "https://")):
            print(f"ERRO: --url precisa comecar com http:// ou https://. Recebi: {url[:120]}", file=sys.stderr)
            return 1
        try:
            with urllib.request.urlopen(url, timeout=120) as resp:
                img_bytes = resp.read()
        except (urllib.error.HTTPError, urllib.error.URLError) as exc:
            print(f"ERRO ao baixar imagem de {url[:120]}: {exc}", file=sys.stderr)
            return 1
        source = url
    else:
        src_path = Path(file).expanduser().resolve()  # type: ignore[arg-type]
        if not src_path.exists():
            print(f"ERRO: arquivo nao existe: {src_path}", file=sys.stderr)
            return 1
        img_bytes = src_path.read_bytes()
        source = str(src_path)

    if not img_bytes:
        print("ERRO: imagem vazia, nada foi salvo.", file=sys.stderr)
        return 1

    out_path = out_dir / (output_name or "image.png")
    out_path.write_bytes(img_bytes)

    metadata = {
        "status": "ok",
        "created_at": now_iso(),
        "provider": provider,
        "model": model,
        "aspect_ratio": aspect_ratio,
        "resolution": resolution,
        "prompt_file": str(Path(prompt_file).expanduser().resolve()) if prompt_file else None,
        "output_path": str(out_path),
        "output_size_kb": len(img_bytes) // 1024,
        "source": source,
        "references": [str(Path(ref).expanduser().resolve()) for ref in reference_images],
    }
    (out_dir / "metadata.json").write_text(json.dumps(metadata, indent=2, ensure_ascii=False), encoding="utf-8")
    (logs_dir / f"{out_path.stem}.json").write_text(json.dumps(metadata, indent=2, ensure_ascii=False), encoding="utf-8")

    print(json.dumps(metadata, indent=2, ensure_ascii=False))
    return 0


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(prog="render_image.py", description="Render Human Image via Higgsfield CLI ou Magnific MCP.")
    sub = parser.add_subparsers(dest="cmd", required=True)

    sub.add_parser("check-cli", help="valida Higgsfield CLI/login")
    sub.add_parser("check-providers", help="reporta os providers de render disponiveis")

    p_render = sub.add_parser("render", help="renderiza uma imagem via Higgsfield CLI")
    p_render.add_argument("prompt_file")
    p_render.add_argument("--aspect-ratio", default="1:1", choices=sorted(ASPECT_RATIOS))
    p_render.add_argument("--resolution", default="2k", choices=sorted(RESOLUTIONS))
    p_render.add_argument("--output-dir", default=None)
    p_render.add_argument("--output-name", default=None)
    p_render.add_argument("--reference", action="append", default=[])

    p_save = sub.add_parser("save-external", help="salva no padrao da casa uma imagem gerada fora do CLI (ex.: Magnific MCP)")
    src = p_save.add_mutually_exclusive_group(required=True)
    src.add_argument("--url", default=None, help="URL da imagem retornada pelo provider")
    src.add_argument("--file", default=None, help="caminho local da imagem retornada pelo provider")
    p_save.add_argument("--output-dir", default=None)
    p_save.add_argument("--output-name", default=None)
    p_save.add_argument("--provider", default="magnific_mcp")
    p_save.add_argument("--model", default=None)
    p_save.add_argument("--prompt-file", default=None)
    p_save.add_argument("--aspect-ratio", default=None, choices=sorted(ASPECT_RATIOS))
    p_save.add_argument("--resolution", default=None, choices=sorted(RESOLUTIONS))
    p_save.add_argument("--reference", action="append", default=[])

    args = parser.parse_args(argv)
    if args.cmd == "check-cli":
        return check_cli()
    if args.cmd == "check-providers":
        return check_providers()
    if args.cmd == "render":
        return render(args.prompt_file, args.aspect_ratio, args.resolution, args.output_dir, args.output_name, args.reference)
    if args.cmd == "save-external":
        return save_external(
            args.url, args.file, args.output_dir, args.output_name, args.provider,
            args.model, args.prompt_file, args.aspect_ratio, args.resolution, args.reference,
        )
    return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
