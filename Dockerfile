FROM oven/bun:debian AS base
LABEL authors="Weldawadyathink"
RUN mkdir -p /app
WORKDIR /app

# Install non-js dependencies
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && \
    apt-get install -y ffmpeg python3 python3-pip && \
    pip install audible-cli && \
    rm -rf /var/lib/apt/lists/*

FROM base AS builder
COPY client/package.json client/bun.lockb ./
RUN bun install --frozen-lockfile
COPY client/ ./
RUN bun run build

FROM base AS server
COPY server/package.json server/bun.lockb ./
RUN bun install --frozen-lockfile --production
COPY server/ ./
COPY --from=builder /app/dist ./dist

EXPOSE 3000

ENTRYPOINT ["bun", "run", "serve"]