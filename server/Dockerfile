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

# Expose port 5000
EXPOSE 5000

# Start server with nodemon for hot reloading
CMD ["npm", "run", "dev"]
