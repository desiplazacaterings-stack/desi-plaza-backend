# Node.js 20 Backend Dockerfile
# Optimized for Hostinger Docker Manager

FROM node:20-alpine

# Set working directory inside container
WORKDIR /app/backend

# Copy package files from backend folder
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Copy backend source code
COPY backend/ .

# Expose backend port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Start server
CMD ["npm", "start"]
