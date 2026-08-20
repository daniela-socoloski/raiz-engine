# Raiz Engine Agent Constitution

## Scope

This file governs work across the `raiz-engine` repository. A nested
`AGENTS.md`, if one is introduced later, may add component-specific constraints
but must not contradict this constitution or the authoritative project
documents listed below.

The repository root is the working boundary. Use repository-relative paths in
instructions, code, documentation, scripts, and generated context. Never encode
a developer's home directory as a project requirement.

## Mission

Build the Raiz Engine as the owned creative operating core of Sistema Marca
Raiz. The system must transform durable brand intelligence and production intent
into versioned creative plans, select compatible assets, compile validated
execution plans for replaceable engines, preserve reviewable state, and learn
from approved corrections.

The existing Cena Raiz skill and desktop application are the two complementary
parts of the Edvid product base that Daniela declares she acquired to rebrand,
adapt, evolve, distribute, and commercialize under broad permission granted by
the seller. Extend that working base safely; do not treat either part as an
optional reference, discard it in favor of a parallel rewrite, or mistake the
two upstream repositories for duplicate implementations. The acquisition
contract has not been stored or independently inspected in this repository, so
record that permission as an owner declaration. Because the purchased product
may itself incorporate earlier third-party sources, preserve only the licenses,
copyright notices, and technical provenance that apply to those components;
this does not require keeping Edvid branding in the active product.

The repository's pre-existing corpus is an intentional migration base from
Edvid/Cena Raiz and its supporting research, not an accidental collection.
Preserve and evaluate it before renaming, adapting, consolidating, or relocating
it. Labels such as `external-reference`, `duplicate`, `generated`, or
`deliverable` describe provenance and repository role; they do not authorize
deletion before backup, classification, and explicit approval. Generated
dependency/cache directories created later by tools are not source material.

Communicate with Daniela in Brazilian Portuguese. Preserve the language and
style of an authoritative document when updating it. Use English for new code
identifiers, schemas, contracts, APIs, events, tests, and implementation-facing
technical artifacts unless an existing component requires another convention.

## Evidence hierarchy

When sources disagree, use this order:

1. verified behavior and current executable contracts;
2. this repository's instructions and accepted ADRs;
3. current architecture and operational documents;
4. tests and implementation;
5. component context files;
6. conversation memory or inference.

Report meaningful contradictions. Do not silently select the most convenient
source, and do not treat this routing summary as a replacement for direct
inspection of the repository.

## Authoritative documents

| Document | Authority and when to read it |
|---|---|
| `README.md` | Product and repository entry point. Read at the start of every new project task. |
| `ARQUITETURA-MOTOR-CRIATIVO-RAIZ.md` | Target architecture, ownership decisions, contracts, bootstrap, and the canonical product phases. Read for every architectural or cross-component change. |
| `GUIA-ORGANIZACAO-REPOSITORIO.md` | Safe repository consolidation sequence. It exclusively owns the one-time repository Etapas 0–11. Read before inventory, movement, Git-boundary, baseline, or bootstrap work. |
| `POLITICA-FONTE-UNICA-FUNCIONAL.md` | Mandatory single-source policy. Read before renaming, merging, replacing, moving, or removing files and components. |
| `PLANO-MIGRACAO-IDENTIDADE.md` | Identity, compatibility, provenance, and legacy-removal sequencing. Read before changing names, protocols, storage, distribution, or inherited infrastructure. |

Component documents are scoped evidence, not repository-wide authority:

- `apps/cena-raiz-desktop/agent.md` governs inherited Cena Raiz
  Desktop behavior only. It contains historical context and may contain stale
  repository assumptions; verify it against code and the documents above.
- `docs/architecture/cena-raiz-audiovisual-evolution.md` is the active Cena Raiz
  audiovisual evolution blueprint. Read it for Cena Raiz contracts, canonical
  state, asset reuse, execution routing, readback, safety, bootstrap capability
  detection, and Adobe boundaries. Actual Adobe mutations and synchronization
  remain deferred to the controlled Adobe phase.
- `skills/cena-raiz/SKILL.md`, its `install.md`, manifests, locks,
  helpers, and tests govern work on the inherited video skill.
- `marca-raiz-prisma/start-here.md` and its relevant intelligence documents
  govern Brand Intelligence compilation work.
