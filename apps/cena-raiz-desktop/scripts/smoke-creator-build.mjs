import { spawn } from 'node:child_process';
import { mkdir, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const platformKey = `${process.platform}-${process.arch}`;
if (process.platform !== 'win32') {
  console.error('smoke:creator esta fase comprova apenas win32-x64.');
  process.exit(1);
}

const executable = path.join(projectRoot, 'out', `cena-raiz-${platformKey}`, 'cena-raiz.exe');
const artifactDirectory = path.join(projectRoot, 'out', 'creator', platformKey);
const reportPath = path.join(artifactDirectory, 'creator-smoke.json');
await mkdir(artifactDirectory, { recursive: true });
await rm(reportPath, { force: true });

const outcome = await new Promise((resolve) => {
  const child = spawn(executable, [], {
    cwd: path.dirname(executable),
    env: {
      ...process.env,
      CENA_RAIZ_QA_REPORT_PATH: reportPath,
      ELECTRON_ENABLE_LOGGING: '1',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
  let stderr = '';
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (chunk) => { stderr += chunk; });
  const timeout = setTimeout(() => {
    child.kill();
    resolve({ ok: false, error: 'aplicativo nao encerrou o smoke em 45 segundos' });
  }, 45_000);
  child.on('error', (error) => {
    clearTimeout(timeout);
    resolve({ ok: false, error: error.message });
  });
  child.on('close', (code) => {
    clearTimeout(timeout);
    resolve({ ok: code === 0, error: stderr.trim().split(/\r?\n/u).at(-1) ?? `codigo ${code}` });
  });
});

let report = null;
try {
  report = JSON.parse(await readFile(reportPath, 'utf8'));
} catch {
  report = null;
}
const validSurface = report?.surface === 'member-gate' || report?.surface === 'studio-shell';
if (
  !outcome.ok ||
  report?.schemaVersion !== 1 ||
  report?.ready !== true ||
  !validSurface ||
  !Number.isInteger(report?.rootChildren) || report.rootChildren < 1 ||
  report?.bodyWidth < 800 || report?.bodyHeight < 600
) {
  console.error(`smoke:creator falhou: ${outcome.error || JSON.stringify(report)}`);
  process.exit(1);
}
console.log(
  `smoke:creator ok — renderer ${report.surface}, raiz ${report.rootChildren}, ` +
  `${report.bodyWidth}x${report.bodyHeight}.`,
);
