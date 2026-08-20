# Raiz Engine

Repositório técnico do motor criativo do Sistema Marca Raiz. Reúne inteligência de
marca, imagem, conteúdo editorial, vídeo, recipes e adapters de execução.

## Objetivo

Construir progressivamente o **Raiz Engine**: o núcleo próprio que transforma
inteligência de marca e intenção criativa em planos estruturados, seleciona
recursos, coordena os motores de execução e registra aprendizado.

O sistema atual já sabe produzir. O motor precisa aprender a dirigir antes de
mandar produzir.

## Fase atual

O projeto possui duas linhas de avanço que não devem mais usar a mesma numeração:

- **repositório:** Etapas 0–11 do guia de organização;
- **produto:** Fases 0–7 do roadmap do Raiz Engine.

**Gate do repositório:** Etapa 6 executada; Etapa 7 valida a consolidação física.

**Fase do produto:** Fase 0 — Install & Runtime Foundation, em construção.

| | |
|---|---|
| Etapas concluídas | 0, 1, 2, 3, 4, 5 e 6; Etapa 7 em validação |
| Executadas antecipadamente, sob autorização | 8 (baseline técnico), 9 (identidade, como `CLEAN CUT — ACCEPTED`), início da 10 (bootstrap) e esqueleto parcial da 11 (contratos de direção) |
| Primeiro commit | `231e746` — **`reconciled Raiz Engine baseline`**, 854 arquivos. Aceito como base da consolidação; não é o estado como recebido |
| Recuperação externa | backup completo e backup do Git intermediário, ambos verificados |
| Git LFS | **obrigatório** — 505 caminhos, 501 objetos, 398 MB. Clone sem LFS traz ponteiros, não os assets |
| Publicação Git | o remoto privado já contém o baseline e o histórico posterior; consultar `origin/main` para o tip atual e exigir autorização separada para cada novo push |
| Releases | **bloqueadas** até a publicação própria existir |
| Fase 0 do produto | bootstrap `developer`, `doctor` e manifest iniciais existem; instalador `creator`, skills/runtimes e prova em VM ainda faltam |
| Próxima capacidade central | Fase 1 — compilar `marca-raiz-prisma` em `BrandRuntimeProfile` revisável |

O estado detalhado de cada etapa está em
[GUIA-ORGANIZACAO-REPOSITORIO.md](GUIA-ORGANIZACAO-REPOSITORIO.md) § 4.1.

## Componentes

| Caminho | Papel |
|---|---|
| `skills/cena-raiz/` | skill audiovisual herdada e adaptada — método, helpers, templates, instalador |
| `apps/cena-raiz-desktop/` | aplicativo Electron herdado e adaptado — interface, timeline, runtimes, render |
| `marca-raiz-prisma/` | inteligência de marca. `inteligencias/` guarda kernel e método; `projetos/` é o corpus aplicado, preservado deliberadamente |
| `raiz-Images/` | direção e geração de imagens |
| `slide-raiz/` | narrativa editorial e carrosséis |
| `recipes/ads-produto/` | primeira recipe criativa especializada |
| `skills/architect-ai-systems.skill` | pacote versionado da skill de arquitetura; não é uma segunda implementação do Cena Raiz |
| `ASSETS/` | materiais visuais em catalogação |

Skill e desktop são as duas partes complementares da base adquirida. Serão
consumidores ou adapters do motor, nunca a fonte de verdade dele.

## Como o motor passa a funcionar

```text
0. instalar e comprovar o Raiz Engine
1. entender e compilar a marca com marca-raiz-prisma
2. receber o objetivo do vídeo e analisar o conteúdo
3. planejar narrativa e direção audiovisual
4. localizar e selecionar assets
5. compilar e executar com FFmpeg, Remotion ou outro adapter
6. revisar, entregar e registrar aprendizado
7. ativar Adobe e outros engines profissionais quando necessários
```

`marca-raiz-prisma/` é a fonte da **Brand Intelligence**. Sua saída para os
outros componentes será o `BrandRuntimeProfile`; o Cena Raiz não deve reler todo
o método e todo o corpus a cada vídeo.

## Documentos normativos

| Documento | Responsabilidade |
|---|---|
| [AGENTS.md](AGENTS.md) | constituição e roteamento para agentes |
| [ARQUITETURA-MOTOR-CRIATIVO-RAIZ.md](ARQUITETURA-MOTOR-CRIATIVO-RAIZ.md) | arquitetura-alvo, contratos e **única fonte da ordem das Fases 0–7 do produto** |
| [GUIA-ORGANIZACAO-REPOSITORIO.md](GUIA-ORGANIZACAO-REPOSITORIO.md) | **única fonte da ordem operacional do repositório**, Etapas 0–11 |
| [PLANO-MIGRACAO-IDENTIDADE.md](PLANO-MIGRACAO-IDENTIDADE.md) | **única fonte** da estratégia de rebranding |
| [POLITICA-FONTE-UNICA-FUNCIONAL.md](POLITICA-FONTE-UNICA-FUNCIONAL.md) | uma implementação canônica por responsabilidade |
| [docs/architecture/cena-raiz-audiovisual-evolution.md](docs/architecture/cena-raiz-audiovisual-evolution.md) | blueprint ativo de direção audiovisual, narrativa, motion, assets, execução, revisão e memória; Adobe é uma integração faseada |

## Registros operacionais

| Documento | Conteúdo |
|---|---|
| [docs/provenance/INVENTARIO-REPOSITORIO.md](docs/provenance/INVENTARIO-REPOSITORIO.md) | seções 1–14 são snapshot histórico; **§ 15 é o estado atual** |
| [docs/provenance/COMPONENTES-HERDADOS.md](docs/provenance/COMPONENTES-HERDADOS.md) | origem, licença e tratamento do que foi herdado |
| [docs/integrations/INFRAESTRUTURA-PROPRIA.md](docs/integrations/INFRAESTRUTURA-PROPRIA.md) | autenticação, publicação, Supabase, DNS, segurança e o que falta ser próprio |

## Regra para toda ideia nova

Nenhuma ideia vira pasta solta, prompt sem contrato ou ferramenta paralela. Cada uma
é classificada, arquitetada e incorporada ao Raiz Engine ou a um de seus consumidores,
com responsabilidade, contrato, localização, integração e critério de validação
explícitos.
