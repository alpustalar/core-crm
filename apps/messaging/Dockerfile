# base ───────────────────────────────────────────────────────────
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.26.0 --activate

# installer ──────────────────────────────────────────────────────
FROM base AS installer
WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/messaging/package.json       ./apps/messaging/package.json
COPY packages/shared/package.json      ./packages/shared/package.json
COPY packages/nest-kernel/package.json ./packages/nest-kernel/package.json

RUN pnpm install --frozen-lockfile

# builder ────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app

COPY packages/shared/      ./packages/shared/
COPY packages/nest-kernel/ ./packages/nest-kernel/
COPY apps/messaging/       ./apps/messaging/

# node_modules kaynak kopyasından SONRA gelir: .dockerignore bağlamdan
# **/node_modules'ü dışladığı için üstlerine yazacak bir şey yok, ama sıra
# tersine dönerse paketlerin bağımlılıkları kaybolur.
#
# pnpm'in katı düzeninde her workspace paketi kendi node_modules'ünü taşır;
# paketlerinki atlanırsa `packages/shared` derlenirken kendi bağımlılığını
# (zod) bulamaz ve build "Cannot find module 'zod'" ile düşer.
COPY --from=installer /app/node_modules                     ./node_modules
COPY --from=installer /app/apps/messaging/node_modules      ./apps/messaging/node_modules
COPY --from=installer /app/packages/shared/node_modules     ./packages/shared/node_modules
COPY --from=installer /app/packages/nest-kernel/node_modules ./packages/nest-kernel/node_modules

# Prisma üretimi YOK: messaging'in veritabanı MongoDB, Prisma şeması yok.
WORKDIR /app/apps/messaging
RUN pnpm build

# runner ─────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Çıktı yapısı: apps/messaging/dist/apps/messaging/src/... + dist/packages/...
COPY --from=builder /app/apps/messaging/dist/ ./
COPY --from=builder /app/node_modules                ./node_modules
COPY --from=builder /app/apps/messaging/node_modules ./apps/messaging/node_modules

# Firebase servis hesabı buraya mount edilir (token imzası yerel doğrulanır).
RUN mkdir -p ./secrets

EXPOSE 8081
CMD ["node", "apps/messaging/src/main.js"]
