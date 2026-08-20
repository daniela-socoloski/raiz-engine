# Cena Raiz — Adobe Integration and Motion Intelligence Plan

Status: Proposed architecture and implementation roadmap  
Target repository: `cena-raiz-desktop`  
Target branch: `main-cena-desktop`  
Primary runtime: Electron modular monolith  
External execution engines: Adobe Premiere Pro MCP, Adobe After Effects MCP, Remotion, FFmpeg

## 1. Purpose

This document defines how to evolve the existing Cena Raiz video system without replacing the architecture that already works.

The goal is to add a professional motion and editorial layer powered by the locally installed Adobe Premiere Pro and After Effects MCP servers while preserving:

- `TimelineModel` as the canonical non-destructive editing model.
- FFmpeg as the deterministic media-processing engine.
- Remotion as the scalable template, caption, preview, and batch-render engine.
- The current chat, approval, project, provider, runtime, packaging, and update systems.
- Original media and original Adobe project files.

This is an extension of the current product, not a rewrite and not a parallel video editor.

## 2. Product intent

For creators and brand operators, when producing a branded video from raw footage, enable the system to plan, assemble, animate, review, and finish the video using the most appropriate execution engine, because today advanced motion requires manual translation between brand strategy, editorial decisions, Remotion code, Premiere timelines, and After Effects compositions.

Value is proven when:

- A brand profile consistently influences editing and motion decisions.
- Existing motion assets are reused before new assets are created.
- Premiere and After Effects can be controlled through bounded, validated operations.
- The same input and approved plan produce repeatable results.
- Adobe failures never corrupt the original project or canonical timeline.
- The agent spends fewer tokens describing animations and writing arbitrary code.
- A human can inspect, approve, correct, undo, and export the result.

## 3. Architectural verdict

Adopt a hybrid architecture.

- **OWN** the brand intelligence, motion profile, planning contracts, canonical timeline, asset registry, validation rules, creative memory, and review workflow.
- **EXTEND** the existing Remotion system and wrap the installed Premiere and After Effects MCP servers behind internal adapters.
- **RENT** Adobe applications, FFmpeg, WhisperX, image/video generation providers, and model runtimes as replaceable execution capabilities.
- **DEFER** unrestricted generation of entire After Effects projects and unrestricted two-way Premiere synchronization.
- **REMOVE** arbitrary model-authored fields, direct unplanned Adobe mutations, and free-form animation code as the default production path.

The Cena Raiz application remains the system of record. Premiere and After Effects are execution environments, not the owners of project state.

### Rejected alternative

Do not make Premiere or After Effects the primary project model. That would couple the product to undocumented MCP behavior, application state, version differences, UI availability, and provider-specific object identifiers. It would also weaken the existing non-destructive timeline, automated render flow, and cross-platform behavior.

### Reversal trigger

Reconsider Adobe as a system of record only if a stable, versioned, fully testable API provides deterministic read/write parity, durable identifiers, transactional operations, and reliable recovery across supported Adobe versions.

## 4. Core principles

1. The model plans; deterministic software validates and executes.
2. `TimelineModel` remains the canonical editorial state.
3. Every Adobe mutation starts from a typed execution plan.
4. Every Adobe mutation targets a duplicated sequence, composition, or project.
5. Every successful mutation requires readback and validation.
6. No model response is treated as evidence that a tool operation succeeded.
7. Existing registered assets are preferred over generating new assets.
8. Adobe-specific semantics remain inside Adobe adapters.
9. All jobs are idempotent, cancelable where supported, and auditable.
10. The user always has preview, approval, undo, fallback, and recovery paths.
11. Original media and original Adobe projects are immutable.
12. Free text is presentation. Machine-to-machine communication uses typed JSON.

## 5. Target system flow

```mermaid
flowchart TD
    BI[Brand Intelligence] --> VP[Video and Motion Planning]
    VP --> AR[Motion Asset Registry]
    AR --> EP[Validated Execution Plan]
    EP --> EX[Execution Router]
    EX --> RM[Remotion Adapter]
    EX --> AE[After Effects MCP Adapter]
    EX --> PR[Premiere MCP Adapter]
    EX --> FF[FFmpeg Adapter]
    RM --> RB[Readback and Validation]
    AE --> RB
    PR --> RB
    FF --> RB
    RB --> CT[Canonical Timeline]
    CT --> HR[Human Review]
    HR --> CM[Creative Memory]
```

