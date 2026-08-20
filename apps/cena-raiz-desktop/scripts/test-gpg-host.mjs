import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

import { gpgCandidates, gpgPath, gpgUnavailableMessage, isWindowsHost, resolveGpg } from './gpg-host.mjs';

// gpgPath: o gpg MSYS so entende /c/..., nunca C:\...
if (isWindowsHost) {
  assert.equal(gpgPath('C:\\Users\\dev\\arquivo.asc'), '/c/Users/dev/arquivo.asc');
  assert.equal(gpgPath('D:\\a\\_temp\\x'), '/d/a/_temp/x');
  assert.equal(gpgPath('relativo\\x'), 'relativo/x');
} else {
  assert.equal(gpgPath('/tmp/x.asc'), '/tmp/x.asc');
}

// CENA_RAIZ_MSYS2_GPG tem prioridade absoluta: quem aponta um gpg explicito
// nao pode ser silenciosamente redirecionado para outro.
const originalOverride = process.env.CENA_RAIZ_MSYS2_GPG;
try {
  process.env.CENA_RAIZ_MSYS2_GPG = 'C:\\gpg-de-mentira\\gpg.exe';
  if (isWindowsHost) {
    assert.deepEqual(gpgCandidates(), ['C:\\gpg-de-mentira\\gpg.exe']);
  } else {
    assert.deepEqual(gpgCandidates(), ['gpg']);
  }

  delete process.env.CENA_RAIZ_MSYS2_GPG;
  const candidates = gpgCandidates();
  if (isWindowsHost) {
    assert.equal(candidates[0], 'C:\\msys64\\usr\\bin\\gpg.exe', 'MSYS2 continua sendo o primeiro');
    // O motivo do fallback existir: numa maquina sem MSYS2, o Git for Windows
    // ja traz um gpg com a mesma convencao de caminho.
    const gitGpg = candidates.find((candidate) => /\\Git\\usr\\bin\\gpg\.exe$/iu.test(candidate));
    const gitOnPath = (process.env.PATH ?? '')
      .split(path.delimiter)
      .some((entry) => entry && existsSync(path.join(entry.trim(), 'git.exe')));
    if (gitOnPath) {
      assert.ok(gitGpg, `Git no PATH mas nenhum candidato do Git: ${candidates.join(', ')}`);
    }
    for (const candidate of candidates) {
      assert.ok(path.isAbsolute(candidate), `candidato precisa ser absoluto: ${candidate}`);
    }
  } else {
    assert.deepEqual(candidates, ['gpg']);
  }
} finally {
  if (originalOverride === undefined) delete process.env.CENA_RAIZ_MSYS2_GPG;
  else process.env.CENA_RAIZ_MSYS2_GPG = originalOverride;
}

// A mensagem de erro precisa citar a variavel de escape; sem isso o usuario
// nao tem como saber que existe uma saida.
const message = gpgUnavailableMessage('a release do yt-dlp');
assert.ok(message.includes('a release do yt-dlp'));
if (isWindowsHost) {
  assert.ok(message.includes('CENA_RAIZ_MSYS2_GPG'), 'a saida documentada precisa aparecer no erro');
  assert.ok(message.includes('Git for Windows'), 'o caminho mais provavel precisa aparecer no erro');
}

// Se esta maquina tem algum gpg aceito, ele precisa responder de verdade.
const resolved = resolveGpg();
if (resolved) {
  const probe = spawnSync(resolved, ['--version'], { encoding: 'utf8' });
  assert.equal(probe.status, 0, `gpg resolvido nao executou: ${resolved}`);
  assert.ok(/gpg \(GnuPG\)/u.test(probe.stdout), `saida inesperada de ${resolved}`);
  console.log(`gpg-host: resolvido ${resolved}`);
} else {
  console.log('gpg-host: nenhum gpg compativel nesta maquina (verificacoes de assinatura vao falhar cedo)');
}

console.log('test-gpg-host OK');
