# syntax=docker/dockerfile:1

# ─────────────────────────────────────────────
# Stage 1: Build the React application
# ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Build arg for API URL (default to /api for same-origin proxying)
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

# Copy package files first (better layer caching)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build production bundle
RUN npm run build

# ─────────────────────────────────────────────
# Stage 2: Serve with Nginx
# ─────────────────────────────────────────────
FROM nginx:alpine AS production

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Custom nginx config for SPA (React Router)
RUN cat <<'EOF' > /etc/nginx/conf.d/taskflow.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Handle React Router — fallback to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s \
    CMD wget -qO- http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
