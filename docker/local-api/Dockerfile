FROM node:24.21.0-alpine AS build
RUN npm install --global pnpm@12.10.1
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile --filter @block-apps/backend...
RUN pnpm --filter @block-apps/backend build:local

FROM node:24.21.0-alpine
WORKDIR /app
COPY --from=build --chown=node:node /repo/packages/backend/dist/local.mjs ./local.mjs
USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then((reply) => process.exit(reply.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["node", "local.mjs"]