## 6. Responsibility boundaries

### 6.1 Brand Intelligence

The existing `marca-raiz-prisma/inteligencias` system owns brand interpretation. It must produce a compact, versioned runtime artifact instead of injecting every intelligence document into every model turn.

Required output:

```ts
export interface BrandRuntimeProfile {
  schemaVersion: '1.0';
  brandId: string;
  version: string;
  identity: {
    essence: string[];
    positioning: string[];
    promises: string[];
    antiPatterns: string[];
  };
  voice: {
    traits: string[];
    rhythm: string[];
    prohibitedPatterns: string[];
  };
  visual: {
    colors: string[];
    typography: string[];
    compositionRules: string[];
    photographyRules: string[];
    prohibitedPatterns: string[];
  };
  motion: MotionProfile;
  provenance: Array<{
    sourceId: string;
    sourceVersion: string;
  }>;
}
```

### 6.2 Motion Intelligence

Motion Intelligence translates brand identity and video intent into motion rules. It does not create keyframes directly.

```ts
export interface MotionProfile {
  energy: 'restrained' | 'balanced' | 'expressive';
  pace: 'slow' | 'moderate' | 'fast' | 'variable';
  density: 'minimal' | 'moderate' | 'dense';
  movementTraits: string[];
  preferredEasings: string[];
  transitionFamilies: string[];
  typographyBehavior: string[];
  imageBehavior: string[];
  audioRelationship: string[];
  allowedEffects: string[];
  prohibitedEffects: string[];
  maxConcurrentMotionElements: number;
}
```

### 6.3 Video and Motion Planner

The planner decides what each scene needs and selects an execution strategy. AI is justified here because interpreting narrative, brand meaning, visual hierarchy, and scene intent is probabilistic.

The planner must not call Adobe MCP tools directly.

```ts
export interface SceneMotionNeed {
  sceneId: string;
  startFrame: number;
  endFrame: number;
  purpose:
    | 'hook'
    | 'clarify'
    | 'emphasize'
    | 'compare'
    | 'explain-data'
    | 'transition'
    | 'identify'
    | 'call-to-action';
  content: Record<string, string | number | boolean>;
  visualPriority: 'low' | 'medium' | 'high';
  preferredEngine?: 'remotion' | 'after-effects' | 'premiere' | 'ffmpeg';
  assetQuery: {
    capabilities: string[];
    brandTags: string[];
    aspectRatio: '9:16' | '16:9' | '1:1';
  };
}
```

### 6.4 Motion Asset Registry

The registry is the main token-reduction and consistency mechanism. The model selects an asset by identifier and supplies parameters instead of describing the implementation repeatedly.

Supported asset families:

- Remotion components.
- After Effects compositions.
- MOGRT templates.
- Lottie animations.
- Static or animated overlays.
- Audio transitions and sound-design elements.

```ts
export interface MotionAssetManifest {
  schemaVersion: '1.0';
  assetId: string;
  version: string;
  name: string;
  engine: 'remotion' | 'after-effects' | 'mogrt' | 'lottie' | 'media';
  source: {
    project?: string;
    composition?: string;
    component?: string;
    file?: string;
  };
  capabilities: string[];
  brandTags: string[];
  aspectRatios: Array<'9:16' | '16:9' | '1:1'>;
  duration: {
    mode: 'fixed' | 'stretchable' | 'loopable';
    defaultFrames: number;
    minFrames?: number;
    maxFrames?: number;
  };
  parameters: Record<string, MotionAssetParameter>;
  preview: {
    thumbnail: string;
    video?: string;
  };
  compatibility: {
    minAppVersion?: string;
    maxAppVersion?: string;
    requiredFonts?: string[];
    requiredPlugins?: string[];
  };
  fingerprint: string;
}

export type MotionAssetParameter =
  | { type: 'string'; required?: boolean; maxLength?: number }
  | { type: 'number'; required?: boolean; min?: number; max?: number }
  | { type: 'boolean'; required?: boolean }
  | { type: 'color'; required?: boolean }
  | { type: 'enum'; required?: boolean; values: string[] }
  | { type: 'image' | 'video' | 'audio'; required?: boolean };
```

