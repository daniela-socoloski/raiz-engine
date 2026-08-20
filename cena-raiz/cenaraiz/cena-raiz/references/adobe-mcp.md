# Adobe MCP operations — Codex and Claude Code

Read this file before diagnosing or operating the local After Effects or
Premiere Pro MCP. It replaces client-specific runbooks: Codex and Claude Code
use the same servers, bridges, safety sequence, and verification rules.

## Source of truth

The verified machine paths, portable variables, upstream sources, revisions,
licenses, and client-registration state live in
`../../PLANO-EVOLUCAO-AUDIOVISUAL-CENA-RAIZ.md` section 8.2. Do not duplicate or
silently override that inventory here. If verified local evidence changes,
update section 8.2 in the same change set.

The active chain is:

```text
Codex or Claude Code
  -> local stdio MCP server
  -> application bridge (ScriptUI/file bridge or CEP/temp bridge)
  -> After Effects or Premiere Pro
```

There is no Antigravity-specific layer. A client selects and invokes MCP tools;
creative intent and canonical state remain owned by the Raiz Engine.

## Canonical local contracts

### After Effects

- MCP identifier: `after-effects`.
- Node entry: `<USER_HOME>\mcp-servers\after-effects-mcp\build\index.js`.
- File bridge: `<DOCUMENTS>\ae-mcp-bridge`.
- Adobe side: `mcp-bridge-auto.jsx` in the detected After Effects profile's
  `Scripts\ScriptUI Panels` directory.
- The compiled entry is `build\index.js`, not a `dist` entry.

### Premiere Pro

- MCP identifier: `premiere-pro`.
- Node entry:
  `<USER_HOME>\mcp-servers\Adobe_Premiere_Pro_MCP\dist\index.js`.
- File bridge: `<TEMP>\premiere-mcp-bridge`.
- Adobe side: the `MCPBridgeCEP` extension in the detected CEP extensions
  directory.

Resolve `<USER_HOME>`, `<DOCUMENTS>`, `<TEMP>`, Adobe versions, and Node on each
machine. Never copy a developer username, drive letter, or Adobe profile version
into the portable installer.

## Preflight

1. Verify Node and the selected server entry exist.
2. Verify the corresponding bridge directory and Adobe panel/extension exist.
3. Start the Adobe application and its bridge panel when the requested tool
   requires application state.
4. Discover the server's live tools and schemas. Do not trust a copied tool
   count or invent unavailable Illustrator support.
5. Run the lightest read-only health probe before any project operation.
6. Inspect the active project, composition, or sequence and confirm the target
   with the user when more than one candidate exists.

If the server initializes but a probe fails, distinguish three layers in the
report: client registration, Node MCP process, and Adobe-side bridge. A healthy
stdio process does not prove that the panel is open or the application is ready.

## Controlled operation protocol

Adobe availability is capability evidence, not authorization to mutate. Obey
the current repository gate and the active project approval boundary.

When writes are authorized:

1. inspect before editing;
2. preserve source media and duplicate the target sequence/composition or use a
   disposable project copy;
3. state the intended operations and expected output;
4. apply the smallest coherent change;
5. read back the changed timeline, composition, properties, or render state;
6. save only after readback succeeds;
7. record provenance, tool result, and any partial failure in project memory.

Never edit `.aep` or `.prproj` binaries directly. Never claim success from an
accepted MCP call alone. For Premiere editing semantics and known CEP
limitations, continue in `premiere-mcp.md`.

## Failure routing

| Evidence | Classification | Next check |
|---|---|---|
| Client does not list the MCP | Registration | Client configuration and restart state |
| MCP exits immediately | Server/runtime | Node path, compiled entry, dependencies, stderr |
| MCP is listed but Adobe calls time out | Bridge | Application open, panel/extension loaded, bridge directory |
| Read works but write fails | Capability or authorization | Live schema, project state, current execution gate |
| Tool returns success but state is unchanged | Verification failure | Readback through a separate inspection call |

Report inherited server defects as `INHERITED`; do not hide them behind a Raiz
Engine success message or silently patch third-party code.

## Client lifecycle

Registrations are user-machine configuration, not repository source. Preserve
unrelated MCP entries and credentials. A newly written Codex configuration is
loaded by a new Codex session; Claude Code user-scope registration is available
to subsequent CLI sessions. Never commit either client's generated user config.
