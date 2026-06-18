# Agent Guide — TaskMaster

This guide is written for AI coding agents working on the `task-management` repository. It reflects the actual files and configuration in the project; do not rely on the human `README.md` alone because some details there are slightly out of date.

---

## Project overview

**TaskMaster** is a team task-management web application. It provides a drag-and-drop Kanban board, role-based access control, user management, and a simple rich-text task editor. The app is built around the idea of a single workspace (`Company`) with two user roles:

- `ADMIN` — can create/delete/reorder board sections, add users, and change passwords.
- `USER` — can view and manage tasks.

The project uses **Next.js with the App Router**, **React Server Components**, **Server Actions**, **Prisma ORM**, and **SQLite**.

---

## Technology stack

- **Framework / runtime:** Next.js `16.1.6`, React `19.2.3`, TypeScript `5`
- **Styling:** Tailwind CSS `v4` (`@tailwindcss/postcss`), CSS variables in `app/globals.css`
- **Database:** SQLite via Prisma `5.22.0` (`@prisma/client`)
- **Authentication:** Custom JWT session with `jose` + `bcryptjs`, stored in an HTTP-only `session` cookie
- **Drag & drop:** `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- **Animation / UX:** `framer-motion`, `lucide-react`
- **Utilities:** `clsx`, `tailwind-merge` (used in a local `cn` helper)
- **Package managers:** Both `package-lock.json` and `yarn.lock` exist; use one consistently (npm is fine)

> Note: The `README.md` says "Next.js 15", but `package.json` pins Next.js to `16.1.6`.

---

## Project structure

```text
app/
  actions/              # Server Actions (auth, board, setup, tasks, users)
  components/
    layout/             # Header, Sidebar
    ui/                 # Reusable primitives: Button, Card, Input, Modal, RichTextEditor
  dashboard/
    components/         # Board, Column, TaskCard, TaskDetailModal, CreateTaskButton, TaskStatusSelect
    users/              # Users page + CreateUserButton, ChangePasswordButton
    layout.tsx          # Dashboard shell (sidebar + header)
    page.tsx            # Kanban board page
    settings/page.tsx   # Workspace settings (admin only)
    users/page.tsx      # Team management (admin only)
  login/page.tsx        # Login form
  register/page.tsx     # Workspace creation form
  setup/page.tsx        # Initial setup page
  layout.tsx            # Root layout with Geist font
  globals.css           # Tailwind v4 theme + CSS variables
  page.tsx              # Landing page; redirects to /setup or /dashboard
lib/
  auth.ts               # JWT encrypt/decrypt, cookie helpers, session helpers
  prisma.ts             # Prisma client singleton
prisma/
  schema.prisma         # Company, User, Section, Task models
  dev.db                # Local SQLite file
  config.ts.bak         # Backup of a Prisma config file; not currently used
middleware.ts           # Route guards: redirect unauthenticated users away from /dashboard
next.config.ts          # Default empty Next.js config
postcss.config.mjs      # Tailwind v4 PostCSS plugin
eslint.config.mjs       # Next.js ESLint config
```

There are **no API routes** (`app/api`) in the current codebase. All data mutations go through Server Actions.

---

## Configuration and environment

Create a `.env` file in the project root (`.env*` is gitignored). Required variables:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="<strong-random-secret>"
```

- `DATABASE_URL` points to the SQLite file. The repo already contains `dev.db` files in both the root and `prisma/`, so make sure the path matches the file you intend to use.
- `JWT_SECRET` is used to sign the session cookie. The code has a fallback default secret (`"default_dev_secret_key"`) for development, but you must set a real secret for any deployed environment.

---

## Database schema

Models (`prisma/schema.prisma`):

- `Company` — single workspace; has many `User`, `Task`, `Section`.
- `User` — email is unique; role is `ADMIN` or `USER`; belongs to one `Company`.
- `Section` — a Kanban column with an `order` field.
- `Task` — has a creator, optional assignee, company, and optional section. `priority` defaults to `MEDIUM`. There is also a legacy `status` field.

No Prisma migrations are committed in this repository. To initialize the schema locally:

```bash
npx prisma migrate dev --name init
```

For quick prototyping you can also use:

```bash
npx prisma db push
```

---

## Build, dev, and test commands

```bash
# Install dependencies
npm install

# Run the development server on http://localhost:3000
npm run dev

# Production build
npm run build

# Start the production server
npm run start

# Lint with the Next.js ESLint config
npm run lint
```

There is **no test suite** configured. `package.json` does not define a `test` script, and `.gitignore` ignores `/coverage`.

---

## Authentication and authorization

- Sessions are stored in an HTTP-only cookie named `session`.
- `lib/auth.ts` signs a JWT (`HS256`, 24-hour expiry) containing `{ user, expires }`.
- `middleware.ts` redirects unauthenticated users away from `/dashboard` and redirects logged-in users away from `/login`, `/register`, `/`, and `/setup`.
- Server Actions check `session.user.role` for admin-only operations.
- The first user created during setup/register is automatically assigned `ADMIN`.

---

## Code conventions

- Path alias: `@/*` maps to the project root.
- Server Actions live in `app/actions/*.ts` and start with `"use server"`.
- Most interactive UI is implemented as Client Components (`"use client"`) and calls Server Actions via form `action` or event handlers.
- UI primitives define a local `cn(...)` helper combining `clsx` and `tailwind-merge`.
- Tailwind theme colors are CSS custom properties declared in `app/globals.css` and referenced via `@theme`.
- After mutations, Server Actions usually call `revalidatePath("/dashboard")` (or `/dashboard/users`) and/or the client calls `window.location.reload()` for a full refresh.
- `any` is used frequently in component props; type safety is not strict throughout.

---

## Security notes

- The JWT fallback secret is insecure and must be overridden via `JWT_SECRET` in production.
- Passwords are hashed with `bcryptjs` (cost 10–12 depending on the action).
- The session cookie is HTTP-only but not explicitly marked `secure` or `sameSite` in `lib/auth.ts`.
- Rich-text task descriptions are rendered with `dangerouslySetInnerHTML`. There is no sanitization step, so persisted HTML could become an XSS vector if untrusted users can inject content.
- `TaskDetailModal` has a permissive `canEdit` check (`task.creatorId === currentUserId || true`), so currently any user can edit/delete tasks from the UI; the backend Server Actions do enforce creator-or-admin checks, but the UI flag is misleading.
- The app limits the system to a single `Company` workspace (`prisma.company.count() > 0` blocks further registration).

---

## Deployment considerations

- This is a standard Next.js app; the default output target is a Node.js server (`next build` / `next start`).
- SQLite and serverless hosting do not mix well. For production deployments, switch to PostgreSQL (or another managed database) by updating `DATABASE_URL` and the Prisma `provider`.
- There is no Dockerfile, CI config, or static-export configuration in the repo.

---

## Useful references

- `package.json` — source of truth for scripts and dependency versions.
- `prisma/schema.prisma` — database schema.
- `app/actions/` — all data mutations.
- `middleware.ts` — routing/auth guards.
- `lib/auth.ts` — session/JWT logic.

---

License: MIT (see `LICENSE`).