### 6.5 Canonical Timeline

The existing `TimelineModel` remains authoritative for editorial timing and source relationships.

Extend it through versioned overlay entities rather than arbitrary top-level fields.

```ts
export interface TimelineOverlay {
  id: string;
  type: 'caption' | 'headline' | 'image' | 'video' | 'motion' | 'audio';
  timelineStart: number;
  timelineDuration: number;
  sourceRef?: string;
  assetRef?: {
    assetId: string;
    assetVersion: string;
    renderVersion?: string;
  };
  parameters?: Record<string, unknown>;
  enabled: boolean;
  provenance: {
    origin: 'user' | 'planner' | 'remotion' | 'after-effects' | 'premiere';
    jobId?: string;
  };
}
```

Unknown fields may be preserved for backward compatibility, but new production behavior must use official schemas.

## 7. Execution router

The router selects an engine using deterministic rules after the planner identifies the visual need.

Initial routing policy:

| Need | Primary engine | Fallback |
|---|---|---|
| Clean cut, concat, proxy, audio, J-cut | FFmpeg | None |
| Captions, headlines, standard split layouts | Remotion | FFmpeg-safe render |
| Registered reusable motion component | Asset-defined engine | Remotion placeholder |
| Custom branded motion or complex composition | After Effects MCP | Remotion simplified version |
| Professional timeline assembly and human finishing | Premiere MCP | Canonical timeline + app render |
| MOGRT placement | Premiere MCP | Pre-rendered asset |

The planner may recommend an engine, but the router is authoritative and must verify availability, compatibility, required plugins, project state, and fallback readiness.

## 8. Adobe integration architecture

### 8.1 Capability probe

Do not assume tool names or behavior from repository documentation. At runtime and during development, inspect the installed MCP servers and record their actual capabilities.

The probe must determine:

- MCP server identity and version.
- Available tool names and schemas.
- Installed Adobe application version.
- Whether the application is running.
- Supported project, sequence, composition, layer, keyframe, expression, render, and export operations.
- Whether tool calls are synchronous or asynchronous.
- Identifier stability across calls and application restarts.
- Required panels, scripts, extensions, permissions, and ports.
- Timeout and cancellation behavior.
- Readback capability.
- Known unsupported operations.

Persist a sanitized capability snapshot:

```ts
export interface AdobeCapabilitySnapshot {
  schemaVersion: '1.0';
  capturedAt: string;
  server: {
    id: string;
    version?: string;
  };
  application: {
    kind: 'premiere-pro' | 'after-effects';
    version?: string;
    running: boolean;
  };
  tools: Array<{
    name: string;
    inputSchemaHash: string;
    supported: boolean;
    notes?: string[];
  }>;
}
```

Never persist credentials, OAuth codes, cookies, tokens, or sensitive MCP transport payloads.

### 8.2 Internal adapters

Application code must call internal adapters, not provider tool names.

```ts
export interface AfterEffectsAdapter {
  probe(): Promise<AdobeCapabilitySnapshot>;
  inspectProject(request: InspectAeProjectRequest): Promise<AeProjectSnapshot>;
  instantiateAsset(request: MotionExecutionPlan): Promise<AdobeJobResult>;
  renderPreview(request: MotionPreviewRequest): Promise<AdobeJobResult>;
  readback(request: AdobeReadbackRequest): Promise<AdobeReadbackResult>;
  cancel(jobId: string): Promise<void>;
}

export interface PremiereAdapter {
  probe(): Promise<AdobeCapabilitySnapshot>;
  inspectProject(request: InspectPremiereProjectRequest): Promise<PremiereProjectSnapshot>;
  createSequence(request: PremiereSequencePlan): Promise<AdobeJobResult>;
  applyTimeline(request: PremiereTimelinePlan): Promise<AdobeJobResult>;
  placeMotionAssets(request: PremierePlacementPlan): Promise<AdobeJobResult>;
  exportSequence(request: PremiereExportRequest): Promise<AdobeJobResult>;
  readback(request: AdobeReadbackRequest): Promise<AdobeReadbackResult>;
  cancel(jobId: string): Promise<void>;
}
```

