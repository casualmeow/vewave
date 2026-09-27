# Making and documenting changes

Keep changes within the owning layer and make the result easy for the next programmer to understand.

## Before editing

Read root `AGENTS.md`, `client/AGENTS.md` for frontend work, and the relevant handbook guide. Inspect the working tree in each Git project so existing edits are preserved.

Use npm in the client and Bun in the server. Do not introduce another lockfile or move code between projects without a contract reason.

## Write code without comments

Express intent through names, types, and structure. Put architectural explanations, lifecycle constraints, and maintenance instructions in Markdown.

Do not add explanatory line, block, JSDoc, JSX, CSS, or shader comments to authored code. Preserve legally required notices, generated files, and necessary tool directives. Do not use suppression comments to avoid fixing a typing error.

When removing an explanation from code, retain useful information in its owning guide. Do not copy obsolete history into documentation.

This policy covers the entire client `src/` tree. Generated REST files and the route tree are cleaned by their generation hooks, so regeneration does not restore commentary. See [Client maintenance notes](client-maintenance.md#generated-source-policy) for the pipeline and the location of API documentation.

## Maintain the handbook

Markdown sources live in `client/docs/`. Register pages in `src/modules/docs/content/handbook-manifest.ts` with a unique slug, title, description, group, order, and source path.

Use one H1 matching the registered title. Use H2 and H3 headings for navigation; anchors are generated consistently for the page, table of contents, and search.

Link other handbook pages with relative filenames:

```text
[Appearance preferences](appearance.md)
[Account saves](appearance.md#account-saves)
```

The renderer converts these links to app routes. They also work when reading the Markdown directly in Git. Use fenced code blocks, tables, and ordinary Markdown; raw HTML and executable Markdown are disabled.

Keep the handbook focused on system context. Public reusable-component props, usage examples, and accessibility behavior belong in the existing component documentation.

## When documentation must change

| Code change                                | Update                                              |
| ------------------------------------------ | --------------------------------------------------- |
| Folder ownership or module boundary        | Repository map and architecture                     |
| REST or realtime shape                     | Contract guide and affected generated clients/tests |
| Glass backend, lifecycle, or motion policy | Glass and motion                                    |
| Saved preference or account behavior       | Appearance preferences                              |
| Auth guard or session flow                 | Authentication and contracts                        |
| Validation command or fixture requirement  | Testing and troubleshooting                         |

`DESIGN.md` remains the canonical visual-policy file. Link or name it instead of maintaining a competing copy.

## Review handoff

Summarize the changed behavior and the checks that support it. List material limitations honestly. Keep generated artifacts, dependency folders, environment files, and local runtime data out of commits.

Do not add unrelated refactors or repair incidental failures outside the task. A small change needs a small verification pass; a broad contract change needs the relevant checks on both sides.
