#!/usr/bin/env python3
"""
Human Motion — gerador do vídeo (etapa 2).

Recebe o prompt escrito pelo Claude e as imagens aprovadas, sobe tudo para o
Higgsfield, dispara o job no Seedance 2.0, espera terminar e baixa o MP4.

Ordem das imagens importa: os frames primeiro, depois o produto, o logo por
último — o prompt se refere a "the attached logo image" no bloco do outro.

Todo motion sai com áudio: --sound tem padrão "on". Se o modelo não aceitar
esse parâmetro, o script tenta de novo sem ele e registra isso no log.

Uso:
    python3 scripts/gerar_motion.py check

    python3 scripts/gerar_motion.py cost "output/slug/02-motion/prompt-seedance.txt" \
        --duration 15 --resolution 1080p --aspect-ratio 9:16

    python3 scripts/gerar_motion.py render "output/slug/02-motion/prompt-seedance.txt" \
        --frame "output/slug/01-frame/frame-01.png" \
        --logo "assets/logo/logo.png" \
        --duration 15 --resolution 1080p --aspect-ratio 9:16 \
        --output-dir "output/slug/02-motion" --output-name "motion-01.mp4"
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
VIDEO_URL_RE = re.compile(r"https://[^ \"']+\.mp4(?:\?[^ \"']*)?", re.I)

ASPECT_RATIOS = {"auto", "16:9", "9:16", "4:3", "3:4", "1:1", "21:9"}
RESOLUTIONS = {"480p", "720p", "1080p"}
GENRES = {"auto", "action", "horror", "comedy", "noir", "drama", "epic"}
MODES = {"std", "fast"}
SOUNDS = {"on", "off"}
DURATION_MIN, DURATION_MAX = 4, 15


def model_name() -> str:
    """seedance_2_0 é o modelo padrão da etapa 2."""
    return os.environ.get("HUMAN_MOTION_VIDEO_MODEL", "seedance_2_0")


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


def first_video_url(text: str) -> str | None:
    match = VIDEO_URL_RE.search(text)
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


def validate(aspect_ratio: str, resolution: str, duration: int, genre: str, mode: str, sound: str) -> int:
    if aspect_ratio not in ASPECT_RATIOS:
        print(f"ERRO: aspect ratio inválido: {aspect_ratio}. Use: {', '.join(sorted(ASPECT_RATIOS))}", file=sys.stderr)
        return 1
    if resolution not in RESOLUTIONS:
        print(f"ERRO: resolução inválida: {resolution}. Use: 480p, 720p ou 1080p.", file=sys.stderr)
        return 1
    if not DURATION_MIN <= duration <= DURATION_MAX:
        print(f"ERRO: duração fora do suportado: {duration}s. O Seedance aceita de {DURATION_MIN} a {DURATION_MAX}s.", file=sys.stderr)
        return 1
    if genre not in GENRES:
        print(f"ERRO: genre inválido: {genre}. Use: {', '.join(sorted(GENRES))}", file=sys.stderr)
        return 1
    if mode not in MODES:
        print(f"ERRO: mode inválido: {mode}. Use: std (final) ou fast (preview).", file=sys.stderr)
        return 1
    if sound not in SOUNDS:
        print(f"ERRO: sound inválido: {sound}. Use: on ou off.", file=sys.stderr)
        return 1
    return 0


def read_prompt(prompt_file: str) -> str | None:
    prompt_path = Path(prompt_file).expanduser().resolve()
    if not prompt_path.exists():
        print(f"ERRO: arquivo de prompt não existe: {prompt_path}", file=sys.stderr)
        return None
    prompt = prompt_path.read_text(encoding="utf-8").strip()
    if not prompt:
        print(f"ERRO: o arquivo de prompt está vazio: {prompt_path}", file=sys.stderr)
        return None
    return prompt


def upload(path: Path, rotulo: str) -> str | None:
    print(f"Subindo {rotulo}: {path.name}...", file=sys.stderr)
    result = run_cmd(["higgsfield", "upload", "create", str(path)], timeout=300)
    uuid = first_uuid(result.stdout)
    if not uuid:
        print(f"ERRO: não consegui extrair o UUID do upload de {path.name}. Saída: {result.stdout[:600]}", file=sys.stderr)
    return uuid


def collect_images(frames: list[str], produto: list[str], logo: str | None) -> tuple[list[str], list[dict]] | None:
    """Sobe as imagens na ordem que o prompt espera: frames, produto, logo."""
    uuids: list[str] = []
    manifest: list[dict] = []

    ordered: list[tuple[str, str]] = []
    ordered += [("frame", f) for f in frames]
    ordered += [("produto", p) for p in produto]
    if logo:
        ordered.append(("logo", logo))

    for rotulo, raw in ordered:
        path = Path(raw).expanduser().resolve()
        if not path.exists():
            print(f"ERRO: {rotulo} não existe: {path}", file=sys.stderr)
            return None
        uuid = upload(path, rotulo)
        if not uuid:
            return None
        uuids.append(uuid)
        manifest.append({"papel": rotulo, "arquivo": str(path), "uuid": uuid})

    return uuids, manifest


def base_args(prompt: str, aspect_ratio: str, resolution: str, duration: int, genre: str, mode: str) -> list[str]:
    """Params comuns a cost e create. O --sound é adicionado à parte: nem todo
    build do modelo aceita, então ele precisa ser removível no retry."""
    return [
        "--prompt", prompt,
        "--aspect_ratio", aspect_ratio,
        "--resolution", resolution,
        "--duration", str(duration),
        "--genre", genre,
        "--mode", mode,
    ]


def cost(prompt_file: str, aspect_ratio: str, resolution: str, duration: int, genre: str, mode: str, sound: str) -> int:
    if validate(aspect_ratio, resolution, duration, genre, mode, sound) != 0:
        return 1
    status = check_cli()
    if status != 0:
        return status
    prompt = read_prompt(prompt_file)
    if prompt is None:
        return 1

    args = ["higgsfield", "generate", "cost", model_name()]
    args += base_args(prompt, aspect_ratio, resolution, duration, genre, mode)
    args += ["--sound", sound, "--json"]
    result = run_cmd(args, timeout=180)
    if result.returncode != 0:
        # Modelo pode não expor --sound; reestima sem ele para não travar a resposta.
        retry = run_cmd(
            ["higgsfield", "generate", "cost", model_name()]
            + base_args(prompt, aspect_ratio, resolution, duration, genre, mode)
            + ["--json"],
            timeout=180,
        )
        if retry.returncode == 0:
            result = retry

    emit({
        "status": "ok" if result.returncode == 0 else "erro",
        "model": model_name(),
        "resolution": resolution,
        "duration": duration,
        "mode": mode,
        "sound": sound,
        "detail": result.stdout.strip()[:1200],
    })
    return 0 if result.returncode == 0 else 1


def render(
    prompt_file: str,
    frames: list[str],
    produto: list[str],
    logo: str | None,
    aspect_ratio: str,
    resolution: str,
    duration: int,
    genre: str,
    mode: str,
    sound: str,
    output_dir: str,
    output_name: str,
) -> int:
    if validate(aspect_ratio, resolution, duration, genre, mode, sound) != 0:
        return 1
    if not frames:
        print("ERRO: passe pelo menos um --frame (a imagem aprovada da etapa 1).", file=sys.stderr)
        return 1

    status = check_cli()
    if status != 0:
        return status

    prompt = read_prompt(prompt_file)
    if prompt is None:
        return 1

    if not logo:
        print(
            "AVISO: nenhum --logo informado. O motion vai terminar sem assinatura de marca.",
            file=sys.stderr,
        )

    out_dir = Path(output_dir).expanduser().resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    logs_dir = out_dir / "_logs"
    logs_dir.mkdir(exist_ok=True)

    collected = collect_images(frames, produto, logo)
    if collected is None:
        return 1
    uuids, manifest = collected

    def build_args(com_som: bool) -> list[str]:
        built = ["higgsfield", "generate", "create", model_name()]
        built += base_args(prompt, aspect_ratio, resolution, duration, genre, mode)
        if com_som:
            built += ["--sound", sound]
        for uuid in uuids:
            built.extend(["--image", uuid])
        return built + ["--json"]

    print(
        f"Gerando o vídeo ({duration}s, {resolution}, {aspect_ratio}, mode {mode}, som {sound})...",
        file=sys.stderr,
    )
    create = run_cmd(build_args(com_som=True), timeout=600)
    job_id = first_uuid(create.stdout)
    som_aplicado = sound

    if not job_id:
        # O modelo pode não expor --sound neste build. Tenta uma vez sem o param
        # antes de desistir — o áudio pode vir do próprio modelo mesmo assim.
        print(
            "AVISO: a chamada com --sound falhou. Tentando de novo sem esse parâmetro...",
            file=sys.stderr,
        )
        retry = run_cmd(build_args(com_som=False), timeout=600)
        job_id = first_uuid(retry.stdout)
        if job_id:
            create = retry
            som_aplicado = "modelo (param --sound não aceito)"
        else:
            print(
                "ERRO: o Higgsfield não retornou job_id.\n"
                f"Com --sound: {create.stdout[:800]}\n"
                f"Sem --sound: {retry.stdout[:800]}",
                file=sys.stderr,
            )
            return 1

    print(f"Job {job_id} na fila. Renderizando — isso leva alguns minutos...", file=sys.stderr)
    wait = run_cmd(["higgsfield", "generate", "wait", job_id, "--timeout", "30m", "--json"], timeout=2100)
    combined = create.stdout + "\n" + wait.stdout
    video_url = first_video_url(wait.stdout) or first_video_url(combined)
    if not video_url:
        print(f"ERRO: o Higgsfield não retornou URL de vídeo. Saída: {combined[:1600]}", file=sys.stderr)
        return 1

    out_path = out_dir / output_name
    try:
        with urllib.request.urlopen(video_url, timeout=600) as resp:
            video_bytes = resp.read()
        out_path.write_bytes(video_bytes)
    except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError) as exc:
        print(f"ERRO ao baixar o vídeo gerado: {exc}", file=sys.stderr)
        return 1

    metadata = {
        "status": "ok",
        "created_at": now_iso(),
        "provider": "higgsfield_cli",
        "model": model_name(),
        "job_id": job_id,
        "aspect_ratio": aspect_ratio,
        "resolution": resolution,
        "duration": duration,
        "genre": genre,
        "mode": mode,
        "sound": som_aplicado,
        "prompt_file": str(Path(prompt_file).expanduser().resolve()),
        "output_path": str(out_path),
        "output_size_mb": round(len(video_bytes) / (1024 * 1024), 2),
        "higgsfield_url": video_url,
        "imagens_enviadas": manifest,
    }
    (logs_dir / f"{out_path.stem}.json").write_text(
        json.dumps({**metadata, "stdout": combined[-6000:]}, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    emit(metadata)
    return 0


def add_common_flags(p: argparse.ArgumentParser) -> None:
    p.add_argument("--aspect-ratio", default="9:16", choices=sorted(ASPECT_RATIOS))
    p.add_argument("--resolution", default="1080p", choices=sorted(RESOLUTIONS))
    p.add_argument("--duration", type=int, default=15, help=f"segundos, de {DURATION_MIN} a {DURATION_MAX}")
    p.add_argument("--genre", default="auto", choices=sorted(GENRES))
    p.add_argument("--mode", default="std", choices=sorted(MODES), help="std = final, fast = preview")
    p.add_argument("--sound", default="on", choices=sorted(SOUNDS),
                   help="padrão do projeto: on — todo motion sai com áudio")


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(
        prog="gerar_motion.py",
        description="Gera o vídeo do Human Motion via Higgsfield CLI + Seedance 2.0.",
    )
    sub = parser.add_subparsers(dest="cmd", required=True)

    sub.add_parser("check", help="valida instalação e login do Higgsfield CLI")

    p_cost = sub.add_parser("cost", help="estima os créditos sem gerar nada")
    p_cost.add_argument("prompt_file")
    add_common_flags(p_cost)

    p = sub.add_parser("render", help="gera o vídeo")
    p.add_argument("prompt_file", help="caminho do .txt com o prompt do Seedance")
    p.add_argument("--frame", action="append", default=[], required=False,
                   help="imagem aprovada da etapa 1 (repetível: 1 ou 2 frames)")
    p.add_argument("--produto", action="append", default=[], help="imagem de produto (repetível)")
    p.add_argument("--logo", default=None, help="logo do cliente — entra no fecho do motion")
    add_common_flags(p)
    p.add_argument("--output-dir", required=True)
    p.add_argument("--output-name", default="motion-01.mp4")

    args = parser.parse_args(argv)
    if args.cmd == "check":
        return check_cli()
    if args.cmd == "cost":
        return cost(args.prompt_file, args.aspect_ratio, args.resolution, args.duration,
                    args.genre, args.mode, args.sound)
    return render(
        args.prompt_file,
        args.frame,
        args.produto,
        args.logo,
        args.aspect_ratio,
        args.resolution,
        args.duration,
        args.genre,
        args.mode,
        args.sound,
        args.output_dir,
        args.output_name,
    )


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