### 8.3 Adobe worker

Run Adobe MCP orchestration in a dedicated local worker controlled by the Electron main process.

Responsibilities:

- Serialize mutations per Adobe project.
- Maintain job state.
- Apply timeouts and bounded retries.
- Prevent concurrent writes to the same project or sequence.
- Emit progress events to the renderer.
- Handle application-not-running and panel-not-connected states.
- Reconcile partial success through readback.
- Sanitize logs.
- Support cancellation when the MCP transport supports it.

Do not create a separate cloud service for the first version. Keep this inside the current modular Electron application.

### 8.4 Job state machine

```text
queued
  -> probing
  -> validating
  -> preparing-copy
  -> executing
  -> reading-back
  -> validating-result
  -> preview-ready
  -> approved
  -> committed

Any active state may move to:
  -> cancelled
  -> retryable-failure
  -> terminal-failure
  -> needs-human-action
```

Every transition must be persisted atomically and include a timestamp, job identifier, project identifier, engine, operation, attempt number, and sanitized result classification.

## 9. After Effects MCP role

After Effects is the specialized motion-authoring and rendering engine.

Allowed MVP operations:

- Inspect a known `.aep` project.
- Duplicate a registered source composition.
- Set registered text, color, number, image, video, and enum parameters.
- Update explicitly registered keyframes or expression controls.
- Render a preview or transparent intermediate.
- Read back composition, layer, duration, and render state.

Not allowed in the MVP:

- Editing an unregistered composition.
- Mutating the original source composition.
- Installing third-party plugins.
- Executing arbitrary scripts written by the model.
- Generating an entire unknown `.aep` project without a human-approved recipe.
- Treating a tool response as render success without checking the output.

Example plan:

```ts
export interface MotionExecutionPlan {
  schemaVersion: '1.0';
  jobId: string;
  projectId: string;
  asset: {
    assetId: string;
    version: string;
    fingerprint: string;
  };
  target: {
    engine: 'after-effects';
    sourceProject: string;
    sourceComposition: string;
    outputComposition: string;
  };
  timeline: {
    startFrame: number;
    durationFrames: number;
    fps: number;
    width: number;
    height: number;
  };
  parameters: Record<string, string | number | boolean>;
  mediaBindings: Record<string, string>;
  output: {
    format: 'mov-prores-4444' | 'png-sequence' | 'mp4-preview';
    relativePath: string;
  };
}
```

## 10. Premiere MCP role

Premiere is the professional editorial handoff and finishing environment.

Allowed MVP operations:

- Inspect an existing project.
- Create or duplicate a Cena Raiz sequence.
- Place source clips from canonical timeline ranges.
- Place audio, captions, images, videos, MOGRTs, and rendered motion assets.
- Add deterministic markers containing Cena Raiz identifiers.
- Export a review file.
- Read back the created sequence for verification.

Not allowed in the MVP:

- Mutating an unrelated user sequence.
- Deleting bins, source clips, sequences, or project media.
- Making Premiere the canonical timeline.
- Automatically importing arbitrary human edits back into Cena Raiz.
- Assuming Premiere object identifiers remain stable without verification.

Every created sequence must contain:

- `projectId`.
- `timelineVersion`.
- `jobId`.
- Source media fingerprints.
- A visible versioned name such as `CENA_RAIZ_<project>_v003`.

## 11. Readback and validation

Readback means querying the execution environment after a mutation and comparing the observed state with the planned state.

Validation must check, where supported:

- Sequence or composition exists.
- Correct duration and frame rate.
- Correct resolution and aspect ratio.
- Expected track, layer, and clip count.
- Expected source references.
- Expected start and end frames within tolerance.
- Expected parameter values.
- Render file exists and is non-empty.
- FFprobe can open rendered media.
- Output duration is within one frame of the plan.
- Required alpha channel exists when requested.
- No missing fonts, plugins, media, or offline assets.

