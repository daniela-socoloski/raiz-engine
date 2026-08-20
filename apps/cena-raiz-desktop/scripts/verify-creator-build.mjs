import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { copyFile, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outRoot = path.join(projectRoot, 'out');
const platformKey = `${process.platform}-${process.arch}`;

function fail(message) {
  console.error(`creator: ${message}`);
  process.exit(1);
}

async function exists(filePath) {
  return Boolean(await stat(filePath).catch(() => null));
}

async function sha256(filePath) {
  const digest = createHash('sha256');
  await new Promise((resolve, reject) => {
    const stream = createReadStream(filePath);
    stream.on('data', (chunk) => digest.update(chunk));
    stream.on('end', resolve);
    stream.on('error', reject);
  });
  return digest.digest('hex');
}

const packageCandidates = (await readdir(outRoot, { withFileTypes: true }).catch(() => []))
  .filter((entry) => entry.isDirectory() && entry.name.endsWith(`-${platformKey}`))
  .map((entry) => path.join(outRoot, entry.name));
if (packageCandidates.length !== 1) {
  fail(`esperava um pacote *-${platformKey} em out; encontrei ${packageCandidates.length}`);
}
const packageRoot = packageCandidates[0];
const resourcesRoot = process.platform === 'darwin'
  ? path.join(packageRoot, 'cena-raiz.app', 'Contents', 'Resources')
  : path.join(packageRoot, 'resources');
const runtimeRoot = path.join(resourcesRoot, 'runtimes', platformKey);

const requiredRuntimeFiles = process.platform === 'win32'
  ? [
      'node/node.exe',
      'node/node_modules/npm/bin/npm-cli.js',
      'ffmpeg/bin/ffmpeg.exe',
      'ffmpeg/bin/ffprobe.exe',
      'uv/bin/uv.exe',
      'yt-dlp/bin/yt-dlp.exe',
      'python-whisperx/python/python.exe',
      'codex-app-server/bin/codex-app-server.exe',
    ]
  : [];
for (const relativePath of requiredRuntimeFiles) {
  if (!(await exists(path.join(runtimeRoot, relativePath)))) {
    fail(`runtime ausente no aplicativo empacotado: ${relativePath}`);
  }
}

const distributionPath = path.join(resourcesRoot, 'distribution-manifest.json');
if (!(await exists(distributionPath))) fail('distribution-manifest.json ausente do pacote');
const distribution = JSON.parse(await readFile(distributionPath, 'utf8'));
for (const [name, channel] of Object.entries(distribution.channels ?? {})) {
  const configuredUrl = channel.baseUrl ?? channel.feedUrl ?? '';
  if (configuredUrl && !configuredUrl.startsWith('https://')) {
    fail(`canal ${name} usa URL nao HTTPS`);
  }
  if (configuredUrl.includes('pub-89ee05cdaf26477c8984a36be2b373fa.r2.dev')) {
    fail(`canal ${name} ainda aponta para a infraestrutura herdada`);
  }
}

if (process.platform !== 'win32') {
  fail('o perfil creator comprovado nesta fase existe apenas para win32-x64');
}

const makeDirectory = path.join(outRoot, 'make', 'squirrel.windows', process.arch);
const makeFiles = await readdir(makeDirectory, { withFileTypes: true }).catch(() => []);
const setupEntry = makeFiles.find((entry) => entry.isFile() && /setup.*\.exe$|\.setup\.exe$/iu.test(entry.name));
if (!setupEntry) fail(`Setup.exe nao encontrado em ${makeDirectory}`);

const artifactDirectory = path.join(outRoot, 'creator', platformKey);
await mkdir(artifactDirectory, { recursive: true });
const copied = [];
for (const entry of makeFiles) {
  if (!entry.isFile() || (!/\.nupkg$/iu.test(entry.name) && entry.name !== 'RELEASES')) continue;
  const destination = path.join(artifactDirectory, entry.name);
  await copyFile(path.join(makeDirectory, entry.name), destination);
  copied.push(destination);
}
const setupDestination = path.join(artifactDirectory, 'CenaRaizSetup.exe');
await copyFile(path.join(makeDirectory, setupEntry.name), setupDestination);
copied.unshift(setupDestination);

const artifacts = [];
for (const filePath of copied) {
  const info = await stat(filePath);
  artifacts.push({
    file: path.basename(filePath),
    bytes: info.size,
    sha256: await sha256(filePath),
  });
}
const installInstructions = [
  'Raiz Engine — perfil creator win32-x64',
  '',
  'Mantenha estes tres arquivos juntos na mesma pasta:',
  '  - CenaRaizSetup.exe',
  '  - RELEASES',
  `  - ${artifacts.find((artifact) => artifact.file.endsWith('.nupkg'))?.file ?? '<pacote>.nupkg'}`,
  '',
  'Execute CenaRaizSetup.exe. O EXE pequeno e o bootstrap do Squirrel;',
  'o aplicativo e os runtimes estao no arquivo .nupkg ao lado dele.',
  '',
  'Este build local ainda nao possui assinatura de codigo nem canal de update.',
  '',
].join('\n');
await writeFile(path.join(artifactDirectory, 'INSTALAR.txt'), installInstructions, 'utf8');
const report = {
  schemaVersion: 1,
  profile: 'creator',
  target: platformKey,
  selfContainedRuntimes: true,
  distributionUnit: 'directory',
  entrypoint: 'CenaRaizSetup.exe',
  distributionOwner: distribution.owner,
  distributionChannels: distribution.channels,
  packageDirectory: path.relative(projectRoot, packageRoot).replaceAll('\\', '/'),
  artifacts,
};
await writeFile(
  path.join(artifactDirectory, 'creator-build.json'),
  `${JSON.stringify(report, null, 2)}\n`,
  'utf8',
);
await writeFile(
  `${setupDestination}.sha256`,
  `${artifacts[0].sha256}  CenaRaizSetup.exe\n`,
  'utf8',
);

console.log(`creator: ${path.relative(projectRoot, setupDestination)} pronto.`);
console.log(`creator: ${requiredRuntimeFiles.length} entradas de runtime verificadas no pacote.`);
