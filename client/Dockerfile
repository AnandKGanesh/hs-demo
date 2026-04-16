FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM busybox:latest
WORKDIR /app
COPY --from=builder /app/dist .
RUN ls -la /app
EXPOSE 8080
CMD echo "Starting server on port 8080..." && ls -la /app && httpd -f -p 8080 -h /app -vv