If readback is incomplete, the job must be marked `needs-human-action`; it must not silently become successful.

## 12. Project data layout

Proposed additions inside each video project:

```text
edit/
  brand/
    runtime-profile.json
  planning/
    video-brief.json
    narrative-plan.json
    scene-plan.json
    motion-brief.json
  motion/
    recipes/
    jobs/
    previews/
    renders/
    registry-lock.json
  adobe/
    capabilities/
    premiere/
      snapshots/
      exports/
    after-effects/
      snapshots/
      projects/
      renders/
  timeline.json
  edl.json
```

All persisted files require a schema version. Generated outputs must be versioned and never overwrite an approved output.

## 13. Proposed source modules

Adapt names to the repository conventions after inspection.

```text
src/
  domain/
    brand/
      brand-runtime-profile.ts
      motion-profile.ts
    motion/
      motion-brief.ts
      motion-asset-manifest.ts
      motion-execution-plan.ts
      motion-job.ts
    editorial/
      timeline-overlay.ts
      premiere-sequence-plan.ts

  application/
    motion/
      compile-brand-runtime-profile.ts
      plan-scene-motion.ts
      search-motion-assets.ts
      instantiate-motion-asset.ts
      validate-motion-result.ts
    editorial/
      build-premiere-sequence-plan.ts
      sync-premiere-sequence.ts
      validate-premiere-readback.ts

  infrastructure/
    adobe/
      adobe-worker.ts
      adobe-job-store.ts
      adobe-capability-probe.ts
      adobe-errors.ts
      after-effects-mcp-adapter.ts
      premiere-mcp-adapter.ts
      mcp-transport.ts
    motion-assets/
      filesystem-motion-asset-registry.ts

resources/
  motion-assets/
    manifests/
    previews/
    after-effects/
    mogrt/
    remotion/
    lottie/
```

Do not move existing working modules merely to match this diagram. Introduce boundaries incrementally and avoid unrelated refactors.

## 14. AI context and token strategy

The full intelligence library must not be inserted into every conversation turn.

Use a compilation and routing strategy:

1. Compile stable brand decisions into `BrandRuntimeProfile`.
2. Select only relevant intelligence modules for the current task.
3. Pass asset manifests rather than implementation source code.
4. Pass timeline summaries and scene windows rather than entire project histories.
5. Use IDs and structured parameters for registered assets.
6. Persist decisions in project files so the model does not need to reconstruct them.
7. Cache deterministic analysis by source fingerprint.
8. Record user corrections as structured preferences, not chat-only memory.

Suggested context envelope for motion planning:

```ts
export interface MotionPlanningContext {
  brandProfile: Pick<
    BrandRuntimeProfile,
    'brandId' | 'version' | 'voice' | 'visual' | 'motion'
  >;
  videoBrief: VideoBrief;
  scenes: ScenePlan[];
  availableAssets: Array<Pick<
    MotionAssetManifest,
    'assetId' | 'version' | 'engine' | 'capabilities' | 'brandTags' | 'parameters'
  >>;
  userCorrections: CreativePreference[];
  runtimeCapabilities: {
    remotion: boolean;
    afterEffects: boolean;
    premiere: boolean;
    ffmpeg: boolean;
  };
}
```

## 15. Security and trust boundaries

- MCP servers run locally and receive only paths inside the active project or approved asset registry.
- Resolve and validate all paths before any tool call.
- Reject path traversal, external paths, unresolved environment variables, and unsafe globs.
- Never expose credentials or raw authentication files to model context.
- Maintain explicit allowlists for Adobe operations.
- Never install Adobe plugins or execute arbitrary ExtendScript/UXP code generated during a chat turn.
- Sanitize project names and generated identifiers.
- Preserve an audit log without raw model prompts, secrets, or unnecessary personal data.
- Treat imported `.aep`, `.prproj`, MOGRT, fonts, and third-party plugins as supply-chain inputs requiring provenance.
- Require explicit user confirmation before opening or mutating an existing Adobe project not created by Cena Raiz.

