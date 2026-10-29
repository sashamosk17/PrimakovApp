#!/bin/bash
set -e

# ==============================================================================
# Скрипт первоначальной инициализации SSL-сертификата Let's Encrypt
# Домен: primakov.ddns.net
# ==============================================================================

DOMAIN="primakov.ddns.net"
EMAIL="admin@primakov.ddns.net" # Замените на ваш email при желании
RSA_KEY_SIZE=4096
DATA_PATH="./certbot_data"

echo "=== Инициализация SSL для $DOMAIN ==="

# Проверка наличия docker compose
if ! command -v docker &> /dev/null; then
    echo "Ошибка: Docker не установлен."
    exit 1
fi

COMPOSE_FILE="docker-compose.prod.yml"

echo "1. Проверяем наличие существующих сертификатов..."
docker compose -f $COMPOSE_FILE run --rm --entrypoint "\
  sh -c 'test -d /etc/letsencrypt/live/$DOMAIN'" certbot && {
    echo "Сертификат для $DOMAIN уже существует. Пропускаем первичный выпуск."
    exit 0
} || echo "Сертификат не найден. Создаем временный для запуска Nginx..."

# Создаем директорию и временный самоподписанный сертификат
docker compose -f $COMPOSE_FILE run --rm --entrypoint "\
  sh -c 'mkdir -p /etc/letsencrypt/live/$DOMAIN && \
  openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout /etc/letsencrypt/live/$DOMAIN/privkey.pem \
    -out /etc/letsencrypt/live/$DOMAIN/fullchain.pem \
    -subj \"/CN=localhost\"'" certbot

echo "2. Запускаем Nginx с временным сертификатом..."
docker compose -f $COMPOSE_FILE up -d --no-deps nginx

echo "3. Удаляем временный сертификат перед запросом настоящего..."
docker compose -f $COMPOSE_FILE run --rm --entrypoint "\
  rm -Rf /etc/letsencrypt/live/$DOMAIN && \
  rm -Rf /etc/letsencrypt/archive/$DOMAIN && \
  rm -Rf /etc/letsencrypt/renewal/$DOMAIN.conf" certbot

echo "4. Запрашиваем официальный сертификат Let's Encrypt..."
docker compose -f $COMPOSE_FILE run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    --email $EMAIL \
    -d $DOMAIN \
    --rsa-key-size $RSA_KEY_SIZE \
    --agree-tos \
    --force-renewal \
    --non-interactive" certbot

echo "5. Перезагружаем Nginx с новым сертификатом..."
docker compose -f $COMPOSE_FILE exec nginx nginx -s reload

echo "6. Запускаем полный стек сервисов (Postgres, Backend, Certbot)..."
docker compose -f $COMPOSE_FILE up -d

echo "=== SSL успешно настроен! Сервер доступен по https://$DOMAIN ==="

