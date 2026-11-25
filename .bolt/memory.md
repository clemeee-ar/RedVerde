# Project memory

## Product intent & audience

- App appears to be a map/corridor designer tool (imports reference `Designer`, `corridors`, `scenario`, `map`, `Sidebar`).

## Brand personality & voice

- User communicates in Spanish; assistant responses mix English framing with Spanish explanations. Prefer Spanish for user-facing summaries.

## Visual design & UX direction

- Tailwind CSS in use; components organized in root-level `ui/` folder (not `components/ui/`).
- Layout components in root-level `layout/` (e.g., `Sidebar`).

## Decisions, constraints & rationale

- **Flat root structure**: All app files live directly in project root; there is no `src/` folder. Do not move, delete, or duplicate files.
- **Config corrections already applied**:
  - `index.html` entry: `/main.tsx`
  - `vite.config.ts` alias `@` → `path.resolve(__dirname, '.')`
  - `tsconfig.app.json` paths `@/*` → `./*`; include → `./**/*.ts`, `./**/*.tsx`
  - `tailwind.config.js` content paths corrected to cover root `.ts`/`.tsx` and subfolders (`ui/`, `corridor/`, `map/`, `layout/`, etc.)
- **User constraint**: Only config changes were permitted; no refactoring.

## Open questions & assumptions

- **Blocking issue**: Hundreds of import path errors remain — code still references old `src/`-based paths (`./components/layout/Sidebar`, `./pages/Designer`, `../../types`, `@/lib/utils`, `@/components/ui/...`). Actual files are at root (`layout/Sidebar.tsx`, `Designer/index.tsx`, `utils.ts`, `ui/`).
- Awaiting user approval to rewrite import paths across the codebase to match the flat structure.