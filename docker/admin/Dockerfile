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

FROM nginx:1.27-alpine
COPY docker/admin/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/admin/dist /usr/share/nginx/html
EXPOSE 80
