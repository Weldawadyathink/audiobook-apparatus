FROM denoland/deno:debian AS base
LABEL authors="Weldawadyathink"
RUN mkdir -p /app
WORKDIR /app

# Install non-js dependencies
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && \
    apt-get install -y ffmpeg python3 python3-pip && \
    pip install --break-system-packages audible-cli && \
    rm -rf /var/lib/apt/lists/*

FROM base AS client
COPY client/package.json client/deno.lock ./
RUN deno install --allow-scripts --frozen=true
COPY client/ ./
RUN deno task build

FROM base AS server
COPY server/deno.json server/deno.lock ./
RUN deno install --frozen=true
COPY server/ ./
COPY --from=client /app/dist ./dist

EXPOSE 8000

ENTRYPOINT ["deno", "task", "serve"]