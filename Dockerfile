FROM node:20-slim

WORKDIR /app

# Install dependencies first
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]