#!/bin/bash
set -e

# ==============================================================================
# Перенос данных из нативной PostgreSQL в Docker-контейнер
# ==============================================================================

OLD_DB_NAME="primakovapp"
OLD_DB_USER="primakov"
DOCKER_CONTAINER="primakov-postgres"
TEMP_DUMP="/tmp/native_dump.sql"

echo "=== Миграция данных из нативного PostgreSQL в Docker ==="

if ! command -v pg_dump &> /dev/null; then
    echo "Команда pg_dump не найдена на хосте. Убедитесь, что postgresql-client установлен."
    exit 1
fi

echo "1. Дамп данных из нативной базы $OLD_DB_NAME..."
pg_dump -U "$OLD_DB_USER" -h localhost "$OLD_DB_NAME" --clean --if-exists > "$TEMP_DUMP"

echo "2. Импорт дампа в Docker контейнер $DOCKER_CONTAINER..."
cat "$TEMP_DUMP" | docker exec -i "$DOCKER_CONTAINER" psql -U primakov -d primakovapp

echo "3. Удаление временного дампа..."
rm -f "$TEMP_DUMP"

echo "=== Миграция успешно завершена! Данные перенесены в Docker-контейнер. ==="

