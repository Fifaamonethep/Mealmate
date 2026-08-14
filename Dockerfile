# ==============================================================================
# STAGE 1: Build Application (Node.js Alpine)
# ==============================================================================
FROM node:20-alpine AS builder

# Set working directory inside container
WORKDIR /app

# Copy package manifests for efficient Docker layer caching
COPY package*.json ./

# Clean install all project dependencies
RUN npm ci

# Copy all source files
COPY . .

# Build production bundle with Vite
RUN npm run build

# ==============================================================================
# STAGE 2: Production Web Server (Nginx Alpine)
# ==============================================================================
FROM nginx:1.27-alpine AS runner

# Remove default Nginx website configuration
RUN rm -rf /etc/nginx/conf.d/* /usr/share/nginx/html/*

# Copy custom Nginx configuration with SPA fallback & Gzip enabled
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production build artifacts from Stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose standard HTTP port
EXPOSE 80

# Health check to ensure web server is responsive
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
