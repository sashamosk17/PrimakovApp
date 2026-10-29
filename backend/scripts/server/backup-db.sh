#!/bin/bash
set -e

# ==============================================================================
# Скрипт автоматического бэкапа базы данных PostgreSQL в Docker
# ==============================================================================

BACKUP_DIR="${HOME}/backups/primakov_db"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/primakovapp_backup_${TIMESTAMP}.sql.gz"
CONTAINER_NAME="primakov-postgres"
DB_NAME="primakovapp"
DB_USER="primakov"

mkdir -p "$BACKUP_DIR"

echo "=== Создание резервной копии базы данных: $DB_NAME ==="

# Выполняем pg_dump внутри контейнера и сжимаем через gzip
docker exec -t "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" | gzip > "$BACKUP_FILE"

echo "Бэкап успешно сохранен: $BACKUP_FILE (размер: $(du -h "$BACKUP_FILE" | cut -f1))"

# Удаление бэкапов старше 14 дней для экономии места
echo "Удаление бэкапов старше 14 дней..."
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +14 -delete

echo "=== Резервное копирование завершено ==="

