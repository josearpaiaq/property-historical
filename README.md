# Property Historical App

Personal property maintenance tracker — a historical ledger for all repairs, fixes, changes, and improvements made to your properties.

## Tech Stack

- **Backend:** NestJS + Drizzle ORM + PostgreSQL
- **Frontend:** React 18 + Vite + TailwindCSS + shadcn/ui
- **State:** TanStack Query (server) + Zustand (client)
- **Auth:** JWT (bcrypt + passport)
- **File Storage:** AWS S3 (pre-signed URLs)
- **Infrastructure:** ECS Fargate + RDS PostgreSQL + S3 + CloudFront

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
│   ├── Dockerfile          # Multi-stage build for ECS
│   └── drizzle.config.ts   # Migration config
├── frontend/
│   ├── src/
│   │   ├── components/     # UI components (shadcn/ui)
│   │   ├── pages/          # Route pages
│   │   ├── hooks/          # TanStack Query hooks
│   │   ├── stores/         # Zustand stores
│   │   └── lib/            # API client, utilities
│   └── vite.config.ts
├── docker-compose.yml      # Full stack (backend + postgres)
├── docker-compose.dev.yml  # Only postgres (for local dev)
└── .github/workflows/
    ├── ci.yml              # Build & lint on PR
    └── deploy.yml          # Deploy to AWS (ECS + S3)
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

### AWS Infrastructure Needed
1. **ECR** — Container registry for backend image
2. **ECS Fargate** — Runs the backend container
3. **RDS PostgreSQL** — db.t4g.micro, single-AZ
4. **S3 Bucket** — For file attachments
5. **S3 Bucket + CloudFront** — For frontend SPA hosting

### GitHub Secrets Required
```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
API_URL (e.g., https://api.yourapp.com/api)
FRONTEND_BUCKET (S3 bucket name)
CLOUDFRONT_DISTRIBUTION_ID
```

### Deploy Manually
```bash
# Backend → Docker → ECR → ECS
cd backend
docker build -t property-historical-backend .
docker tag property-historical-backend:latest <ECR_URI>:latest
docker push <ECR_URI>:latest

# Frontend → S3
cd frontend
VITE_API_URL=https://api.yourapp.com/api pnpm run build
aws s3 sync dist/ s3://your-frontend-bucket --delete
```

## Database Migrations

```bash
cd backend
pnpm run db:generate  # Create migration from schema changes
pnpm run db:migrate   # Apply pending migrations
pnpm run db:studio    # Open Drizzle Studio (visual DB browser)
```
