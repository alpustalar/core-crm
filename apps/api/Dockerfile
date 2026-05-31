# base ───────────────────────────────────────────────────────────
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.26.0 --activate

# installer ──────────────────────────────────────────────────────
FROM base AS installer
WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api/package.json            ./apps/api/package.json
COPY packages/shared/package.json     ./packages/shared/package.json

RUN pnpm install --frozen-lockfile

# builder ────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app


COPY --from=installer /app/node_modules            ./node_modules
COPY --from=installer /app/apps/api/node_modules   ./apps/api/node_modules

# Copy source
COPY packages/shared/ ./packages/shared/
COPY apps/api/        ./apps/api/

# Generate Prisma client 
WORKDIR /app/apps/api
RUN pnpm prisma:generate

# Compile TypeScript → dist/
# Output structure: apps/api/dist/apps/api/src/...  +  apps/api/dist/packages/shared/...
RUN pnpm build

# runner ─────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/api/dist/ ./

COPY --from=builder /app/node_modules          ./node_modules

COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

COPY --from=builder /app/apps/api/src/infrastructure/persistence/prisma/schema     ./prisma/schema
COPY --from=builder /app/apps/api/src/infrastructure/persistence/prisma/migrations  ./prisma/migrations

COPY apps/api/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

RUN mkdir -p ./secrets

EXPOSE 8080
ENTRYPOINT ["./docker-entrypoint.sh"]