## 16. Reliability rules

- One active mutation job per Adobe project.
- Repeated `jobId` requests return the existing result instead of duplicating work.
- Retry only transient transport, application-busy, and rate-limit failures.
- Do not retry schema, unsupported-operation, missing-plugin, missing-media, or validation failures automatically.
- Use exponential backoff with a bounded attempt count.
- Persist job state before and after each external call.
- On process restart, reconcile all non-terminal jobs through readback.
- Provide a degraded path using Remotion or a pre-rendered asset when Adobe is unavailable.
- Adobe failure must never block Phase 1 clean-cut editing.
- Preview failure must never overwrite the last approved render.

Recommended error taxonomy:

```ts
export type AdobeErrorCode =
  | 'MCP_UNAVAILABLE'
  | 'APP_NOT_RUNNING'
  | 'PANEL_NOT_CONNECTED'
  | 'UNSUPPORTED_OPERATION'
  | 'INVALID_PLAN'
  | 'PROJECT_NOT_FOUND'
  | 'MEDIA_OFFLINE'
  | 'FONT_MISSING'
  | 'PLUGIN_MISSING'
  | 'TIMEOUT'
  | 'CANCELLED'
  | 'PARTIAL_SUCCESS'
  | 'READBACK_MISMATCH'
  | 'RENDER_FAILED'
  | 'EXPORT_FAILED'
  | 'UNKNOWN_ADOBE_FAILURE';
```

## 17. User experience

Adobe complexity should not move into the chat.

Add visual states and controls:

- Adobe connection status in Settings > Connections.
- Premiere and After Effects capability details.
- `Create motion` action after Phase 2 approval.
- Motion suggestions shown as visual cards with preview, purpose, engine, and duration.
- `Use existing`, `Create variation`, and `Do not use` decisions.
- Render progress below the relevant motion item.
- `Open in After Effects` and `Open in Premiere` only when a valid local project exists.
- `Send to Premiere` as an explicit handoff action.
- Comparison between Cena Raiz preview and Adobe result.
- Clear recovery action when Adobe is closed, disconnected, missing media, or missing a plugin.

Do not require the user to type technical approval phrases.

## 18. Observability and evaluation

Track system health separately from creative quality and product value.

### System health

- MCP connection success rate.
- Adobe job success and failure rate by operation.
- Job duration and timeout rate.
- Retry count.
- Readback mismatch rate.
- Render and export failure categories.
- Recovery success after restart.

### Model quality

- Asset-selection acceptance rate.
- Percentage of plans that pass schema validation.
- Percentage of suggestions rejected as off-brand.
- Number of user corrections per video.
- Motion density and timing corrections.
- Fallback rate from After Effects to Remotion.

### Product value

- Time from clean cut approval to approved motion preview.
- Time from video brief to final export.
- Percentage of assets reused.
- Token usage per finished minute.
- Number of manual Adobe actions required.
- Percentage of videos completed without leaving Cena Raiz.

Do not log full prompts, credentials, source transcripts, or unnecessary local paths.

## 19. Implementation roadmap

### Phase 0 — Repository and MCP discovery

Goal: establish verified current state before changing architecture.

Tasks:

- Inspect repository structure, branch, dirty worktree, package scripts, types, IPC contracts, and tests.
- Locate the current developer instructions and all places that parse or invent Phase 2 fields.
- Inspect the installed Premiere and After Effects MCP configurations.
- Enumerate actual MCP tools and schemas.
- Verify both Adobe applications and their required panels/extensions.
- Produce capability snapshots and a gap report.
- Create ADR-001 with the final adapter boundaries.

Acceptance criteria:

- No production behavior changed.
- No user files mutated.
- Actual MCP capabilities are documented from inspection, not assumption.
- Unsupported requirements are explicitly marked.

### Phase 1 — Domain contracts and local registry

Goal: create the owned core without calling Adobe.

Tasks:

