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
- **Database:** PostgreSQL (via AWS RDS)
- **Auth:** JWT-based authentication (simple for single-user, extensible later)
- **File Storage:** AWS S3 (pre-signed URLs for uploads/downloads)

### Frontend
- **Framework:** React 18+
- **Build Tool:** Vite
- **State Management:** TanStack Query (server state) + Zustand (client state)
- **UI:** TailwindCSS + shadcn/ui (accessible, customizable components)
- **Routing:** React Router v6+

### Infrastructure (AWS)
- **Backend Hosting:** ECS Fargate (containerized, scales to near-zero, no server management)
- **Frontend Hosting:** S3 + CloudFront (static SPA hosting, global CDN)
- **Database:** RDS PostgreSQL (db.t4g.micro — 2 vCPUs, 1 GB RAM)
- **File Storage:** S3 Standard
- **DNS:** Route 53 (optional, if custom domain)
- **CI/CD:** GitHub Actions (build + deploy)

> Note: AWS App Runner was deprecated for new customers as of April 2026. ECS Fargate is the recommended alternative with similar simplicity.

---

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────┐
│  React SPA      │────────▶│  NestJS API      │────────▶│  PostgreSQL │
│  (S3+CloudFront)│         │  (ECS Fargate)   │         │  (RDS)      │
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

## Estimated Monthly Cost (AWS)

For a single-user, low-traffic personal app:

| Service | Spec | Monthly Cost |
|---------|------|--------------|
| RDS PostgreSQL | db.t4g.micro, 20 GB gp3, Single-AZ | ~$15–22/mo (on-demand) |
| ECS Fargate | 0.25 vCPU, 0.5 GB RAM, low usage | ~$5–10/mo |
| S3 (file storage) | <5 GB stored, minimal requests | ~$0.12–0.50/mo |
| S3 + CloudFront (frontend) | Static SPA, low traffic | ~$0.50–1.00/mo (free tier covers most) |
| Route 53 | 1 hosted zone | $0.50/mo |
| Data transfer | Minimal | ~$0–1/mo |
| **Total estimate** | | **~$22–35/mo** |

### Cost optimization notes:
- **RDS Free Tier:** If on a new AWS account (created before July 2025), the first 12 months include 750 hrs/mo of db.t4g.micro — effectively **free for year one**.
- **After free tier:** Consider Reserved Instances ($8.47/mo for 1-year commitment on db.t4g.micro).
- **Alternative (cheaper):** Use Neon or Supabase managed Postgres (free tier with generous limits) during development, migrate to RDS for production.
- **ECS Fargate can be reduced** by using Lambda + API Gateway instead (~$0–3/mo for very low traffic, but adds cold start latency).

### Cheapest viable production setup (~$10–15/mo):
- RDS db.t4g.micro with 1-year reserved: ~$8.50/mo
- ECS Fargate (minimal): ~$5/mo
- S3 + CloudFront: ~$1/mo
- Route 53: $0.50/mo

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
