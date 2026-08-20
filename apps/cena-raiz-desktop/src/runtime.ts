import { createHash } from 'node:crypto';
import { constants, existsSync, accessSync } from 'node:fs';
import path from 'node:path';
import manifest from '../resources/runtime-manifest.json';
import type { RuntimeName } from './shared';

// Chave do pacote de runtimes sob demanda: muda quando qualquer versao do
// manifest mudar, e por isso o aplicativo re-baixa o pacote so nesse caso.
// scripts/pack-runtimes.mjs computa a MESMA chave lendo o arquivo do manifest;
// qualquer mudanca aqui precisa ser espelhada la.
export function runtimePackKey(): string {
  return createHash('sha256')
    .update(JSON.stringify(manifest.runtimes))
    .digest('hex')
    .slice(0, 12);
}

export type RuntimeResolution = {
  name: RuntimeName;
  command: string | null;
  argsPrefix: string[];
  expectedVersion: string;
  source: 'bundled' | 'system' | 'missing';
};

type RuntimeContext = {
  appPath: string;
  resourcesPath: string;
  isPackaged: boolean;
  platform: NodeJS.Platform;
  arch: string;
  // Raiz do pacote de runtimes baixado sob demanda (userData/runtime/tools).
  // Tem prioridade sobre os resources: o instalador magro nao embarca as
  // ferramentas, e no desenvolvimento os resources continuam valendo.
  toolsRoot?: string | null;
  // Entradas do PATH usadas apenas pelo fallback de desenvolvimento. Fica no
  // contexto para os testes nao precisarem mexer no ambiente do processo.
  pathEntries?: string[] | null;
};

const expectedVersions: Record<RuntimeName, string> = {
  node: manifest.runtimes.node.version,
  npm: manifest.runtimes.npm.version,
  ffmpeg: manifest.runtimes.ffmpeg.version,
  ffprobe: manifest.runtimes.ffprobe.version,
  uv: manifest.runtimes.uv.version,
  'yt-dlp': manifest.runtimes['yt-dlp'].version,
  python: manifest.runtimes.python.version,
  whisperx: manifest.runtimes.whisperx.version,
  'codex-app-server': manifest.runtimes['codex-app-server'].version,
};

function isExecutable(filePath: string): boolean {
  if (!existsSync(filePath)) return false;
  try {
    accessSync(filePath, constants.X_OK);
    return true;
  } catch {
    return process.platform === 'win32';
  }
}

function pathDirectories(context: RuntimeContext): string[] {
  const entries =
    context.pathEntries ??
    (process.env.PATH ?? process.env.Path ?? '').split(path.delimiter);
  return entries
    .map((entry) => entry.trim().replace(/^"|"$/gu, ''))
    .filter((entry) => entry.length > 0);
}

