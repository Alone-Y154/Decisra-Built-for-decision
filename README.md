# Decisra (Client)

This folder contains the **Next.js App Router** frontend for **Decisra**.

Decisra is a product concept for **live, focused conversations** with an emphasis on **decision-making**:
- Sessions are **ephemeral** (no persistence in the current implementation).
- The “Verdict” session type is **scope-first** (a decision scope is required).
- A “Scoped AI” panel exists to help clarify trade-offs **within the scope** (currently mocked).

This repo currently focuses on the **product UX and routing** rather than real-time infrastructure.

## What You Can Do In The App

### Marketing / informational pages
The app includes marketing-style pages (About, How it Works, Pricing, Contact, Legal) that explain the product intent.

### Start a session
From the CTA buttons, you can start a session at:

- `/session/new`

You can create:
- **Normal session**: no scope required.
- **Verdict session**: requires a scope (and optional context) and an acknowledgement.

Starting a session generates a simple session id (e.g. `n...` or `v...`) and routes you to a live room.

### Join a live session room
Live session rooms are served at:

- `/session/[sessionId]`

The UI includes:
- Join preview (role selection: participant/observer)
- Audio controls (mocked “mute/leave” UX)
- Participants panel (local-only placeholder)
- Scoped AI panel for verdict sessions (mocked chat)

Important: **Audio and AI are UI-level mocks** right now. There is no WebRTC, no backend, and no persistence.

## Route Map

Core routes:
- `/` – Landing page
- `/about` – Product rationale
- `/how-it-works` – How the session flow works
- `/pricing` – Early access pricing concept
- `/contact` – Contact form (mock submit)
- `/legal` – Privacy/terms sections
- `/session-types` – Explains Normal vs Verdict sessions

Session routes:
- `/session` – Sessions index
- `/session/new` – Start/create a session
- `/session/[sessionId]` – Live session room

Legacy compatibility:
- Requests to `/start-session` and `/sessions/*` are redirected to the canonical `/session/*` routes.
	See `next.config.ts`.

## Tech Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- shadcn/ui-style components in `components/ui/*`
- Radix primitives where helpful (e.g. Alert Dialog, Checkbox)
- lucide-react icons

State management scaffolding exists via Redux Toolkit in `lib/store.ts` (not central to the current UX).

## Project Structure (High Level)

- `app/*` – Next.js App Router routes (pages)
	- `app/session/new/page.tsx` – start session flow
	- `app/session/[sessionId]/page.tsx` – live session room
- `components/session/*` – live session UI building blocks
- `components/ui/*` – small reusable UI primitives (button, input, textarea, etc.)
- `lib/*` – utilities and store setup

## Running Locally

Install dependencies:

```bash
npm install
```

Start dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Start production server:

```bash
npm run start
```

## Troubleshooting

### `npm run dev` fails but `npm run build` works (or vice-versa)
Next.js can cache route/type artifacts. If you recently renamed or removed routes, clear the build output:

```bash
# Windows PowerShell
Remove-Item -Recurse -Force .next
```

Then rerun:

```bash
npm run dev
```

### Missing module errors under `@/components/ui/*`
If you import a UI primitive that doesn’t exist yet, create it under `components/ui/` (this repo uses a shadcn-style layout).

## Current Limitations (By Design)

- No authentication
- No persistence/session history
- No real audio transport (WebRTC not implemented)
- No real AI provider calls (Scoped AI is mocked)

Those pieces can be added later once the UX and flows are validated.
