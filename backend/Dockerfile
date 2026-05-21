# Use node 20 alpine for lightweight production build
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependency specifications
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy remaining source code files
COPY . .

# Expose server port
EXPOSE 5000

# Start Express application
CMD ["npm", "start"]
