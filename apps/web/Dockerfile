# ─── Stage 1: base ───────────────────────────────────────────────────────────
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.26.0 --activate

# ─── Stage 2: installer ──────────────────────────────────────────────────────
FROM base AS installer
WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/web/package.json        ./apps/web/package.json
COPY packages/shared/package.json ./packages/shared/package.json

RUN pnpm install --frozen-lockfile

# ─── Stage 3: builder ────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app

COPY --from=installer /app/node_modules           ./node_modules
COPY --from=installer /app/apps/web/node_modules  ./apps/web/node_modules

COPY packages/shared/ ./packages/shared/
COPY apps/web/        ./apps/web/

# NEXT_PUBLIC_* vars that need to be baked into the build go here, e.g.:
# ARG NEXT_PUBLIC_API_URL=http://api:8080
# ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /app/apps/web
RUN pnpm build

# ─── Stage 4: runner ─────────────────────────────────────────────────────────
# next build with output:"standalone" produces a self-contained server.
# outputFileTracingRoot is set to the monorepo root, so the standalone
# output mirrors the monorepo layout: apps/web/server.js
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Standalone bundle (includes its own node_modules)
COPY --from=builder /app/apps/web/.next/standalone ./

# Static assets must be copied separately — standalone does not include them
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public       ./apps/web/public

EXPOSE 3000
CMD ["node", "apps/web/server.js"]
