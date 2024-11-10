# Use Node.js 20 as the base image for building the app
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies using npm ci for faster, reliable builds
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Production image
FROM node:20-alpine

# Set the working directory in the new container
WORKDIR /usr/src/app

# Copy only the necessary files for production from the build stage
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public

# Expose the port that Next.js will run on
EXPOSE 3000

# Run Next.js in production mode
CMD ["npm", "run", "start"]
