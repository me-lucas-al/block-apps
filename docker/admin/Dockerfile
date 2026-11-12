FROM node:24-alpine AS build
RUN npm install --global pnpm@12.10.1
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile --filter @block-apps/admin...
ARG VITE_API_URL
ARG VITE_COGNITO_USER_POOL_ID
ARG VITE_COGNITO_CLIENT_ID
ARG VITE_COGNITO_HOSTED_DOMAIN
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_COGNITO_USER_POOL_ID=$VITE_COGNITO_USER_POOL_ID
ENV VITE_COGNITO_CLIENT_ID=$VITE_COGNITO_CLIENT_ID
ENV VITE_COGNITO_HOSTED_DOMAIN=$VITE_COGNITO_HOSTED_DOMAIN
RUN pnpm --filter @block-apps/admin build

FROM nginxinc/nginx-unprivileged:1.27-alpine
ENV API_URL=https://i51vicajy2.execute-api.sa-east-1.amazonaws.com
ENV COGNITO_HOSTED_DOMAIN=block-apps-auth-090082365159.auth.sa-east-1.amazoncognito.com
ENV AWS_REGION=sa-east-1
COPY docker/admin/default.conf.template /etc/nginx/templates/default.conf.template
COPY docker/admin/security-headers.inc.template /etc/nginx/templates/security-headers.inc.template
COPY --from=build /repo/apps/admin/dist /usr/share/nginx/html
EXPOSE 8080
