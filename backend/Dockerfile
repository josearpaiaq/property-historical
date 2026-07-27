# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9 --activate

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install all dependencies (including dev for build)
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY . .

# Build
RUN pnpm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9 --activate

# Copy package files and install only prod deps
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --prod --no-frozen-lockfile

# Copy built output and migrations
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle
COPY drizzle.config.ts ./

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "dist/main"]
