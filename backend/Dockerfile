FROM node:20

WORKDIR /app

# Install build tools
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install ALL dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]
