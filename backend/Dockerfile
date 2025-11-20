# Multi-stage build for Railway deployment
FROM node:22-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:22-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy built artifacts from builder stage
COPY --from=builder /app/dist ./dist

# Copy other necessary files
COPY server.js ./
COPY supabaseClient.js ./

# Expose port (Railway will set PORT env variable)
EXPOSE 5002

# Set NODE_ENV to production
ENV NODE_ENV=production

# Start the server
CMD ["node", "server.js"]