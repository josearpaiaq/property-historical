# Property Historical App

Personal property maintenance tracker — a historical ledger for all repairs, fixes, changes, and improvements made to your properties.

## Tech Stack

- **Backend:** NestJS + Drizzle ORM + PostgreSQL
- **Frontend:** React 18 + Vite + TailwindCSS + shadcn/ui
- **State:** TanStack Query (server) + Zustand (client)
- **Auth:** JWT (bcrypt + passport)
- **File Storage:** AWS S3 (pre-signed URLs)
- **Infrastructure:** Railway (backend) + Vercel (frontend) + Neon (database) + S3 (files)

## Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- pnpm (`npm install -g pnpm`)
- Docker (for PostgreSQL)

### 1. Start PostgreSQL
```bash
docker compose -f docker-compose.dev.yml up -d
```

### 2. Setup Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your local values
pnpm install
pnpm run db:generate   # Generate Drizzle migrations
pnpm run db:migrate    # Apply migrations
pnpm run dev           # Start on http://localhost:3000
```

### 3. Setup Frontend
```bash
cd frontend
pnpm install
pnpm run dev           # Start on http://localhost:5173
```

The frontend proxies `/api` requests to `localhost:3000` via Vite dev server.

## Project Structure

```
property-historical-app/
├── backend/
│   ├── src/
│   │   ├── auth/           # JWT authentication (register, login, me)
│   │   ├── properties/     # Property CRUD
│   │   ├── events/         # Event logging with filters
│   │   ├── attachments/    # File upload/download via S3
│   │   ├── reminders/      # Recurring maintenance reminders
│   │   └── database/       # Drizzle ORM schema & provider
│   ├── Dockerfile          # Multi-stage build for Railway
│   ├── railway.toml        # Railway deployment config
│   └── drizzle.config.ts   # Migration config
├── frontend/
│   ├── src/
│   │   ├── components/     # UI components (shadcn/ui)
│   │   ├── pages/          # Route pages
│   │   ├── hooks/          # TanStack Query hooks
│   │   ├── stores/         # Zustand stores
│   │   └── lib/            # API client, utilities
│   ├── vercel.json         # Vercel SPA config
│   └── vite.config.ts
├── docker-compose.dev.yml  # PostgreSQL for local development
└── .github/workflows/
    ├── ci.yml              # Build & lint on PR
    └── deploy.yml          # Deploy to Railway + Vercel
```

## API Endpoints

All endpoints under `/api` prefix.

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/register | Create account |
| POST | /auth/login | Sign in |
| GET | /auth/me | Get current user |

### Properties (authenticated)
| Method | Path | Description |
|--------|------|-------------|
| GET | /properties | List all |
| POST | /properties | Create |
| GET | /properties/:id | Get one |
| PUT | /properties/:id | Update |
| DELETE | /properties/:id | Delete |

### Events (authenticated)
| Method | Path | Description |
|--------|------|-------------|
| GET | /properties/:id/events | List with filters |
| POST | /properties/:id/events | Create |
| GET | /events/:id | Get one |
| PUT | /events/:id | Update |
| DELETE | /events/:id | Delete |

### Attachments (authenticated)
| Method | Path | Description |
|--------|------|-------------|
| POST | /events/:id/attachments | Get upload URL |
| GET | /attachments/:id | Get download URL |
| DELETE | /attachments/:id | Delete |

### Reminders (authenticated)
| Method | Path | Description |
|--------|------|-------------|
| GET | /properties/:id/reminders | List |
| POST | /properties/:id/reminders | Create |
| PUT | /reminders/:id | Update |
| DELETE | /reminders/:id | Delete |
| POST | /reminders/:id/complete | Mark complete |

## Deployment

### Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Vercel    │────▶│   Railway    │────▶│    Neon     │
│  (Frontend) │     │  (Backend)   │     │ (PostgreSQL) │
└─────────────┘     └──────┬───────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   AWS S3    │
                    │ (Attachments)│
                    └─────────────┘
```

### Service Setup

#### 1. Neon (Database)
1. Create a project at [neon.tech](https://neon.tech)
2. Copy the connection string (starts with `postgres://...@...neon.tech/...`)
3. Set as `DATABASE_URL` in Railway

#### 2. Railway (Backend)
1. Create a project at [railway.app](https://railway.app)
2. Connect your GitHub repo, select the `backend/` directory
3. Set environment variables:
   - `DATABASE_URL` — Neon connection string
   - `JWT_SECRET` — secure random string (32+ chars)
   - `JWT_EXPIRATION` — `7d`
   - `AWS_REGION` — `us-east-1`
   - `AWS_S3_BUCKET` — your S3 bucket name
   - `AWS_ACCESS_KEY_ID` — IAM user key (S3 access only)
   - `AWS_SECRET_ACCESS_KEY` — IAM user secret
   - `FRONTEND_URL` — your Vercel URL (for CORS)
   - `NODE_ENV` — `production`
   - `PORT` — `3000`

#### 3. Vercel (Frontend)
1. Import your repo at [vercel.com](https://vercel.com)
2. Set root directory to `frontend/`
3. Set environment variable:
   - `VITE_API_URL` — Railway backend URL + `/api` (e.g. `https://your-app.railway.app/api`)

#### 4. AWS S3 (File Storage)
Keep your existing S3 bucket. Create an IAM user with only S3 permissions:
```json
{
  "Effect": "Allow",
  "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
  "Resource": "arn:aws:s3:::your-bucket-name/*"
}
```

### GitHub Secrets (for CI/CD)
```
RAILWAY_TOKEN              - Railway project deploy token
VERCEL_TOKEN               - Vercel personal access token
```

### Run Migrations on Neon
```bash
cd backend
DATABASE_URL="postgres://...@...neon.tech/neondb?sslmode=require" pnpm run db:migrate
```

## Database Migrations

```bash
cd backend
pnpm run db:generate  # Create migration from schema changes
pnpm run db:migrate   # Apply pending migrations
pnpm run db:studio    # Open Drizzle Studio (visual DB browser)
```
