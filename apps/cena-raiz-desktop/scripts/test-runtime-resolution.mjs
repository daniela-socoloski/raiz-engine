// Regressao do spawn EINVAL: no Windows, o Node 20.12+ (e o Node 22 embutido
// no Electron) recusa spawnar .cmd/.bat sem shell por causa do CVE-2024-27980.
// O fallback de desenvolvimento resolvia npm como "npm.cmd" e o primeiro
// `npm install && npm start` numa maquina limpa quebrava antes de qualquer
// stage:*. Este teste compila src/runtime.ts e confere que nenhuma resolucao
// devolve um .cmd, e que o npm do sistema sai no formato node.exe + npm-cli.js.
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const desktopRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const work = mkdtempSync(path.join(tmpdir(), 'cena-raiz-runtime-'));

function compileRuntimeModule() {
  // tsc pelo .js do pacote, nunca pelo shim .cmd — o teste nao pode cair na
  // mesma armadilha que verifica.
  const tsc = path.join(desktopRoot, 'node_modules', 'typescript', 'bin', 'tsc');
  const result = spawnSync(
    process.execPath,
    [
      tsc,
      path.join('src', 'runtime.ts'),
      '--outDir', work,
      '--module', 'commonjs',
      '--moduleResolution', 'node',
      '--target', 'es2022',
      '--resolveJsonModule',
      '--esModuleInterop',
      '--skipLibCheck',
    ],
    { cwd: desktopRoot, encoding: 'utf8' },
  );
  assert.equal(result.status, 0, `tsc falhou:\n${result.stdout}\n${result.stderr}`);
  return createRequire(import.meta.url)(path.join(work, 'src', 'runtime.js'));
}

const RUNTIME_NAMES = [
  'node',
  'npm',
  'ffmpeg',
  'ffprobe',
  'uv',
  'yt-dlp',
  'python',
  'whisperx',
  'codex-app-server',
];

try {
  const { resolveRuntime } = compileRuntimeModule();
  // Raiz sem runtimes empacotados: forca o caminho de fallback.
  const bare = path.join(work, 'sem-runtimes');
  const devContext = {
    appPath: bare,
    resourcesPath: bare,
    isPackaged: false,
    platform: 'win32',
    arch: 'x64',
    toolsRoot: null,
  };

  // 1. Nenhuma resolucao no Windows pode apontar para um .cmd/.bat: o spawn
  //    sem shell lanca EINVAL de forma SINCRONA.
  for (const name of RUNTIME_NAMES) {
    const resolution = resolveRuntime(name, devContext);
    assert.ok(
      !/\.(cmd|bat)$/iu.test(resolution.command ?? ''),
      `${name} resolveu para um shim de shell: ${resolution.command}`,
    );
  }

  // 2. Sem node.exe no PATH nao ha como spawnar npm; o resultado precisa ser
  //    'missing' declarado, e nao um npm.cmd que estoura na cara do usuario.
  const semPath = resolveRuntime('npm', { ...devContext, pathEntries: [] });
  assert.equal(semPath.command, null);
  assert.equal(semPath.source, 'missing');

  // 3. Com um Node de verdade no PATH, npm sai no mesmo formato do empacotado:
  //    executavel real mais o caminho do npm-cli.js.
  const nodeDirectory = path.dirname(process.execPath);
  const comPath = resolveRuntime('npm', { ...devContext, pathEntries: [nodeDirectory] });
  if (comPath.command) {
    assert.equal(comPath.source, 'system');
    assert.equal(comPath.command, path.join(nodeDirectory, 'node.exe'));
    assert.equal(comPath.argsPrefix.length, 1);
    assert.match(comPath.argsPrefix[0], /npm-cli\.js$/u);

    // 4. E o principal: isso spawna sem shell, sem EINVAL.
    const exitCode = await new Promise((resolve) => {
      let child;
      try {
        child = spawn(comPath.command, [...comPath.argsPrefix, '--version'], {
          windowsHide: true,
          stdio: ['ignore', 'ignore', 'ignore'],
        });
      } catch (error) {
        assert.fail(`spawn do npm resolvido falhou: ${error.message}`);
      }
      child.on('error', (error) => assert.fail(`spawn do npm resolvido falhou: ${error.message}`));
      child.on('close', resolve);
    });
    assert.equal(exitCode, 0, 'npm resolvido nao respondeu a --version');
  } else {
    console.log('runtime-resolution: sem npm ao lado do node deste processo; item 3 pulado');
  }

  // 5. Fora do Windows o fallback continua sendo o nome puro do PATH.
  const posix = resolveRuntime('npm', { ...devContext, platform: 'linux' });
  assert.equal(posix.command, 'npm');
  assert.equal(posix.source, 'system');

  console.log('test-runtime-resolution OK');
} finally {
  rmSync(work, { recursive: true, force: true });
}
