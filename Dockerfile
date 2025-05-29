# Стадия 1: Сборка приложения с использованием Node.js
FROM node:18-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы package.json и package-lock.json для установки зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --silent

# Копируем остальные файлы проекта
COPY . .

# Устанавливаем переменные окружения для сборки с значениями по умолчанию
ARG VITE_API_URL=http://localhost:8081
ARG VITE_FRONTEND_URL=http://localhost
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_FRONTEND_URL=$VITE_FRONTEND_URL

# Собираем приложение для продакшена
RUN npm run build

# Стадия 2: Настройка Nginx для раздачи статических файлов
FROM nginx:alpine

# Копируем собранные файлы из предыдущей стадии
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем кастомную конфигурацию Nginx
COPY nginx.conf.template /etc/nginx/conf.d/default.conf.template

# Переопределяем переменные окружения для Nginx с передачей значений из build-args
ARG VITE_API_URL
ARG VITE_FRONTEND_URL
ENV VITE_API_URL=${VITE_API_URL:-http://localhost:8081}
ENV VITE_FRONTEND_URL=${VITE_FRONTEND_URL:-http://localhost}

# Создаём директорию для логов и генерируем конфигурацию с использованием только нужных переменных
RUN mkdir -p /var/log/nginx && \
    envsubst '$VITE_API_URL $VITE_FRONTEND_URL' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && \
    cat /etc/nginx/conf.d/default.conf > /debug-config.log

# Запускаем Nginx
CMD ["nginx", "-g", "daemon off;"]