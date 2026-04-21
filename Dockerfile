# -------- Stage 1: Build --------
FROM node:20-alpine AS build

WORKDIR /app

# Copy only dependency files first (better caching)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy remaining source code
COPY . .

# Build Vite app → outputs to /dist
RUN npm run build


# -------- Stage 2: Nginx --------
FROM nginx:alpine

# Remove default files
RUN rm -rf /usr/share/nginx/html/*

# Copy built app
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5001

CMD ["nginx", "-g", "daemon off;"]