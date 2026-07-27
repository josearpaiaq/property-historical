# Property Historical App — Initial Spec

## Overview

A personal property maintenance tracker where homeowners can log and track all repairs, fixes, changes, and improvements made to properties they own. Acts as a historical ledger for everything that happens to your properties over time.

---

## Scope & Users

- **Multi-property:** A user can manage multiple properties.
- **Single user:** Initially designed for one authenticated user. Multi-user support (household sharing) can be added later.

---

## Core Features

### 1. Property Management
- Add, edit, and remove properties
- Property details: name, address, type (house, apartment, land, etc.), purchase date, photos

### 2. Event Logging
- Log repairs, fixes, improvements, and changes per property
- Event fields: date, title, description, cost, category, status (planned / in-progress / completed)
- Categories: plumbing, electrical, structural, HVAC, painting, landscaping, appliances, general, other

### 3. File Attachments
- Attach photos and documents to events (receipts, before/after photos, invoices, warranties)
- Stored in AWS S3
- Support image preview and document download

### 4. Timeline / History View
- Chronological timeline of all events per property
- Visual timeline with category color coding
- Summary cards with key info (date, cost, category)

### 5. Search & Filtering
- Full-text search across event titles and descriptions
- Filter by: property, category, date range, cost range, status
- Sort by: date, cost, category

### 6. Recurring Maintenance Reminders
- Create reminders for recurring tasks (e.g., HVAC filter every 3 months, gutter cleaning yearly)
- Notification system (email or in-app)
- Mark reminders as completed, which auto-creates an event log

---

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** NestJS
- **ORM:** Drizzle ORM (type-safe, lightweight, better migration control than Prisma)
- **Database:** PostgreSQL (via Neon — serverless)
- **Auth:** JWT-based authentication (simple for single-user, extensible later)
- **File Storage:** AWS S3 (pre-signed URLs for uploads/downloads)

### Frontend
- **Framework:** React 18+
- **Build Tool:** Vite
- **State Management:** TanStack Query (server state) + Zustand (client state)
- **UI:** TailwindCSS + shadcn/ui (accessible, customizable components)
- **Routing:** React Router v6+

### Infrastructure
- **Backend Hosting:** Railway (containerized NestJS, auto-deploys from GitHub)
- **Frontend Hosting:** Vercel (static SPA hosting, global CDN, auto-deploys)
- **Database:** Neon (serverless PostgreSQL)
- **File Storage:** AWS S3 (pre-signed URLs)
- **CI/CD:** GitHub Actions (build + deploy via Railway CLI and Vercel CLI)

---

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────┐
│  React SPA      │────────▶│  NestJS API      │────────▶│  PostgreSQL │
│  (Vercel)       │         │  (Railway)       │         │  (Neon)     │
└─────────────────┘         └──────────────────┘         └─────────────┘
                                     │
                                     ▼
                            ┌──────────────────┐
                            │  AWS S3          │
                            │  (file storage)  │
                            └──────────────────┘
```

The backend is a standalone REST API, intentionally decoupled from the frontend so it can serve a mobile app in the future.

---

## Estimated Monthly Cost

For a single-user, low-traffic personal app:

| Service | Spec | Monthly Cost |
|---------|------|--------------|
| Neon PostgreSQL | Free tier (0.5 GB storage, 190 compute hours) | $0/mo |
| Railway | Hobby plan ($5 credit), low usage | ~$0–5/mo |
| Vercel | Hobby (free) | $0/mo |
| S3 (file storage) | <5 GB stored, minimal requests | ~$0.12–0.50/mo |
| **Total estimate** | | **~$0–5/mo** |

### Cost notes:
- **Neon Free Tier** includes 0.5 GB storage and auto-suspend after 5 min idle — perfect for personal use.
- **Railway** gives $5/mo free credit on the Hobby plan. Typical usage for a low-traffic API fits within this.
- **Vercel Hobby** is free for personal projects with generous limits.

---

## Database Schema (High Level)

### Tables:
- **users** — id, email, password_hash, name, created_at
- **properties** — id, user_id, name, address, type, purchase_date, notes, created_at
- **events** — id, property_id, title, description, date, cost, category, status, created_at, updated_at
- **attachments** — id, event_id, file_name, s3_key, file_type, file_size, created_at
- **reminders** — id, property_id, title, description, frequency_days, last_completed_at, next_due_at, is_active, created_at

---

## API Endpoints (Initial)

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

### Properties
- `GET /properties`
- `POST /properties`
- `GET /properties/:id`
- `PUT /properties/:id`
- `DELETE /properties/:id`

### Events
- `GET /properties/:id/events` (with query params for search/filter)
- `POST /properties/:id/events`
- `GET /events/:id`
- `PUT /events/:id`
- `DELETE /events/:id`

### Attachments
- `POST /events/:id/attachments` (get pre-signed upload URL)
- `GET /attachments/:id` (get pre-signed download URL)
- `DELETE /attachments/:id`

### Reminders
- `GET /properties/:id/reminders`
- `POST /properties/:id/reminders`
- `PUT /reminders/:id`
- `DELETE /reminders/:id`
- `POST /reminders/:id/complete`

---

## Development Phases

### Phase 1 — Foundation
- Project scaffolding (NestJS backend, React frontend, monorepo setup)
- Database schema + migrations with Drizzle
- Auth (JWT login/register)
- Property CRUD

### Phase 2 — Core Features
- Event logging CRUD
- File upload/download with S3
- Timeline view (frontend)

### Phase 3 — Enhanced UX
- Search & filtering
- Dashboard with stats (total spent, events per category)
- Responsive/mobile-friendly UI

### Phase 4 — Reminders & Polish
- Recurring reminders system
- Email notifications (SES)
- Data export (CSV/PDF)

---

## Open Questions
- Custom domain needed? (adds Route 53 + ACM certificate cost — minimal)
- Email provider for reminders? (AWS SES is pennies for low volume)
- Future mobile app: React Native or Flutter?
