---
name: edu-erp-frontend
description: >
  Complete build guide for the EDU-ERP frontend — the web client for a
  multi-tenant SaaS that manages education centers in Uzbekistan. Stack:
  Next.js (App Router) + TypeScript + TanStack Query + Axios + shadcn/ui styled
  as soft neomorphism (white & blue). ALWAYS use this skill for ANY EDU-ERP
  frontend work: pages, layouts, server/client components, data fetching from
  the REAL backend API (never mock data), forms, tables, dashboards, auth,
  tenant-aware routing, RBAC-gated UI, or neomorphic components. Trigger
  whenever the user mentions the EDU-ERP frontend, the o'quv markaz dashboard,
  turning the design into a real app, wiring pages to the API, neomorphism UI,
  or asks to "continue the frontend" / add a screen per this architecture. Even
  small tasks must follow this skill so structure, the API layer, RBAC gating,
  the neomorphic design system, and the strict line-limit stay consistent.
---

# EDU-ERP Frontend

Web client for the EDU-ERP backend. Stack: **Next.js App Router + TypeScript +
TanStack Query + Axios + shadcn/ui (neomorphic, white & blue)**.

## Two rules above all

1. **No file exceeds 140 lines. Hard ceiling 200.** Split before you hit it —
   same discipline as the backend. A page that grows splits into sections; a
   component that grows extracts subcomponents and hooks.
2. **Real API data only. Never mock/hardcode.** Every list, card, and number
   comes from the backend via a typed TanStack Query hook hitting the Axios
   client. No placeholder arrays in components, ever.

## Before you write code

| Task | Read first |
|------|-----------|
| Folder layout, where files go | `references/architecture.md` |
| Build a feature (page + hooks + UI) | `references/feature-pattern.md` |
| Fetch/mutate real API data | `references/data-layer.md` |
| Neomorphic shadcn components + tokens | `references/design-system.md` |
| Auth, tenant, RBAC-gated UI | `references/auth-rbac.md` |
| Keep files small / split | `references/file-limits.md` |
| Naming, forms, errors, conventions | `references/conventions.md` |

## Golden rules

1. **Every file ≤140 lines** (200 max). Split first, always.
2. **Server Components by default.** Add `'use client'` only when you need
   state, effects, or browser APIs. Data fetching that can be server-side, is.
3. **One API resource = one `api/<resource>.ts` + one `hooks/use-<resource>.ts`.**
   Components call hooks, never Axios directly.
4. **No business logic in components.** Compute in hooks/utils; components
   render. A `.tsx` over ~120 lines almost always needs a subcomponent or hook.
5. **RBAC in the UI mirrors the backend.** Gate actions by permission code with
   a `<Can permission="payment.create">` guard, not by role name.
6. **Tenant-aware.** The active tenant comes from subdomain/route context, sent
   on every request; never hardcode it.
7. **Design tokens only.** Use the neomorphic CSS variables and the wrapped
   shadcn components — never raw hex or ad-hoc shadows in feature code.

## Feature scaffolding workflow

When asked to add a screen (e.g. "build the students page"):

1. Read `feature-pattern.md` + `data-layer.md` + `design-system.md`.
2. Add the typed API functions in `lib/api/<resource>.ts`.
3. Add TanStack Query hooks in `lib/hooks/use-<resource>.ts`.
4. Build the route under `app/(dashboard)/<resource>/` — server component for
   layout/data, small client components for interactivity.
5. Compose UI from neomorphic components in `components/ui/`.
6. Gate mutating actions with `<Can>` / permission checks.
7. Verify every file ≤140 lines; split anything that isn't.

## Standard feature shape

```
app/(dashboard)/students/
├── page.tsx                 # server component: header + <StudentTable/>
├── _components/
│   ├── student-table.tsx    # client: uses useStudents(), renders rows
│   ├── student-row.tsx      # one row
│   └── add-student-dialog.tsx
lib/
├── api/students.ts          # axios calls, typed
├── hooks/use-students.ts     # useStudents, useCreateStudent ...
└── types/student.ts          # Student type (mirrors backend)
```

## What "done" looks like

Every file ≤140 lines; all data from real API hooks (zero mock arrays); server
components by default; mutating UI gated by permission; styling uses neomorphic
tokens/components only; loading + error + empty states handled. Missing any of
these → not done.
