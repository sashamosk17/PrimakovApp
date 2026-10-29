#!/bin/bash
set -e

# ==============================================================================
# Скрипт развертывания / обновления PrimakovApp на сервере
# ==============================================================================

COMPOSE_FILE="docker-compose.prod.yml"

echo "=== Запуск развертывания PrimakovApp ==="

# 1. Подтягиваем свежие коммиты из Git
echo "--> 1. Получение последних изменений из Git..."
git pull origin main

# 2. Пересобираем и запускаем контейнеры
echo "--> 2. Сборка и запуск контейнеров..."
docker compose -f $COMPOSE_FILE build backend
docker compose -f $COMPOSE_FILE up -d --remove-orphans

# 3. Очищаем старые неиспользуемые Docker-образы
echo "--> 3. Очистка устаревших Docker-образов..."
docker image prune -f

# 4. Проверяем статус контейнеров
echo "--> 4. Статус сервисов:"
docker compose -f $COMPOSE_FILE ps

# 5. Проверяем healthcheck
echo "--> 5. Проверка ответа бэкенда..."
sleep 5
if command -v curl &> /dev/null; then
    curl -I -s http://localhost:3000/health | head -n 1
fi

echo "=== Развертывание успешно завершено! ==="

