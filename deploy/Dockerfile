# Production image: a single PocketBase process serving the API (/api),
# the dashboard (/_/) and the frontend build (pb_public, with SPA fallback).
#
# Built from the repository root by docker-compose.prod.yml; see "Deploy" in Readme.md.
# Development keeps using docker-compose.yml + backend/Dockerfile.

# ---- 1. Frontend build ------------------------------------------------------
FROM node:24-alpine AS frontend

WORKDIR /app

COPY frontend/package.json frontend/yarn.lock ./
RUN yarn install --frozen-lockfile --non-interactive && yarn cache clean

# Uses frontend/.env.production (VITE_* values are baked into the bundle).
COPY frontend/ ./
RUN yarn build

# ---- 2. Runtime -------------------------------------------------------------
FROM alpine:3.23.3

ARG PB_VERSION=0.36.2
# Set automatically by BuildKit (amd64 on the server, arm64 on Apple Silicon).
ARG TARGETARCH=amd64

RUN apk add --no-cache ca-certificates \
    && wget -q -O /tmp/pb.zip \
       "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_${TARGETARCH}.zip" \
    && unzip -q /tmp/pb.zip pocketbase -d /pb \
    && rm /tmp/pb.zip

COPY backend/pb_migrations /pb/pb_migrations
COPY backend/pb_hooks /pb/pb_hooks
COPY --from=frontend /app/dist /pb/pb_public

EXPOSE 8090

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:8090/api/health || exit 1

# Pending migrations are applied automatically on start.
# --automigrate=0: dashboard changes must not generate migration files in production.
CMD ["/pb/pocketbase", "serve", \
     "--http=0.0.0.0:8090", \
     "--dir=/pb/pb_data", \
     "--publicDir=/pb/pb_public", \
     "--migrationsDir=/pb/pb_migrations", \
     "--hooksDir=/pb/pb_hooks", \
     "--automigrate=0"]
