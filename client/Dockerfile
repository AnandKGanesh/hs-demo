# Build stage for S3 deployment
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Output stage - static files for S3
FROM alpine:latest

WORKDIR /output

# Copy built assets to output directory
COPY --from=builder /app/dist .

# Keep container alive so Jenkins can extract files
CMD ["sh", "-c", "echo 'Static files ready in /output' && tail -f /dev/null"]