- `raiz-Images/COMECE-AQUI.md` governs Raiz Images work.
- `slide-raiz/00-README.md` governs Slide Raiz work.
- `recipes/ads-produto/SKILL.md` governs the inherited advertising recipe in the
  canonical `recipes/` boundary.

## Architectural verdict

Use capability-level sourcing:

- `OWN`: creative direction, canonical contracts, Brand Runtime Profile,
  Asset Registry, Creative Memory, evaluation policy, execution routing, and
  reproducible bootstrap.
- `EXTEND`: Cena Raiz Desktop, Cena Raiz skill, Raiz Images, Slide Raiz,
  existing creative recipes, and registered Remotion templates.
- `RENT`: FFmpeg, WhisperX, Remotion runtime, model providers, storage,
  application connectors, and Adobe execution through narrow adapters.
- `DEFER`: Adobe write operations and deep synchronization, microservices, multi-agent production
  orchestration, autonomous publishing, and broad format expansion until their
  documented triggers are met.
- `REMOVE`: duplicate implementations, repository-internal backups, external
  reference clones inside the product boundary, free-form prompts as the only
  machine contract, and obsolete compatibility after verified migration.

Prefer a modular monolith with explicit domain boundaries. Do not introduce a
distributed system, agent framework, vector database, or provider abstraction
without a concrete architecture driver and a real first consumer.

## System boundaries and invariants

- Durable intelligence, per-production workflows, execution engines, and
  review/operations/learning are separate layers.
- Machine-to-machine decisions use versioned structured contracts. Free text is
  presentation or evidence, not the only executable source of truth.
- Keep one canonical non-destructive timeline. Do not create a second timeline
  for a new renderer or integration.
- Models may propose creative decisions. Deterministic code validates schemas,
  compatibility, authorization, state transitions, and engine execution.
- Human approval remains available before consequential creative or external
  actions, with correction, undo, recovery, and provenance.
- External engines remain replaceable behind adapters and must not define the
  owned domain model.
- Reuse registered assets before generating new material.
- Preserve inherited working behavior while introducing owned contracts at
  verified seams.
- Keep one functional implementation per responsibility. Git history and
  provenance records preserve the past; active duplicate files do not.
- The system must be reproducible on a supported clean machine through a
  versioned, idempotent, resumable bootstrap and a canonical toolchain manifest.
- `daniela-socoloski/raiz-engine` is the canonical slug for owned source,
  bootstrap, workflows, and releases. Do not switch a consumer to a new raw or
  release URL until the referenced artifact and checksum actually exist there.
- Keep third-party downloads on verified official sources unless an explicitly
  registered mirror is required; a Raiz-hosted mirror retains upstream version,
  checksum, license, and provenance.
- On Windows, never pass a drive-letter archive path to GNU `tar -f` without
  `--force-local`. Prefer a relative archive name with a controlled `cwd` so the
  same archive adapter works with Windows `bsdtar`, which may not support that
  GNU-only option.

## Current execution gate

The project is in the repository-foundation stage. Steps `Etapa 0` through
`Etapa 5` are concluded. The owner accepted the baseline for structural
consolidation by explicitly authorizing the repository recreation and file moves
on 2026-08-20. `Etapa 6` has been executed in the worktree; `Etapa 7` validation
is the current gate. The private remote contains the baseline and later work;
verify `origin/main` instead of copying its changing tip into normative text.

Evidence for the concluded steps, and for work executed out of order, is recorded
in section 15 of `docs/provenance/INVENTARIO-REPOSITORIO.md`. Sections 1–14 of
that document describe the earlier snapshot; where they disagree with section 15,
section 15 is current.

Until `Etapa 7` validates the consolidation:

- do not stage the repository wholesale;
- do not run inherited installers or updaters;
- do not restore `cena-raiz/cenaraiz/`, `SKILLS/`, or another active copy of a
  consolidated component;
- do not implement Adobe runtime mutations or product capabilities outside the
  explicitly authorized Fase 0 bootstrap and architectural alignment. Those
  authorizations do not activate Adobe writes.

Two steps were executed outside the documented order, each under explicit human
approval, and both are recorded rather than hidden:

- `Etapa 8` — technical baseline recovery: type-check restored from 29 errors to
  zero and eight test suites made runnable, in the desktop and in the skill.
