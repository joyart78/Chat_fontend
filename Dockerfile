# Шаг 1: сборка React приложения
FROM node:20-alpine AS builder
WORKDIR /app

# Копируем зависимости отдельно — Docker кешируют этот слой
# и не переустанавливает пакеты если package.json не менялся
COPY package*.json ./
RUN npm ci

# Копируем весь код и собираем
COPY . .
RUN npm run build

# Шаг 2: раздаём собранные файлы через nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем конфиг nginx (создадим ниже)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80