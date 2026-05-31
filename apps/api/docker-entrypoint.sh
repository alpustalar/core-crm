#!/bin/sh
set -e

PRISMA_BIN="./apps/api/node_modules/.bin/prisma"

echo "[entrypoint] Running Prisma migrations..."
"$PRISMA_BIN" migrate deploy --schema ./prisma/schema

echo "[entrypoint] Starting API..."
exec node apps/api/src/main.js
