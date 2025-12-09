# Use lightweight Node.js base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the application
COPY . .

# Expose port 5173 (Vite default)
EXPOSE 5173

# Start Vite with --host flag (critical for Docker)
CMD ["npm", "run", "dev", "--", "--host"]
