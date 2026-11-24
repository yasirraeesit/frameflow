FROM node:20-bookworm-slim AS base

# Install system dependencies: ffmpeg, python3, curl, yt-dlp
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    python3 \
    curl \
    ca-certificates \
    && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy root manifests and workspace configs
COPY package*.json ./
COPY tsconfig.base.json ./
COPY shared/package*.json ./shared/
COPY server/database/package*.json ./server/database/
COPY server/api/package*.json ./server/api/
COPY server/worker/package*.json ./server/worker/
COPY client/package*.json ./client/

# Install dependencies (skipping scripts until sources are copied)
RUN npm ci --ignore-scripts

# Copy database schema and generate prisma client
COPY server/database ./server/database
RUN npm --workspace=@frameflow/database run prisma:generate

# Copy source code across workspaces
COPY shared ./shared
COPY server/worker ./server/worker
COPY server/api ./server/api

# Build shared, worker, and api
RUN npm --workspace=@frameflow/shared run build \
    && npm --workspace=@frameflow/worker run build \
    && npm --workspace=@frameflow/api run build

# Default environment configuration
ENV PORT=10000
ENV HOST=0.0.0.0
ENV NODE_ENV=production
ENV ENABLE_EMBEDDED_WORKER=true
ENV LOCAL_STORAGE_DIR=/tmp/frameflow-media

EXPOSE 10000

CMD ["node", "server/api/dist/src/server.js"]
