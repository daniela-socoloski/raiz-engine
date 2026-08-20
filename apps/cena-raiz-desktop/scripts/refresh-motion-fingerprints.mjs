// Recalcula o campo `fingerprint` de cada manifesto a partir do arquivo real.
//
// O fingerprint existe para detectar que um componente Remotion ou um audio
// mudou depois que o manifesto foi escrito. Isso so funciona se houver uma
// forma unica e obvia de recalcula-lo. Esta e a forma.
//
//   node scripts/refresh-motion-fingerprints.mjs          verifica e relata
//   node scripts/refresh-motion-fingerprints.mjs --write  grava os novos valores
//
// Sem --write o script nao altera nada e sai com codigo 1 se houver divergencia,
// que e como o teste e a integracao continua o usam.

import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestDir = path.join(root, 'resources', 'motion-assets', 'manifests');
const templateDir = path.join(root, 'resources', 'remotion-template');

export function fingerprintOf(absolutePath) {
  return 'sha256:' + createHash('sha256').update(readFileSync(absolutePath)).digest('hex').slice(0, 16);
}

function main({ write }) {
  const divergentes = [];
  const ausentes = [];

  for (const arquivo of readdirSync(manifestDir).filter((f) => f.endsWith('.json'))) {
    const caminho = path.join(manifestDir, arquivo);
    const manifesto = JSON.parse(readFileSync(caminho, 'utf8'));
    const rel = manifesto.source?.component ?? manifesto.source?.file;
    const origem = rel ? path.join(templateDir, rel) : null;

    if (!origem || !existsSync(origem)) {
      ausentes.push(`${manifesto.assetId} -> ${rel ?? '(sem origem)'}`);
      continue;
    }

    const atual = fingerprintOf(origem);
    if (atual === manifesto.fingerprint) continue;

    divergentes.push({ assetId: manifesto.assetId, rel, de: manifesto.fingerprint, para: atual });
    if (write) {
      manifesto.fingerprint = atual;
      writeFileSync(caminho, JSON.stringify(manifesto, null, 2) + '\n', 'utf8');
    }
  }

  for (const a of ausentes) console.error(`  ORIGEM AUSENTE  ${a}`);
  for (const d of divergentes) {
    const acao = write ? 'atualizado' : 'DIVERGENTE';
    console.error(`  ${acao}  ${d.assetId}  (${d.rel})  ${d.de} -> ${d.para}`);
  }

  if (ausentes.length) {
    console.error('\nUm manifesto aponta para arquivo que nao existe. Corrija a origem antes de continuar.');
    process.exit(1);
  }
  if (divergentes.length && !write) {
    console.error('\nO arquivo de origem mudou depois que o manifesto foi escrito.');
    console.error('Revise se o comportamento do asset ainda corresponde ao manifesto e rode:');
    console.error('  node scripts/refresh-motion-fingerprints.mjs --write');
    process.exit(1);
  }
  console.log(divergentes.length
    ? `fingerprints: ${divergentes.length} atualizado(s).`
    : 'fingerprints: todos conferem com os arquivos em disco.');
}

// Importado pelo teste apenas por fingerprintOf: nao execute a verificacao
// como efeito colateral do import.
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  main({ write: process.argv.includes('--write') });
}
