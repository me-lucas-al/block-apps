FROM node:24-alpine AS build
RUN npm install --global pnpm@12.10.1
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile --filter @block-apps/backend...
RUN pnpm --filter @block-apps/backend build:local

FROM node:24-alpine
WORKDIR /app
COPY --from=build /repo/packages/backend/dist/local.mjs ./local.mjs
USER node
EXPOSE 3000
CMD ["node", "local.mjs"]
