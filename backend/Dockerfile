# Stage 1: Builder
FROM node:22-slim AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app if you have a build step
RUN npm run build

# Stage 2: Production
FROM node:22-slim
WORKDIR /app

# Copy package files and install only production deps
COPY package*.json ./
RUN npm install --omit=dev

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist

# Copy source files needed by server.js imports
COPY --from=builder /app/src ./src

# Copy root-level files
COPY server.js ./
COPY supabaseClient.js ./

# Expose Railway port (Railway uses $PORT)
EXPOSE 5002

# Set production environment
ENV NODE_ENV=production

# Start the server
CMD ["node", "server.js"]
