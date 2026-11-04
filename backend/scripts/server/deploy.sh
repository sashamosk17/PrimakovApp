#!/bin/bash
set -e

# ==============================================================================
# Скрипт развертывания / обновления PrimakovApp на сервере
# ==============================================================================

COMPOSE_FILE="docker-compose.prod.yml"

echo "=== Запуск развертывания PrimakovApp ==="

# 1. Подтягиваем свежие коммиты из Git и перезапускаем обновленный скрипт
if [ -z "$DEPLOY_RELOADED" ]; then
  echo "--> 1. Получение последних изменений из Git..."
  git pull origin main
  export DEPLOY_RELOADED=1
  exec "$0" "$@"
fi

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
echo "--> 5. Проверка ответа бэкенда (ожидание инициализации и накатывания миграций)..."
ATTEMPTS=0
MAX_ATTEMPTS=15
HEALTH_OK=0

while [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; do
  sleep 2
  ATTEMPTS=$((ATTEMPTS+1))
  if docker compose -f $COMPOSE_FILE exec -T backend wget -qO- http://127.0.0.1:3000/health > /dev/null 2>&1; then
    HEALTH_OK=1
    break
  fi
  echo "    Попытка $ATTEMPTS/$MAX_ATTEMPTS: сервис запускается..."
done

if [ $HEALTH_OK -eq 1 ]; then
  echo "✓ Бэкенд успешно запущен и отвечает на /health!"
  docker compose -f $COMPOSE_FILE exec -T backend wget -qO- http://127.0.0.1:3000/health
  echo ""
  echo "=== Развертывание успешно завершено! ==="
else
  echo "❌ Ошибка: бэкенд не ответил на /health за 30 секунд. Последние логи:"
  docker compose -f $COMPOSE_FILE logs --tail=50 backend
  exit 1
fi