- `Etapa 9` — identity migration: executed as a clean cut, without the alias and
  fallback layer the plan prescribes, after verifying that no build was ever
  distributed and no persisted state existed to honour. The plan must record this
  so a later agent does not reintroduce the compatibility layer.
- `Etapa 10` — an initial Windows developer bootstrap, doctor, and toolchain
  manifest were started under explicit owner authorization. They are not accepted
  as complete until clean-machine and creator-profile criteria pass.
- `Etapa 11` — an `AudiovisualDirectionPlan` skeleton was started in the desktop
  before the canonical Brand Intelligence compiler. Preserve it, do not duplicate
  it, and connect it only after product Fases 1 and 2 produce real inputs.

Not versioned, by declared requirement: tokens, passwords, private keys, provider
credentials, `node_modules`, Python environments, caches, renders, and
downloadable runtimes.

`marca-raiz-prisma/projetos/` is **not** in that list. It is `KEEP — canonical
brand-case corpus`: the applied half of Marca Raiz Prisma, where `inteligencias/`
holds the kernel and method and each project holds `discovery/`, `referencias/`,
`resultado/`, `.brand.json` and `CLAUDE.md`. It is the evidence base for
`BrandRuntimeProfile` and creative direction, and the evaluation corpus for the
engine. 394,607,148 bytes are preserved deliberately; do not exclude by size, do
not move or restructure it in the current phase.

Genuinely confidential future client work needs its own privacy and storage
policy. That does not authorise excluding the existing corpus without individual
assessment.

`GUIA-ORGANIZACAO-REPOSITORIO.md` exclusively owns the operational order. This
file may mirror that sequence for routing but must never reorder, merge, skip,
or promote a step independently.

Do not confuse that repository sequence with the product lifecycle in
`ARQUITETURA-MOTOR-CRIATIVO-RAIZ.md` § 15:

- `Etapa 0–11` = one-time repository safety and consolidation work;
- `Fase 0–7` = product capabilities, beginning with installation and runtime
  proof, followed by Brand Intelligence, then production intake and video.

The guide's `Etapa 10` implements product `Fase 0`; `Etapa 11` opens product
`Fase 1`. Never use “Fase 0” as a synonym for the baseline again.

| Guide step | Required outcome |
|---|---|
| `Etapa 0 — Congelar mudanças concorrentes` | Keep the repository stable while evidence is collected. |
| `Etapa 1 — Fazer inventário somente de leitura` | Produce the repository and inherited-component inventories without changing existing state. |
| `Etapa 2 — Criar recuperação fora do repositório` | Create and verify recoverable external backup before changing Git boundaries. |
| `Etapa 3 — Adotar o nome local e uma única fronteira Git` | Establish the repository root as the single owned Git boundary after backup and explicit approval. |
| `Etapa 4 — Criar política de versionamento` | Create or review root `.gitignore`, protect secrets and generated files, scan credentials, and review staging policy. |
| `Etapa 5 — Baseline` | **Accepted for consolidation.** Commit `231e746`, canonically `reconciled Raiz Engine baseline`. Never call it the inherited state. |
| `Etapa 6 — Reorganizar em um commit separado` | **Executed in the worktree.** Canonical roots are `apps/`, `skills/`, `recipes/`, and `docs/architecture/`; old active roots were removed. |
| `Etapa 7 — Validar a consolidação` | **Current gate.** Prove files, manifests, locks, links, boundaries, and staging remained correct. |
| `Etapa 8 — Recuperar o baseline técnico` | Restore type-check, tests, and development startup before feature work. |
| `Etapa 9 — Migrar identidade` | Migrate visible identity and internal compatibility in verified stages. |
| `Etapa 10 — Construir o bootstrap reproduzível` | Build and validate the canonical developer bootstrap and toolchain manifest. |
| `Etapa 11 — Começar o Raiz Engine` | Introduce the first owned contract and core capability at the verified integration seam. |

The ignore policy and repository-level secret exclusions were concluded in
`Etapa 4`, after the external recovery of `Etapa 2` and the approved Git-boundary
work of `Etapa 3`. Continue to exclude potential secrets, generated artifacts,
external clones, and wholesale staging from later steps.

Update this execution gate in the same change set when verified evidence moves
the project to another phase.

## Work protocol

Before changing anything, record or state:

```text
Objective:
Current phase:
Files allowed:
Files prohibited:
Compatibility to preserve:
Required verification:
Stop condition:
```

