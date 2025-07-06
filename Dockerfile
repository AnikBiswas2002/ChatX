# Step 1: Build frontend
FROM node:22 AS frontend
WORKDIR /app/frontend

# Copy only package files and install dependencies inside frontend
COPY frontend/package*.json ./
RUN npm install

# Copy the rest of the frontend code
COPY frontend/ .

# Build the React/Vite app (creates dist/)
RUN npm run build

# Step 2: Setup backend
FROM node:22 AS backend
WORKDIR /app

# Copy only package files and install backend dependencies
COPY backend/package*.json ./
RUN npm install

# Copy the rest of the backend code (including src/index.js)
COPY backend/ .

# ✅ Copy built frontend into backend's public folder
COPY --from=frontend /app/frontend/dist ./public

EXPOSE 5001
ENV NODE_ENV=production


# ✅ Start backend
CMD ["node", "src/index.js"]
