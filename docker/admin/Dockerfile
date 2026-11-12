FROM node:24-alpine AS build
RUN npm install --global pnpm@12.10.1
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile --filter @block-apps/admin...
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
RUN pnpm --filter @block-apps/admin build

FROM nginxinc/nginx-unprivileged:1.27-alpine
ENV SUPABASE_URL=http://127.0.0.1:54321
COPY docker/admin/default.conf.template /etc/nginx/templates/default.conf.template
COPY docker/admin/security-headers.inc.template /etc/nginx/templates/security-headers.inc.template
COPY --from=build /repo/apps/admin/dist /usr/share/nginx/html
EXPOSE 8080
