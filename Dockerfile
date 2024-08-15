# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS base
WORKDIR /app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS modules
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS builder
COPY --from=modules /temp/dev/node_modules node_modules
COPY . .

ENV NODE_ENV production
ENV DATABASE_URL "file:./db.sqlite"
ENV SKIP_ENV_VALIDATION 1

RUN bun test
RUN bun run build

# copy production dependencies and source code into final image
FROM base AS release
ENV NODE_ENV=production

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Fix issue with libsql: https://github.com/payloadcms/payload/issues/7527
# https://github.com/tursodatabase/libsql-client-ts/issues/112
# Adds 500mb to image, but unavoidable until libsql is fixed
COPY --from=builder /app/node_modules ./node_modules

VOLUME /config
ENV DATABASE_URL file:/config/db.sqlite

# run the app
EXPOSE 3000/tcp
CMD [ "bun", "run", "server.js" ]
