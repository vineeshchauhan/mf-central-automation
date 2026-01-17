# Use the official Playwright image which has all the browser dependencies pre-installed
# This is much easier than installing them manually on a bare Node image.
FROM mcr.microsoft.com/playwright:v1.50.0-jammy

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the port Next.js runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
