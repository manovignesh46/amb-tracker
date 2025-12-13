# Use official Node.js 20 LTS Debian slim image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files first (for better layer caching)
COPY package*.json ./

# Install ALL dependencies (including devDependencies for building React)
RUN npm ci

# Copy application files
COPY . .

# Build the React app
RUN npm run build

# Create uploads directory
RUN mkdir -p uploads

# Expose port (Render will set PORT env variable)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000) + '/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the web server
CMD ["npm", "start"]