- Add versioned schemas for `BrandRuntimeProfile`, `MotionProfile`, `MotionAssetManifest`, `SceneMotionNeed`, `MotionExecutionPlan`, and `MotionJob`.
- Add runtime validators.
- Implement filesystem registry discovery and validation.
- Register 5–10 existing assets, starting with current Remotion components and available MOGRT/After Effects templates.
- Generate or attach thumbnail and preview references.
- Add tests for invalid manifests, duplicate IDs, incompatible versions, and missing files.

Acceptance criteria:

- Registry loads deterministically.
- Duplicate or invalid assets never reach the planner.
- The planner can select assets by compact metadata without reading implementation files.

### Phase 2 — Adobe capability layer

Goal: establish safe, provider-specific adapters.

Tasks:

- Implement the MCP transport abstraction.
- Implement `AdobeCapabilityProbe`.
- Implement typed Premiere and After Effects adapters for read-only inspection.
- Add normalized error mapping.
- Add connection status and diagnostics to the application.
- Build contract tests using recorded, sanitized MCP responses.

Acceptance criteria:

- Application can detect unavailable, disconnected, unsupported, and ready states.
- Provider-specific response shapes do not escape the adapter layer.
- No mutation tool is enabled without a verified capability.

### Phase 3 — After Effects registered-asset loop

Goal: prove `select -> parameterize -> execute -> readback -> preview`.

Tasks:

- Select two simple registered After Effects compositions.
- Duplicate the source composition for every job.
- Apply only registered parameters.
- Render MP4 preview and one alpha-capable intermediate.
- Read back composition and render state.
- Validate output with FFprobe.
- Add preview, approval, retry, cancel, and fallback UI.

Acceptance criteria:

- Original `.aep` and source compositions remain unchanged.
- Repeating a completed job does not create duplicate compositions or renders.
- Output duration differs from plan by no more than one frame.
- Failed jobs preserve the last approved result.
- Remotion fallback is available.

### Phase 4 — Premiere sequence handoff

Goal: create a professional finishing sequence from canonical state.

Tasks:

- Convert `TimelineModel` and overlays into `PremiereSequencePlan`.
- Create a versioned Cena Raiz sequence in a copied or dedicated project.
- Place clips, audio, captions, images, motion renders, and supported MOGRTs.
- Add Cena Raiz identifiers as markers or metadata.
- Read the sequence back and compare timing and source references.
- Export a review file.

Acceptance criteria:

- No unrelated sequence is mutated.
- All planned video cuts match within one frame.
- Missing media produces a recoverable error.
- Sequence readback is stored as a snapshot.
- The canonical timeline remains unchanged unless the user explicitly approves an import operation.

### Phase 5 — Brand-to-motion planning

Goal: connect the intelligence panel to the execution system.

Tasks:

- Compile relevant intelligence modules into `BrandRuntimeProfile`.
- Add `MotionProfile` generation and human review.
- Generate `SceneMotionNeed[]` from the approved narrative and timeline.
- Rank compatible registry assets.
- Show recommendations as visual cards.
- Record user approval, rejection, replacement, and parameter corrections.

Acceptance criteria:

- Every motion suggestion cites a scene purpose and asset ID.
- Every selected asset is compatible with the brand and runtime constraints.
- The system abstains when no compatible asset exists.
- User corrections persist as structured creative memory.

### Phase 6 — Controlled two-way synchronization

Goal: import selected human Adobe changes only after one-way handoff is reliable.

Do not start this phase until Phase 4 has a low readback mismatch rate across real projects.

Potential scope:

- Detect timing differences in a Cena Raiz-owned Premiere sequence.
- Present a visual diff.
- Let the user choose which changes to import.
- Convert supported changes into canonical timeline commands.
- Reject or preserve unsupported Adobe-only changes as external overlays.

## 20. MVP hypothesis and stop conditions

### Hypothesis

A registered-asset workflow using the installed After Effects MCP can produce more sophisticated, brand-consistent motion with less model context and less manual work than generating each animation as new Remotion code.

### MVP slice

- One real brand profile.
- One vertical short-form video.
- Two registered After Effects assets.
- Five existing Remotion assets.
- One After Effects preview workflow.
- One Premiere sequence handoff.

