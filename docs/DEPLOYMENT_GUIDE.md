# 🚀 Руководство по развертыванию PrimakovApp на сервере и настройке CI/CD

В этом документе содержится пошаговая инструкция по:
1. Подготовке сервера (очистка старых служб, запуск Docker Compose).
2. Выпуску бесплатного SSL-сертификата Let's Encrypt для домена `primakov.ddns.net`.
3. Настройке авто-деплоя (CI/CD) через GitHub Actions.
4. Автоматической облачной сборке Flutter APK.

---

## 📋 Предварительные требования

- **Сервер**: IP `185.221.198.242` (Ubuntu / Debian).
- **Домен**: `primakov.ddns.net` (привязан в панели No-IP к IP `185.221.198.242`).
- **Порты**: `80` (HTTP), `443` (HTTPS) и `22` (SSH) должны быть открыты во внешнем фаерволе хостинга/провайдера.

---

## ШАГ 1. Подготовка сервера и очистка старых служб

Подключитесь к вашему серверу по SSH:
```bash
ssh root@185.221.198.242
```

### 1.1. Остановка старых процессов и освобождение портов
Если на сервере запущена старая версия приложения или нативный PostgreSQL/Nginx, их нужно остановить, чтобы они не занимали порты `80`, `443` или `5432`:

```bash
# Проверяем, какие порты сейчас заняты
sudo ss -tulpn | grep -E ':(80|443|3000|5432)\b'

# Если запущен нативный PostgreSQL:
sudo systemctl stop postgresql
sudo systemctl disable postgresql

# Если запущен системный Nginx или Apache:
sudo systemctl stop nginx apache2 2>/dev/null || true
sudo systemctl disable nginx apache2 2>/dev/null || true

# Если запущены старые Docker-контейнеры:
docker ps
# При необходимости остановить старые контейнеры:
# docker stop $(docker ps -q)
```

### 1.2. Проверка наличия Docker и Docker Compose
```bash
docker --version
docker compose version
```
*(Если Docker еще не установлен, установите официальным скриптом в 1 команду)*:
```bash
curl -fsSL https://get.docker.com | sh
```

---

## ШАГ 2. Клонирование репозитория и настройка .env

### 2.1. Клонирование репозитория на сервер
Рекомендуется клонировать в домашнюю директорию или в `/opt`:
```bash
cd ~
git clone https://github.com/sashamosk17/PrimakovApp.git Primakov_App
cd Primakov_App/backend
```

### 2.2. Создание файла переменных окружения (.env)
Скопируйте шаблон:
```bash
cp .env.server.example .env
nano .env
```
Убедитесь, что параметры заполнены:
```ini
NODE_ENV=production
PORT=3000

# Сгенерируйте случайный 32-байтный ключ: openssl rand -hex 32
JWT_SECRET=ВАШ_СЛУЧАЙНЫЙ_СЕКРЕТНЫЙ_КЛЮЧ_32_СИМВОЛА
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

ALLOWED_ORIGINS=https://primakov.ddns.net,http://primakov.ddns.net,http://localhost:3000,*

# База данных в Docker (имя хоста: postgres)
DB_HOST=postgres
DB_PORT=5432
DB_NAME=primakovapp
DB_USER=primakov
DB_PASSWORD=ПридумайтеНадежныйПарольБД
POSTGRES_PASSWORD=ПридумайтеНадежныйПарольБД
```
Сохраните файл (`Ctrl + O`, `Enter`, `Ctrl + X`).

---

## ШАГ 3. Выпуск SSL-сертификата Let's Encrypt для primakov.ddns.net

В репозитории уже подготовлен скрипт `init-ssl.sh`. Дайте ему права на исполнение и запустите:
```bash
chmod +x scripts/server/*.sh
./scripts/server/init-ssl.sh
```
Что сделает скрипт:
1. Создаст временный сертификат, чтобы Nginx успешно стартовал.
2. Поднимет Nginx и Certbot.
3. Запросит официальный доверенный SSL-сертификат от Let's Encrypt для `primakov.ddns.net`.
4. Перезагрузит Nginx с реальным сертификатом.

> 💡 **Авто-продление**: Контейнер `certbot` в `docker-compose.prod.yml` автоматически проверяет и продлевает сертификат каждые 12 часов!

---

## ШАГ 4. Запуск всех сервисов (Backend + PostgreSQL + Nginx)

Запустите прод-стек:
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### Проверка работоспособности:
```bash
# Просмотр статуса контейнеров:
docker compose -f docker-compose.prod.yml ps

# Просмотр логов бэкенда:
docker compose -f docker-compose.prod.yml logs -f backend

# Проверка эндпоинта здоровья:
curl -i https://primakov.ddns.net/health
```
Вы должны получить ответ:
```json
HTTP/2 200
{"status":"ok","uptime":15.4,"database":"connected","version":"0.2.0"}
```

---

## ШАГ 5. Настройка авто-деплоя (CI/CD) через GitHub Actions

Каждый раз при `git push origin main` GitHub Actions сам проверит тесты и обновит приложение на вашем сервере без ручного входа.

### 5.1. Создание SSH ключа для деплоя
На сервере (или на вашем ПК) создайте отдельную пару ключей:
```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy -N ""
```
Добавьте публичный ключ в список разрешенных на сервере:
```bash
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```
Выведите **приватный** ключ на экран:
```bash
cat ~/.ssh/github_deploy
```
*(Скопируйте весь вывод от `-----BEGIN OPENSSH PRIVATE KEY-----` до `-----END OPENSSH PRIVATE KEY-----`)*

### 5.2. Добавление секретов в GitHub
1. Перейдите в ваш репозиторий на GitHub: `https://github.com/sashamosk17/PrimakovApp`
2. Откройте **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.
3. Создайте 4 секрета:
   - `SERVER_HOST`: `185.221.198.242`
   - `SERVER_USER`: `root` (или имя пользователя с доступом к docker)
   - `SERVER_SSH_KEY`: Вставьте скопированный приватный ключ
   - `SERVER_PORT`: `22` (если стандартный)

Готово! Теперь любой пуш в `main` автоматически деплоится на сервер.

---

## ШАГ 6. Облачная сборка Flutter APK в 1 клик

Больше не нужно мучаться с локальной сборкой на компьютере.
1. В GitHub перейдите во вкладку **Actions**.
2. В левой колонке выберите **Build Flutter APK**.
3. Нажмите кнопку **Run workflow**.
4. Через 2-3 минуты в деталях запуска внизу страницы появится готовый для скачивания файл `PrimakovApp-release.zip` с `app-release.apk` внутри!
5. Приложение уже преднастроено для работы с вашим API по безопасному HTTPS: `https://primakov.ddns.net/api`.

---

## 💾 Резервное копирование базы данных (Бэкапы)

Для настройки ежедневного автоматического бэкапа базы данных выполните на сервере:
```bash
# Добавление задания в cron (каждую ночь в 03:00):
(crontab -l 2>/dev/null; echo "0 3 * * * /root/Primakov_App/backend/scripts/server/backup-db.sh > /dev/null 2>&1") | crontab -
```
Скрипт сохраняет сжатые архивы в `~/backups/primakov_db/` и автоматически удаляет дампы старше 14 дней.

