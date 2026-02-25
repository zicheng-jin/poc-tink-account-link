# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_BACKEND_URL
ARG VITE_PPB_APP_URL
ARG VITE_MERCHANT_APP_URL

ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_PPB_APP_URL=$VITE_PPB_APP_URL
ENV VITE_MERCHANT_APP_URL=$VITE_MERCHANT_APP_URL

RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template

# envsubst replaces ${PPB_APP_URL} and ${BACKEND_URL} at container start
ENV PPB_APP_URL=http://localhost:3000
ENV BACKEND_URL=http://localhost:3001

EXPOSE 8080

CMD ["/bin/sh", "-c", "envsubst '${PPB_APP_URL} ${BACKEND_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
