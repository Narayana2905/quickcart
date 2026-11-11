# ---- build stage: compile the SPA ----
FROM node:22-alpine AS build
WORKDIR /app

# Install first so this layer is cached until package files change (needs package-lock.json)
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Contract 10.1: empty = same origin; nginx proxies /api/ to the gateway
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
# Never ship the mock. (Variables set here win over any .env file.)
ENV VITE_USE_MOCK_API=false

RUN npm run build

# ---- serve stage: nginx ----
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1