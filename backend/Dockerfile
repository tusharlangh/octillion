# Use Node.js 20 Alpine for smaller image size
FROM node:20-alpine

# Install system dependencies for canvas and native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production

# Copy application code
COPY . .

# Expose port (Render will set PORT env variable)
EXPOSE 5002

# Start the application
CMD ["node", "server.js"]