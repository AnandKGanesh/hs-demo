FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM alpine:latest

WORKDIR /output

COPY --from=builder /app/dist .

CMD ["sh", "-c", "echo 'Static files ready in /output' && tail -f /dev/null"]
