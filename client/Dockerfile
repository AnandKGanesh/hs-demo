FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM busybox:latest
WORKDIR /app
COPY --from=builder /app/dist .
EXPOSE 8080
CMD ["httpd", "-f", "-p", "8080", "-h", "/app"]
