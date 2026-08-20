// Fronteira de serializacao do AudiovisualDirectionPlan.
//
// Todo plano que vai para disco, IPC ou agente passa por aqui. Nenhum outro
// modulo deve chamar JSON.stringify num plano diretamente.
//
// Por que uma fronteira em vez de corrigir em quem constroi:
//
//   `JSON.stringify` descarta chaves com valor `undefined`. Um plano com
//   `{ audience: undefined }` vira `{}` no disco. Ao reler, o objeto nao e mais
//   igual ao original.
//
//   O plano carrega `timelineFingerprint`, `transcriptFingerprint` e
//   `assetRegistryVersion` exatamente para decidir se uma analise cara pode ser
//   reaproveitada. Comparacao com falso-diferente faria o sistema reanalisar
//   midia inalterada — o oposto do criterio de sucesso do MVP:
//   "uma revisao nao exige reanalisar midia inalterada".
//
//   Corrigir apenas no construtor deixa o buraco aberto para planos vindos do
//   modelo, do disco ou de uma revisao feita em outro lugar. Normalizar na
//   fronteira fecha todos os caminhos de uma vez.

import type { AudiovisualDirectionPlan } from '../../domain/direction/audiovisual-direction-plan';

/**
 * Remove chaves com `undefined`, recursivamente.
 *
 * Preserva `null`: `null` sobrevive ao JSON e significa "declarado como ausente",
 * o que e diferente de "nao declarado".
 */
export function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((v) => stripUndefined(v)) as unknown as T;
  }
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v === undefined) continue;
      out[k] = stripUndefined(v);
    }
    return out as T;
  }
  return value;
}

/**
 * Forma canonica do plano: o que sobrevive a uma ida e volta ao disco.
 *
 * `normalizePlan(p)` e sempre igual a `JSON.parse(JSON.stringify(p))`, e por
 * isso pode ser comparado com seguranca contra um plano lido do disco.
 */
export function normalizeDirectionPlan(plan: AudiovisualDirectionPlan): AudiovisualDirectionPlan {
  return stripUndefined(plan);
}

/**
 * Serializa para gravacao. Indentado de proposito: o plano e artefato revisavel
 * por humano e entra em diff de revisao.
 */
export function serializeDirectionPlan(plan: AudiovisualDirectionPlan): string {
  return `${JSON.stringify(normalizeDirectionPlan(plan), null, 2)}\n`;
}

/**
 * Verdadeiro quando dois planos sao equivalentes depois de normalizados.
 *
 * Usado para decidir se algo mudou de fato antes de gravar nova versao ou
 * disparar reanalise.
 */
export function directionPlansAreEquivalent(
  a: AudiovisualDirectionPlan,
  b: AudiovisualDirectionPlan,
): boolean {
  return JSON.stringify(normalizeDirectionPlan(a)) === JSON.stringify(normalizeDirectionPlan(b));
}
