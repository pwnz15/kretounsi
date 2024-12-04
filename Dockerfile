FROM node:20-slim

WORKDIR /app

# Install dependencies including TypeScript
COPY package*.json ./
RUN npm ci && npm install typescript -g

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]