# ============================================
# GeoRank Dashboard (Vite) - Multi-stage Dockerfile
# Served at /dashboard via nginx
# ============================================

# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build

# ============================================
# Production stage — nginx static server
# ============================================
FROM nginx:1.27-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/dashboard/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
