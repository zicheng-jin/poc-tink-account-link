# Stage 1: Build — no VITE_* args needed, URLs are now runtime via config.js
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Default values for local docker run (overridden by Cloud Run env vars in production)
ENV PPB_APP_URL=http://localhost:3000
ENV BACKEND_URL=http://localhost:3002
ENV MERCHANT_APP_URL=http://localhost:3001

EXPOSE 8080

# 1) Substitute nginx.conf (CSP headers)
# 2) Substitute config.js (runtime URLs for React app)
CMD ["/bin/sh", "-c", "envsubst '${PPB_APP_URL} ${BACKEND_URL} ${MERCHANT_APP_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && envsubst '${BACKEND_URL} ${PPB_APP_URL} ${MERCHANT_APP_URL}' < /usr/share/nginx/html/config.js > /tmp/config.js && mv /tmp/config.js /usr/share/nginx/html/config.js && nginx -g 'daemon off;'"]
