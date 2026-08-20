#!/usr/bin/env python3
"""
Human Motion — gerador da imagem estática (etapa 1).

A inteligência fica no Claude: ele escreve o prompt e decide a direção de arte.
Este script só valida o Higgsfield CLI, sobe as referências, dispara o job com
gpt_image_2, espera terminar e baixa o PNG para a pasta de output.

Uso:
    python3 scripts/gerar_frame.py check
    python3 scripts/gerar_frame.py render "output/slug/01-frame/prompt-frame.txt" \
        --aspect-ratio 9:16 --resolution 2k \
        --output-dir "output/slug/01-frame" --output-name "frame-01.png" \
        --reference "assets/referencias/estilo.png"
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

UUID_RE = re.compile(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}", re.I)
URL_RE = re.compile(r"https://[^ \"']+\.(?:png|jpg|jpeg|webp)(?:\?[^ \"']*)?", re.I)

ASPECT_RATIOS = {"auto", "1:1", "3:2", "2:3", "4:3", "3:4", "4:5", "5:4", "9:16", "16:9", "21:9"}
RESOLUTIONS = {"1k", "2k", "4k"}
QUALITIES = {"low", "medium", "high"}


def model_name() -> str:
    """gpt_image_2 é o modelo padrão da etapa 1 (lida bem com lettering e layout)."""
    return os.environ.get("HUMAN_MOTION_IMAGE_MODEL", "gpt_image_2")


def now_iso() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")


def run_cmd(args: list[str], timeout: int = 1800) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        args,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        timeout=timeout,
        check=False,
    )


def first_uuid(text: str) -> str | None:
    match = UUID_RE.search(text)
    return match.group(0) if match else None


def first_url(text: str) -> str | None:
    match = URL_RE.search(text)
    return match.group(0) if match else None


def emit(payload: dict) -> None:
    print(json.dumps(payload, indent=2, ensure_ascii=False))


def check_cli() -> int:
    if not shutil.which("higgsfield"):
        emit({
            "status": "missing",
            "message": "Higgsfield CLI não encontrado. Instale com: npm install -g @higgsfield/cli",
        })
        return 1

    result = run_cmd(["higgsfield", "account", "status"], timeout=60)
    if result.returncode == 0:
        emit({
            "status": "ok",
            "message": "Higgsfield CLI instalado e autenticado.",
            "detail": result.stdout.strip()[:600],
        })
        return 0

    emit({
        "status": "login_required",
        "message": "Higgsfield CLI existe, mas a sessão expirou. Rode: higgsfield auth login",
        "detail": result.stdout.strip()[:600],
    })
    return 2


def upload_reference(path: Path) -> str | None:
    result = run_cmd(["higgsfield", "upload", "create", str(path)], timeout=300)
    uuid = first_uuid(result.stdout)
    if not uuid:
        print(
            f"ERRO: não consegui extrair o UUID do upload de {path.name}. Saída: {result.stdout[:600]}",
            file=sys.stderr,
        )
    return uuid


def render(
    prompt_file: str,
    aspect_ratio: str,
    resolution: str,
    quality: str,
    output_dir: str,
    output_name: str,
    references: list[str],
) -> int:
    if aspect_ratio not in ASPECT_RATIOS:
        print(f"ERRO: aspect ratio inválido: {aspect_ratio}. Use: {', '.join(sorted(ASPECT_RATIOS))}", file=sys.stderr)
        return 1
    if resolution not in RESOLUTIONS:
        print(f"ERRO: resolução inválida: {resolution}. Use: 1k, 2k ou 4k.", file=sys.stderr)
        return 1
    if quality not in QUALITIES:
        print(f"ERRO: quality inválida: {quality}. Use: low, medium ou high.", file=sys.stderr)
        return 1

    status = check_cli()
    if status != 0:
        return status

    prompt_path = Path(prompt_file).expanduser().resolve()
    if not prompt_path.exists():
        print(f"ERRO: arquivo de prompt não existe: {prompt_path}", file=sys.stderr)
        return 1

    prompt = prompt_path.read_text(encoding="utf-8").strip()
    if not prompt:
        print(f"ERRO: o arquivo de prompt está vazio: {prompt_path}", file=sys.stderr)
        return 1

    out_dir = Path(output_dir).expanduser().resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    logs_dir = out_dir / "_logs"
    logs_dir.mkdir(exist_ok=True)

    uploaded: list[str] = []
    for ref in references:
        ref_path = Path(ref).expanduser().resolve()
        if not ref_path.exists():
            print(f"ERRO: referência não existe: {ref_path}", file=sys.stderr)
            return 1
        if "logo" in ref_path.parent.name.lower() or "logo" in ref_path.stem.lower():
            print(
                f"AVISO: {ref_path.name} parece ser um logo. O logo não entra na imagem estática — "
                "ele vai separado para o Seedance. Pulando esta referência.",
                file=sys.stderr,
            )
            continue
        uuid = upload_reference(ref_path)
        if uuid:
            uploaded.append(uuid)

    model = model_name()
    args = [
        "higgsfield", "generate", "create", model,
        "--prompt", prompt,
        "--aspect_ratio", aspect_ratio,
        "--resolution", resolution,
        "--quality", quality,
        "--json",
    ]
    for uuid in uploaded:
        args.extend(["--image", uuid])

    create = run_cmd(args, timeout=300)
    job_id = first_uuid(create.stdout)
    if not job_id:
        print(f"ERRO: o Higgsfield não retornou job_id. Saída: {create.stdout[:1200]}", file=sys.stderr)
        return 1

    wait = run_cmd(["higgsfield", "generate", "wait", job_id, "--timeout", "30m", "--json"], timeout=2100)
    combined = create.stdout + "\n" + wait.stdout
    image_url = first_url(combined)
    if not image_url:
        print(f"ERRO: o Higgsfield não retornou URL de imagem. Saída: {combined[:1600]}", file=sys.stderr)
        return 1

    out_path = out_dir / output_name
    try:
        with urllib.request.urlopen(image_url, timeout=180) as resp:
            image_bytes = resp.read()
        out_path.write_bytes(image_bytes)
    except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError) as exc:
        print(f"ERRO ao baixar a imagem gerada: {exc}", file=sys.stderr)
        return 1

    metadata = {
        "status": "ok",
        "created_at": now_iso(),
        "provider": "higgsfield_cli",
        "model": model,
        "job_id": job_id,
        "aspect_ratio": aspect_ratio,
        "resolution": resolution,
        "quality": quality,
        "prompt_file": str(prompt_path),
        "output_path": str(out_path),
        "output_size_kb": len(image_bytes) // 1024,
        "higgsfield_url": image_url,
        "references": [str(Path(r).expanduser().resolve()) for r in references],
        "reference_uuids": uploaded,
    }
    (logs_dir / f"{out_path.stem}.json").write_text(
        json.dumps({**metadata, "stdout": combined[-5000:]}, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    emit(metadata)
    return 0


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(
        prog="gerar_frame.py",
        description="Gera a imagem estática do Human Motion via Higgsfield CLI + gpt_image_2.",
    )
    sub = parser.add_subparsers(dest="cmd", required=True)

    sub.add_parser("check", help="valida instalação e login do Higgsfield CLI")

    p = sub.add_parser("render", help="gera uma imagem a partir de um arquivo de prompt")
    p.add_argument("prompt_file", help="caminho do .txt com o prompt em inglês")
    p.add_argument("--aspect-ratio", default="9:16", choices=sorted(ASPECT_RATIOS))
    p.add_argument("--resolution", default="2k", choices=sorted(RESOLUTIONS))
    p.add_argument("--quality", default="high", choices=sorted(QUALITIES))
    p.add_argument("--output-dir", required=True)
    p.add_argument("--output-name", default="frame-01.png")
    p.add_argument("--reference", action="append", default=[], help="imagem de referência (repetível)")

    args = parser.parse_args(argv)
    if args.cmd == "check":
        return check_cli()
    return render(
        args.prompt_file,
        args.aspect_ratio,
        args.resolution,
        args.quality,
        args.output_dir,
        args.output_name,
        args.reference,
    )


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
