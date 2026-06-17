# Project Instructions

## Project Scope

This workspace contains a React + TypeScript single-player frontend demo for
`Yang Xiaota Idol Growth Plan`.

## Directory Rules

- `src/config/`: editable game data such as actions, events, gallery entries,
  endings, and image paths.
- `src/utils/`: reusable game logic and storage helpers.
- `src/components/`: presentational UI components.
- `src/pages/`: top-level page views.
- `src/types/`: shared TypeScript types.
- `src/styles/`: global styling.
- `public/images/xiaota/`: replaceable character images.
- `outputs/`: user-facing deliverables only.
- `work/`: temporary notes or scratch files.

## Change Rules

- Keep gameplay numbers out of page components.
- Keep localStorage keys centralized in `src/utils/storage.ts`.
- Prefer small, direct changes over broad refactors.
- Do not add backend, login, or network-dependent gameplay.
- After code changes, run at least `npm run build`.

