# Developer handbook

Vewave is a shared workspace for watching together, with account preferences, community servers, and studio tools. This handbook explains where the code lives, how the systems connect, and how to make a change without breaking their contracts.

## Start with a running workspace

Follow [Local setup](getting-started.md), then use the [Repository map](repository-map.md) to locate the feature you need. The workspace contains two independent Git projects: the React client and the Bun API. Run commands from the project they belong to.

The in-app handbook lives at `/admin/docs` and requires an administrator account. The same Markdown files are readable directly in `client/docs/`; you do not need a running application to read them.

## Find the right guide

| Task                                                 | Read first                                        |
| ---------------------------------------------------- | ------------------------------------------------- |
| Add a page or change feature state                   | [Application architecture](architecture.md)       |
| Change a request, response, or room event            | [API and realtime contracts](contracts.md)        |
| Change glass, modal rendering, or interaction motion | [Glass and motion](glass-motion.md)               |
| Change themes, backgrounds, or saved preferences     | [Appearance preferences](appearance.md)           |
| Change sign-in, registration, or session handling    | [Authentication](authentication.md)               |
| Diagnose a failure or choose checks                  | [Testing and troubleshooting](testing.md)         |
| Prepare a change for review                          | [Making and documenting changes](contributing.md) |

## Follow ownership boundaries

For practical implementation constraints outside glass and authentication, read [Client maintenance notes](client-maintenance.md).

A route chooses a layout and page. A feature module owns behavior. Reusable components own their interaction contracts. Shared primitives supply small controls. The API separates transport, business rules, and persistence.

Before moving code, find its owner in the repository map. Shared use alone does not make feature logic a generic primitive.

## Use the existing references

The [UI guide](/admin/docs/ui) and [component catalog](/admin/docs/ui/components) retain live examples, usage snippets, and public prop documentation. This handbook covers system context and maintenance.

Root `AGENTS.md` and `client/AGENTS.md` define contribution rules. `client/DESIGN.md` remains the visual design reference. OpenAPI is the REST contract; generated client code is an output of that contract.

## Keep context close to changes

Update the relevant Markdown guide when ownership, lifecycle, persistence, or a contract changes. Put explanations here and express code intent through names, types, and structure. Preserve required licenses and generated notices.
