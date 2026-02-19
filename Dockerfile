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

# Production stage — nginx static server
# ============================================
FROM nginx:1.27-alpine

RUN apk add --no-cache wget

# Copy assets to the root web folder (as proxy strips /dashboard prefix)
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget -qO- http://127.0.0.1:3001/health | grep ok || exit 1

CMD ["nginx", "-g", "daemon off;"]
