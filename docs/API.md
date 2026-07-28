# Public API policy

## Stable entry points

The package root remains the compatibility surface. The following additive
subpaths are also stable and may be used to keep imports focused:

| Entry point | Intended surface |
| --- | --- |
| `realmlib/core` | framing, `PacketIO`, binary codecs, crypto, and errors |
| `realmlib/protocol` | packet types, ids, registry definitions, and maps |
| `realmlib/packets` | packet DTOs and feature-family namespaces |
| `realmlib/models` | reusable wire and consumer data models |
| `realmlib/data` | stat projection and character-data helpers |

Root exports will not be removed merely because the same symbol is available
through a focused entry point.

## Documentation and stability

API Extractor reports unresolved links, malformed TSDoc, and missing release
tags as warnings. New or materially changed public APIs should:

- explain their contract where the type alone is insufficient;
- use `@public` for supported contracts, `@beta` for provisional APIs, or
  `@internal` for implementation details that must not be exported;
- keep unresolved protocol semantics named conservatively and state the
  evidence boundary;
- update and review `etc/realmlib.api.md` with `npm run api:update`.

Existing undocumented packet fields are a documentation backlog, not evidence
that their wire layout is unstable. Warnings are intentionally visible while
that backlog is reduced incrementally.
