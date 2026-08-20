// Resolucao do gpg usado para conferir assinaturas de release (yt-dlp e
// FFmpeg) na maquina que faz o staging.
//
// No Windows os gpg "de runtime" que aparecem no PATH (o do Chocolatey, o do
// Gpg4win) mutilam caminhos com letra de drive: recebem C:\Users\... e tentam
// abrir /d/a/...C:\Users\... Por isso NAO usamos o PATH: procuramos
// deterministicamente um gpg de linhagem MSYS2, que entende a convencao
// /c/... aplicada por gpgPath(). Sao aceitos, nesta ordem:
//
//   1. CENA_RAIZ_MSYS2_GPG — caminho explicito, tem prioridade absoluta;
//   2. C:\msys64\usr\bin\gpg.exe — o MSYS2 que o workflow de CI instala;
//   3. o gpg que vem no Git for Windows (usr\bin\gpg.exe), procurado nas
//      instalacoes padrao e ao lado do git.exe do PATH.
//
// O item 3 e o que faz o staging funcionar numa maquina de desenvolvimento
// limpa, onde ninguem instalou MSYS2 mas o Git existe.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

export const isWindowsHost = process.platform === 'win32';

// Converte C:\Users\x para /c/Users/x, a unica forma que o gpg MSYS entende.
export function gpgPath(value) {
  if (!isWindowsHost) return value;
  return value
    .replace(/^([A-Za-z]):[\\/]/u, (_match, drive) => `/${drive.toLowerCase()}/`)
    .replaceAll('\\', '/');
}

function gitForWindowsRoots() {
  const roots = [];
  for (const base of [
    process.env.ProgramFiles,
    process.env['ProgramFiles(x86)'],
    process.env.ProgramW6432,
    process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Programs') : null,
  ]) {
    if (base) roots.push(path.join(base, 'Git'));
  }
  // git.exe vive em <raiz>\cmd\git.exe (ou <raiz>\bin\git.exe); o gpg fica em
  // <raiz>\usr\bin\gpg.exe. Achar o git no PATH cobre instalacao portatil.
  for (const entry of (process.env.PATH ?? '').split(path.delimiter)) {
    const directory = entry.trim().replace(/^"|"$/gu, '');
    if (!directory) continue;
    if (!existsSync(path.join(directory, 'git.exe'))) continue;
    roots.push(path.dirname(directory));
  }
  return roots;
}

// Exportado para o teste conseguir conferir a ordem sem depender do que esta
// instalado na maquina.
export function gpgCandidates() {
  if (!isWindowsHost) return ['gpg'];
  const explicit = process.env.CENA_RAIZ_MSYS2_GPG;
  if (explicit) return [explicit];
  const found = [
    'C:\\msys64\\usr\\bin\\gpg.exe',
    ...gitForWindowsRoots().map((root) => path.join(root, 'usr', 'bin', 'gpg.exe')),
  ];
  // O PATH costuma trazer <Git>\cmd e <Git>\mingw64\bin, gerando repeticoes.
  return [...new Set(found)];
}

function works(command) {
  return spawnSync(command, ['--version'], { stdio: 'ignore' }).status === 0;
}

let cached;

// Devolve o caminho do gpg utilizavel, ou null quando nenhum candidato responde.
export function resolveGpg() {
  if (cached !== undefined) return cached;
  const seen = new Set();
  for (const candidate of gpgCandidates()) {
    if (seen.has(candidate)) continue;
    seen.add(candidate);
    if (works(candidate)) {
      cached = candidate;
      return cached;
    }
  }
  cached = null;
  return cached;
}

export function gpgUnavailableMessage(subject) {
  if (!isWindowsHost) {
    return `GnuPG ausente. Instale \`gpg\` para verificar ${subject}.`;
  }
  return [
    `GnuPG compativel ausente. Nao achei gpg para verificar ${subject}.`,
    'Procurei em C:\\msys64\\usr\\bin\\gpg.exe e no Git for Windows',
    '(<Git>\\usr\\bin\\gpg.exe). Instale o Git for Windows ou o MSYS2, ou',
    'aponte CENA_RAIZ_MSYS2_GPG para um gpg de linhagem MSYS2 — o gpg do PATH',
    '(Gpg4win/Chocolatey) nao serve: ele mutila caminhos com letra de drive.',
  ].join(' ');
}