Then:

1. inspect the real repository state and relevant authoritative documents;
2. identify user changes and preserve unrelated work;
3. classify touched files as `KEEP`, `RENAME`, `MERGE`, `REMOVE`, `EXTERNAL`,
   `GENERATED`, or `MIGRATION` where the single-source policy applies;
4. make the smallest coherent change within the current phase;
5. verify with the component's real type-check, tests, render, build, or
   contract checks in proportion to risk;
6. inspect the diff for accidental deletion, duplication, secret exposure,
   stale names, and unrelated edits;
7. run the context freshness check below before declaring completion.

Staging, committing, pushing, publishing, releases, and destructive cleanup are
separate actions. Perform them only when the user's request authorizes them and
the current phase permits them.

## Mandatory context self-maintenance

`AGENTS.md` is a living routing dossier. Every agent working in this repository
must verify its freshness at the start and end of each task.

Update this file in the same change set whenever verified work changes a durable
project truth, including:

- product purpose or architectural verdict;
- authoritative documents or their routing responsibility;
- layer, component, package, or folder boundaries;
- canonical contracts, identifiers, state owners, or dependency direction;
- accepted invariants or prohibited shortcuts;
- capability sourcing decisions: `OWN`, `RENT`, `EXTEND`, `DEFER`, or `REMOVE`;
- roadmap order, current execution gate, or phase acceptance criteria;
- supported platforms, bootstrap behavior, canonical commands, or required
  verification;
- security, secrets, provenance, licensing, migration, compatibility, release,
  or recovery policy;
- the name or location of a component referenced by this dossier.

Do not update this file with chat history, temporary progress, personal machine
paths, weekly status, speculative ideas, transient failures, or a copied version
of another document. Durable details belong in their authoritative document;
this file contains the minimum routing summary needed to find and apply them.

When a durable decision changes:

1. update the authoritative architecture, ADR, policy, guide, or component file;
2. update the corresponding summary or route in `AGENTS.md`;
3. update affected consumers, tests, and compatibility rules;
4. verify that the authoritative source and this dossier do not contradict;
5. mention the context update in the task handoff.

An agent must not declare a task complete while a known durable project change
leaves `AGENTS.md` stale.

### Context freshness check

Before completion, answer all of these from current repository evidence:

- Does the mission still match the implemented system?
- Are the authoritative documents and component routes still correct?
- Is the architectural verdict still accurate?
- Are the invariants and prohibited shortcuts still enforced?
- Does the current execution gate match verified phase completion?
- Do commands, paths, component names, and supported platforms still exist?
- Did this task introduce a durable decision that is missing here?
- Are there contradictions between this file, architecture, policy, tests, and
  implementation?

If any answer is no or uncertain, inspect the source of truth and update the
context before handoff.

## Reconciled decisions — 2026-08-20

Durable decisions taken with explicit owner approval. They supersede any earlier
instruction that conflicts with them.

- **`marca-raiz-prisma/projetos/` is versioned.** `KEEP — canonical brand-case
  corpus`. Not private client material, not excluded by size. Baseline is expected
  to be around 394 MB and that is correct.
- **`Etapa 4` and `Etapa 5` are concluded.** The owner accepted the baseline for
  structural consolidation on 2026-08-20. The first commit is `231e746`, canonically named
  **`reconciled Raiz Engine baseline`**. Never call it the inherited state: no complete snapshot of
  the as-received code exists, and steps 8 and 9 ran before it. It is the first
  complete recoverable state of the Raiz Engine, not a photograph of what was
  acquired. Earlier provenance depends on the public upstreams, the dated external
  backups and the inventories in `docs/provenance/`.
- **The first push has occurred to the private remote.** The remote contains
  baseline `231e746` and later work. Query `origin/main` when the exact current
  tip matters; do not freeze that moving hash in normative status text. Every
  additional push still needs separate authorisation. The first commit was
  rewritten twice before its first push — by amend, to fix its subject, and by
  the Git LFS migration — so those rewrites did not affect an existing clone or
  fork. Do not rewrite it again without explicit authorisation.
- **Identity migration was a clean cut.** `CLEAN CUT — ACCEPTED`, recorded in
  `PLANO-MIGRACAO-IDENTIDADE.md` § 5. Do not reintroduce `Edvid` aliases or
  fallbacks without evidence of a real consumer. Identity aliases are not the same
  thing as temporary infrastructure dependencies.
