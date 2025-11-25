# Etapa 1: Build
FROM node:18-alpine AS build

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Build de producción
RUN npm run build

# Etapa 2: Servir con nginx
FROM nginx:alpine

# Copiar build al directorio de nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración de nginx (opcional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
