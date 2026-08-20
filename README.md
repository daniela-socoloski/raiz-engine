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

**Etapa 5 — executada, aguardando aceitação após reconciliação documental.**

| | |
|---|---|
| Etapas concluídas | 0, 1, 2, 3 e 4 |
| Executadas antecipadamente, sob autorização | 8 (baseline técnico) e 9 (identidade, como `CLEAN CUT — ACCEPTED`) |
| Primeiro commit | `231e746` — **`reconciled Raiz Engine baseline`**, 854 arquivos. Executado localmente, **aguarda aceitação**; não é o estado como recebido |
| Recuperação externa | backup completo e backup do Git intermediário, ambos verificados |
| Git LFS | **obrigatório** — 505 caminhos, 501 objetos, 398 MB. Clone sem LFS traz ponteiros, não os assets |
| Push para o remoto | **pendente**, exige autorização separada; o remoto segue vazio |
| Releases | **bloqueadas** até a publicação própria existir |

O estado detalhado de cada etapa está em
[GUIA-ORGANIZACAO-REPOSITORIO.md](GUIA-ORGANIZACAO-REPOSITORIO.md) § 4.1.

## Componentes

| Caminho | Papel |
|---|---|
| `cena-raiz/cenaraiz/cena-raiz/` | skill audiovisual herdada — método, helpers, templates, instalador |
| `cena-raiz/cenaraiz/cena-raiz-desktop/` | aplicativo Electron herdado — interface, timeline, runtimes, render |
| `marca-raiz-prisma/` | inteligência de marca. `inteligencias/` guarda kernel e método; `projetos/` é o corpus aplicado, preservado deliberadamente |
| `raiz-Images/` | direção e geração de imagens |
| `slide-raiz/` | narrativa editorial e carrosséis |
| `SKILLS/` | recipes criativas especializadas |
| `ASSETS/` | materiais visuais em catalogação |

Skill e desktop são as duas partes complementares da base adquirida. Serão
consumidores ou adapters do motor, nunca a fonte de verdade dele.

## Documentos normativos

| Documento | Responsabilidade |
|---|---|
| [AGENTS.md](AGENTS.md) | constituição e roteamento para agentes |
| [ARQUITETURA-MOTOR-CRIATIVO-RAIZ.md](ARQUITETURA-MOTOR-CRIATIVO-RAIZ.md) | arquitetura-alvo, camadas, contratos e roadmap |
| [GUIA-ORGANIZACAO-REPOSITORIO.md](GUIA-ORGANIZACAO-REPOSITORIO.md) | **única fonte da ordem operacional** das Etapas 0–11 |
| [PLANO-MIGRACAO-IDENTIDADE.md](PLANO-MIGRACAO-IDENTIDADE.md) | **única fonte** da estratégia de rebranding |
| [POLITICA-FONTE-UNICA-FUNCIONAL.md](POLITICA-FONTE-UNICA-FUNCIONAL.md) | uma implementação canônica por responsabilidade |

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
