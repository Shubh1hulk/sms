# Nova Campus SMS

Role-aware student management system with a browser-first portal, a stateful Node API, and a Python analytics service.

## Why this exists

This is not a brochure site or a static school page. The repo is structured as a small campus operating system: authenticated role surfaces, workflow endpoints, and a shared dashboard model that is rendered differently for students, parents, staff, and admins.

## Runtime topology

- `apps/web` is a Next.js 15 App Router frontend using React Server Components, typed routes, and client components only where local interaction is required.
- `apps/api` is a Node.js 22 Express service that owns authentication, workflow mutation, and persistence.
- `node:sqlite` provides the primary persistence layer, so the data path is local, transactional, and zero-ORM.
- `services/analytics` is a FastAPI service for non-transactional insights and future ML/automation workloads.

## Contract surface

- Session state is stored in SQLite and surfaced through an HttpOnly cookie named `sms_session`.
- Login is routed through `/api/auth/login`, session introspection through `/api/auth/me`, and logout through `/api/auth/logout`.
- Admissions live under `/api/admissions`.
- Attendance mutation lives under `/api/attendance/mark`.
- Fee invoice and payment workflows live under `/api/fees/invoices` and `/api/fees/payments`.
- Append-only audit events live under `/api/audit` and capture auth and workflow mutations.
- The homepage and role routes consume a shared dashboard snapshot so the UI stays consistent across surfaces.

## Schema shape

- `users` stores identity, role, password hash, and salt.
- `sessions` stores bearer tokens and expiry windows.
- `students` stores academic identity, guardian linkage, attendance rate, GPA, and fee balance.
- `schedule_items`, `grades`, and `tasks` back the student dashboard.
- `announcements` backs the broadcast stream.
- `admissions`, `attendance_records`, `fee_invoices`, and `fee_payments` back the operational workflows.
- `audit_log` stores append-only actor/event/entity metadata for auth and workflow observability.

## Frontend surfaces

- `/` renders the campus overview and role switcher.
- `/login` performs auth and redirects by role.
- `/student`, `/parent`, `/staff`, and `/admin` are dedicated audience entry points.
- `/admissions`, `/attendance`, and `/fees` are direct workflow pages with live form submission.

## Demo credentials

- Student: `ava@novacampus.dev` / `Demo@1234`
- Parent: `olivia@novacampus.dev` / `Demo@1234`
- Teacher: `daniel@novacampus.dev` / `Demo@1234`
- Admin: `admin@novacampus.dev` / `Demo@1234`

## Validation

- Web build: passing
- API build: passing
- Python syntax: passing

## Notes for contributors

- The repo intentionally avoids a heavy ORM so the persistence logic remains inspectable.
- Route typing is enabled in Next.js, so redirects should be kept compatible with App Router typed routes.
- The SQLite seed data exists to make the UI and workflow pages immediately usable after first boot.
