#!/bin/bash
set -e

# ==============================================================================
# Скрипт первоначальной инициализации SSL-сертификата Let's Encrypt
# Домен: primakov.ddns.net
# ==============================================================================

DOMAIN="primakov.ddns.net"
EMAIL="admin@primakov.ddns.net"
RSA_KEY_SIZE=4096
COMPOSE_FILE="docker-compose.prod.yml"

echo "=== Инициализация домена и SSL для $DOMAIN ==="

if ! command -v docker &> /dev/null; then
    echo "Ошибка: Docker не установлен."
    exit 1
fi

echo "1. Проверяем наличие сертификатов..."
if docker compose -f $COMPOSE_FILE run --rm --entrypoint "sh -c 'test -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem'" certbot 2>/dev/null; then
    echo "Сертификат для $DOMAIN уже существует. Запускаем Nginx..."
    docker compose -f $COMPOSE_FILE up -d nginx certbot
    echo "=== Nginx запущен и обслуживает $DOMAIN ==="
    exit 0
fi

echo "Сертификат не найден. Создаем временный для первого запуска Nginx..."

# Создаем директорию и временный самоподписанный сертификат
docker compose -f $COMPOSE_FILE run --rm --entrypoint "\
  sh -c 'mkdir -p /etc/letsencrypt/live/$DOMAIN && \
  openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout /etc/letsencrypt/live/$DOMAIN/privkey.pem \
    -out /etc/letsencrypt/live/$DOMAIN/fullchain.pem \
    -subj \"/CN=localhost\"'" certbot

echo "2. Запускаем Nginx на портах 80 и 443..."
docker compose -f $COMPOSE_FILE up -d --no-deps nginx

echo "3. Запрашиваем официальный доверенный сертификат Let's Encrypt..."
docker compose -f $COMPOSE_FILE run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    --email $EMAIL \
    -d $DOMAIN \
    --rsa-key-size $RSA_KEY_SIZE \
    --agree-tos \
    --force-renewal \
    --non-interactive" certbot

echo "4. Перезагружаем Nginx с официальным сертификатом..."
docker compose -f $COMPOSE_FILE exec nginx nginx -s reload

echo "5. Запускаем фоновый демон авто-продления сертификатов (Certbot)..."
docker compose -f $COMPOSE_FILE up -d certbot

echo "=== Домен $DOMAIN успешно подключен! ==="
echo "Доступ по HTTP:  http://$DOMAIN/api"
echo "Доступ по HTTPS: https://$DOMAIN/api"
echo "Прямой порт:     http://$DOMAIN:3000/api"
