# Use Node.js 22 LTS (Alpine Linux for small footprint)
FROM node:22-alpine

# Install OpenSSL (needed by Prisma on Alpine)
RUN apk add --no-cache openssl

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker layer caching
COPY package*.json ./

# Install all dependencies (including dev dependencies for build step)
RUN npm install

# Copy the rest of the application code
COPY . .

# Inject a dummy DATABASE_URL so prisma generate succeeds. 
# This will be overridden at runtime by docker-compose.yml
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

# Generate Prisma client
RUN npx prisma generate

# Compile TypeScript to JavaScript in the dist/ folder
RUN npm run build

# Expose the API port
EXPOSE 3000

# Start the application using the compiled JavaScript
CMD ["npm", "start"]