function findOnPath(fileName: string, context: RuntimeContext): string | null {
  for (const directory of pathDirectories(context)) {
    const candidate = path.join(directory, fileName);
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

// O Node 20.12+ (e o Node 22 embutido no Electron) recusa spawnar .cmd/.bat
// sem shell por causa do CVE-2024-27980, entao "npm.cmd" daria sempre
// spawn EINVAL. Resolvemos o npm do sistema no MESMO formato do npm
// empacotado — node.exe mais npm-cli.js — que e um executavel de verdade e
// dispensa shell (e as aspas do cmd.exe que viriam junto).
function systemNpmResolution(context: RuntimeContext): RuntimeResolution | null {
  const nodeExecutable = findOnPath('node.exe', context);
  if (!nodeExecutable) return null;
  const directories = [path.dirname(nodeExecutable)];
  const npmShim = findOnPath('npm.cmd', context);
  if (npmShim) directories.push(path.dirname(npmShim));
  for (const directory of directories) {
    const npmCli = path.join(directory, 'node_modules', 'npm', 'bin', 'npm-cli.js');
    if (existsSync(npmCli)) {
      return {
        name: 'npm',
        command: nodeExecutable,
        argsPrefix: [npmCli],
        expectedVersion: expectedVersions.npm,
        source: 'system',
      };
    }
  }
  return null;
}

function candidateRoots(context: RuntimeContext): string[] {
  const resourcesRoot = context.isPackaged
    ? context.resourcesPath
    : path.join(context.appPath, 'resources');
  const suffix = `${context.platform}-${context.arch}`;
  const roots: string[] = [];
  if (context.toolsRoot) roots.push(path.join(context.toolsRoot, suffix));
  roots.push(path.join(resourcesRoot, 'runtimes', suffix));
  return roots;
}

function bundledResolution(
  name: RuntimeName,
  context: RuntimeContext,
): RuntimeResolution | null {
  for (const root of candidateRoots(context)) {
    const found = resolutionAtRoot(name, root, context);
    if (found) return found;
  }
  return null;
}

function resolutionAtRoot(
  name: RuntimeName,
  root: string,
  context: RuntimeContext,
): RuntimeResolution | null {
  const isWindows = context.platform === 'win32';
  const nodeExecutable = path.join(root, 'node', isWindows ? 'node.exe' : 'bin/node');

  if (name === 'node' && isExecutable(nodeExecutable)) {
    return {
      name,
      command: nodeExecutable,
      argsPrefix: [],
      expectedVersion: expectedVersions[name],
      source: 'bundled',
    };
  }

  if (name === 'npm') {
    const npmCli = path.join(
      root,
      'node',
      isWindows ? 'node_modules/npm/bin/npm-cli.js' : 'lib/node_modules/npm/bin/npm-cli.js',
    );
    if (isExecutable(nodeExecutable) && existsSync(npmCli)) {
      return {
        name,
        command: nodeExecutable,
        argsPrefix: [npmCli],
        expectedVersion: expectedVersions[name],
        source: 'bundled',
      };
    }
  }

  if (name === 'ffmpeg' || name === 'ffprobe') {
    const executable = path.join(
      root,
      'ffmpeg',
      'bin',
      `${name}${isWindows ? '.exe' : ''}`,
    );
    if (isExecutable(executable)) {
      return {
        name,
        command: executable,
        argsPrefix: [],
        expectedVersion: expectedVersions[name],
        source: 'bundled',
      };
    }
  }

  if (name === 'uv') {
    const executable = path.join(root, 'uv', 'bin', `uv${isWindows ? '.exe' : ''}`);
    if (isExecutable(executable)) {
      return {
        name,
        command: executable,
        argsPrefix: [],
        expectedVersion: expectedVersions[name],
        source: 'bundled',
      };
    }
  }

  if (name === 'yt-dlp') {
    const executable = path.join(
      root,
      'yt-dlp',
      'bin',
      `yt-dlp${isWindows ? '.exe' : ''}`,
    );
    if (isExecutable(executable)) {
      return {
        name,
        command: executable,
        argsPrefix: [],
        expectedVersion: expectedVersions[name],
        source: 'bundled',
      };
    }
  }

  if (name === 'python' || name === 'whisperx') {
    const executable = path.join(
      root,
      'python-whisperx',
      'python',
      isWindows ? 'python.exe' : 'bin/python3.12',
    );
    if (isExecutable(executable)) {
      return {
        name,
        command: executable,
        // A signed macOS app must remain immutable after launch. Python's -B
        // mode prevents imports from creating or updating __pycache__ files
        // inside the bundled runtime (and is harmless on Windows).
        argsPrefix: ['-B'],
        expectedVersion: expectedVersions[name],
        source: 'bundled',
      };
    }
  }

  if (name === 'codex-app-server') {
    const executable = path.join(
      root,
      'codex-app-server',
      'bin',
      `codex-app-server${isWindows ? '.exe' : ''}`,
    );
    if (isExecutable(executable)) {
      return {
        name,
        command: executable,
        argsPrefix: [],
        expectedVersion: expectedVersions[name],
        source: 'bundled',
      };
    }
  }

  return null;
}

export function resolveRuntime(
  name: RuntimeName,
  context: RuntimeContext,
): RuntimeResolution {
  const bundled = bundledResolution(name, context);
  if (bundled) return bundled;

  // Production never silently depends on software installed by the user. The
  // PATH fallback exists only while developing the desktop shell.
  if (!context.isPackaged) {
    if (context.platform === 'win32' && name === 'npm') {
      // Sem node.exe e npm-cli.js no PATH nao ha como spawnar npm sem shell;
      // 'missing' produz um erro por runtime em vez de um EINVAL opaco.
      return (
        systemNpmResolution(context) ?? {
          name,
          command: null,
          argsPrefix: [],
          expectedVersion: expectedVersions[name],
          source: 'missing',
        }
      );
    }
    return {
      name,
      command: name,
      argsPrefix: [],
      expectedVersion: expectedVersions[name],
      source: 'system',
    };
  }

  return {
    name,
    command: null,
    argsPrefix: [],
    expectedVersion: expectedVersions[name],
    source: 'missing',
  };
}