- **Inherited problems must be declared**, never silently fixed — see the section
  below.
- **Own publication remains pending.** Publishing still targets the previous
  supplier's storage; releases are blocked until an owned destination is validated.
- **Refresh token storage blocks public distribution**, not documentation work.
- **A bootstrap installable on any clean machine remains a central requirement.**
  It is product **Fase 0**, before Brand Intelligence and before the per-video
  flow. The current pause does not cancel it. The initial developer bootstrap,
  doctor, and manifest are not proof of completion: the creator installer,
  skills/runtimes setup, clean-VM validation, and owned distribution remain.
- **Product Fase 1 is Brand Intelligence.** `marca-raiz-prisma/inteligencias/`
  owns the knowledge kernel and `marca-raiz-prisma/projetos/` owns the canonical
  evaluation corpus. Their runtime boundary is `BrandRuntimeProfile`. Video
  intake and audiovisual direction follow in Fases 2 and 3.
- **The target folder architecture is approved for documentation and controlled
  consolidation.** `apps/cena-raiz-desktop/`, `skills/cena-raiz/`,
  `recipes/ads-produto/`, and
  `docs/architecture/cena-raiz-audiovisual-evolution.md` are canonical. Organize
  folders by stable responsibility, not phase number. Do not recreate obsolete
  active copies; `cena-raiz/` contains only ignored external reference clones.
- **The audiovisual evolution plan is active before Adobe execution.** Its domain contracts,
  canonical-state rules, registry, router, validation, recovery, security, and
  optional bootstrap detection guide Cena Raiz construction now. Only MCP-backed
  mutations and Adobe synchronization remain deferred to the controlled Adobe
  phase.

## Mandatory inherited-base issue disclosure

Any defect, risk, incompatibility, stale dependency, broken assumption, unsafe
default, obsolete endpoint, or operational limitation found in the inherited
Edvid/Cena Raiz base must be reported explicitly.

Do not silently fix, hide, normalise, or attribute an inherited problem to the
Raiz Engine without evidence.

Every inherited-base issue report must state:

- origin: `INHERITED`, `ADAPTED`, `INTRODUCED`, or `UNKNOWN`;
- affected component and responsibility;
- verified evidence;
- current behaviour;
- expected Raiz Engine behaviour;
- user-visible and operational impact;
- security, data-loss, cost, distribution, and compatibility risk;
- whether the inherited behaviour still works for its original purpose;
- whether it blocks the current phase or only a future release;
- recommended treatment: `KEEP`, `ADAPT`, `REPLACE`, `DEFER`, or `REMOVE`;
- safe migration sequence;
- verification and removal condition.

An inherited behaviour that worked for the original product may still be
incompatible or unsafe under the Raiz Engine architecture. Report both facts.
Never suppress the issue merely because the current task did not introduce it.

The running register lives in `docs/provenance/COMPONENTES-HERDADOS.md`.

## Security and repository hygiene

- Never read, print, quote, summarize, copy, attach, stage, or commit private
  keys, tokens, passwords, cookies, OAuth codes, or credential files.
- Treat `.pem`, `.key`, `.p12`, `.pfx`, `.env`, credential exports, and unknown
  authentication artifacts as secrets until proven otherwise without exposing
  their contents.
- Keep secrets outside the repository and use ignored environment-specific
  configuration or the operating system credential store.
- Do not expose public-key material, fingerprints, or masked credentials unless
  the task requires them and the user explicitly requests that output.
- Never incorporate `cena-raiz/gh repos clones/` into owned product code without
  an explicit license, provenance, and sourcing decision.
- Preserve applicable inherited licenses and distinguish `upstream`, `adapted`,
  `owned`, and `external-reference` code.
- Use repository-relative paths. References to a former local repository name
  are historical evidence or stale context, not a runtime dependency.

## Definition of a valid handoff

A task handoff must state:

- the architectural decision implemented or evidence produced;
- files changed and source-of-truth impact;
- verification run and its result;
- preserved compatibility and relevant risks;
- intentionally deferred work;
- whether `AGENTS.md` required an update and why.

No task is complete solely because files were edited. Completion requires
verified behavior or evidence, a reviewed diff, preserved safety boundaries,
and synchronized durable project context.
