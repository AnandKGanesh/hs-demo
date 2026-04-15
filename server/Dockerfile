# Server Dockerfile for Hyperswitch Demo App
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy server code
COPY . .

# Expose the server port
EXPOSE 5252

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5252/health || exit 1

# Start the server
CMD ["node", "server.js"]
