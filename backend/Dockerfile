FROM node:18

WORKDIR /app/backend

# Copy package files
COPY package*.json ./

# Install dependencies as root
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client as root  
RUN npx prisma generate

# Create app user and set ownership
RUN useradd -m -u 1001 appuser && \
    chown -R appuser:appuser /app/backend && \
    chmod -R 755 /app/backend

# Switch to non-root user
USER appuser

EXPOSE 3001

CMD ["npm", "start"]