### Success threshold

- At least 80% of Adobe jobs finish without manual technical intervention.
- Zero mutation of original projects or media.
- All accepted timing results are within one frame.
- At least 50% of motion decisions reuse registered assets.
- Model context for an asset placement is materially smaller than the current custom-code prompt and source context.
- User can complete review and recovery without reading raw MCP errors.

### Stop or redesign conditions

- The MCP cannot provide reliable readback.
- Identifiers are too unstable to support idempotency.
- More than 20% of jobs corrupt, duplicate, or misplace assets after adapter stabilization.
- Required Adobe UI/panel state creates unacceptable user friction.
- Cross-version behavior cannot be bounded by capability probes.
- A simpler Remotion or MOGRT path produces equivalent quality and control.

## 21. Testing strategy

Add tests in layers.

### Unit tests

- Schema validation.
- Asset compatibility and ranking.
- Engine routing.
- Path safety.
- Plan normalization.
- Error classification.
- Timeline-to-Premiere conversion.
- Readback comparison.
- Idempotency keys.

### Contract tests

- Recorded and sanitized MCP tool schemas.
- Provider response normalization.
- Unsupported tool behavior.
- Timeout, partial success, cancellation, and reconnect behavior.

### Integration tests

- Read-only project inspection.
- Composition duplication.
- Registered parameter application.
- Preview render.
- Premiere sequence creation.
- Sequence readback.

### End-to-end tests

- Brand profile -> motion plan -> asset selection -> AE preview -> approval -> timeline overlay.
- Canonical timeline -> Premiere sequence -> readback -> review export.
- Application restart during a running job -> reconciliation.
- Adobe unavailable -> degraded Remotion path.

Real Adobe tests must run behind explicit environment flags and must use disposable fixtures, never personal projects.

## 22. First Claude Code execution instructions

When this document is first given to Claude Code, execute only Phase 0.

Use this instruction:

```text
Read README-ADOBE-INTEGRATION-PLAN.md and the existing consolidated project context completely.

Work only in the cena-raiz-desktop repository. Do not modify the cena-raiz skill repository or any individual video project.

For this turn, perform Phase 0 only. Inspect the repository and the actually installed Premiere Pro and After Effects MCP capabilities. Do not implement mutation operations yet. Do not install packages, change runtime versions, create a new architecture beside the existing TimelineModel, or modify user Adobe projects.

Deliver:
1. Current Architecture Map.
2. MCP Capability Matrix based on actual discovered tools and schemas.
3. Gap Analysis against this plan.
4. ADR-001 with the proposed adapter boundaries.
5. Minimal file-by-file implementation plan for Phase 1.
6. Risks and unknowns that can materially change the architecture.

Clearly separate verified evidence, inference, and recommendation. Preserve the dirty worktree and do not expose credentials or absolute local paths in user-facing output.
```

## 23. Definition of done for the full initiative

The Adobe integration is complete when:

- Brand intelligence compiles into a versioned runtime profile.
- Motion decisions use typed scene needs and registered assets.
- The system chooses Remotion, FFmpeg, After Effects, or Premiere through an explicit router.
- Adobe MCPs are isolated behind tested internal adapters.
- All Adobe writes are duplicated, versioned, idempotent, and followed by readback.
- The canonical timeline remains recoverable and authoritative.
- A user can preview, approve, reject, retry, cancel, and fall back visually.
- Original media and Adobe projects are never overwritten.
- Token usage, asset reuse, failures, corrections, and completion time are measurable.
- Mac and Windows behavior is validated on real machines.
- The existing clean-cut, J-Cut, Phase 2, provider, installer, and updater flows remain green.

## 24. Immediate next decision

The next engineering decision must be based on evidence from Phase 0:

**Can the installed After Effects MCP and Premiere MCP provide sufficient readback and identifier stability to support safe, idempotent adapters?**

If yes, proceed to Phase 1 and Phase 2. If no, keep the same owned domain architecture but replace mutation through the MCP with a controlled local Adobe bridge, MOGRT workflow, ExtendScript/UXP adapter, or render-only integration.

