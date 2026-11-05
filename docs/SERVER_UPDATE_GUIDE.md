# 🚀 Инструкция по обновлению сервера PrimakovApp и подгрузке данных (v0.5.8)

Данный документ содержит пошаговую инструкцию по накатыванию последних изменений, автоматическому применению миграций базы данных PostgreSQL, сидированию синтетических данных и перезапуску сервисов на сервере.

---

## 📌 Параметры сервера
- **Хост**: `185.221.198.242`
- **Пользователь**: `root`
- **Порт API**: `3000` (`http://185.221.198.242:3000/api`)
- **Healthcheck**: `http://185.221.198.242:3000/health`
- **Каталог проекта**: `/root/Primakov_App/backend`

---

## ⚡ Быстрое обновление (1 команда на сервере)

### Шаг 1. Локально зафиксировать и запушить изменения в Git
> [!IMPORTANT]
> В соответствии с регламентом `AGENTS.md` агент **НИКОГДА** не делает `git push` без явного подтверждения пользователя.
> Выполните пуш с локального терминала:
```bash
git add .
git commit -m "feat(v0.5.8): automation engine, real synthetic data and complete unmocking"
git push origin main
```

---

### Шаг 2. Подключение к серверу и запуск деплоя
Подключитесь по SSH к серверу:
```bash
ssh root@185.221.198.242
```

Запустите встроенный скрипт обновления:
```bash
cd /root/Primakov_App/backend
./scripts/server/deploy.sh
```

---

## 🔍 Что делает автоматический процесс на сервере

1. `git pull origin main` — затягивает свежий код, новые схемы миграций (`028_CreateServiceRequestsTable.sql`, `029_SeedComprehensiveSyntheticData.sql`), обновленный раннер миграций и логику воркеров.
2. `docker compose -f docker-compose.prod.yml build backend` — пересобирает образ бэкенда.
   - Скрипт `scripts/copy-migrations.js` автоматически копирует все 31 SQL-миграцию в каталог `dist/infrastructure/database/migrations`.
3. `docker compose -f docker-compose.prod.yml up -d --remove-orphans` — бесшовно перезапускает контейнер `primakov-backend`.
4. **Автоматическое применение миграций**:
   - При старте `dist/main.js` запускает `migrationRunner.ts`.
   - Система проверяет таблицу `migrations` в PostgreSQL.
   - Накатываются миграции `028` (таблица заявок `requests`) и `029` (комплексное сидирование расписаний на 14 дней, оценок, меню столовой, заявок, рейтингов, статусов пансиона).
   - Благодаря обновленному парсеру `splitSqlStatements` блоки `DO $$` в миграциях отрабатывают без синтаксических ошибок.
5. **Запуск фоновых воркеров**:
   - `DeadlineNotificationWorker` — пуш-уведомления о дедлайнах за 24ч и 2ч.
   - `ServiceDeskSLAWorker` — автомаршрутизация и контроль SLA заявок (эскалация просроченных).
   - `BoardingCurfewWorker` — проверка комендантского часа пансиона в 22:00.

---

## 🧪 Проверка успешности подгрузки данных на сервере

### 1. Проверка логов контейнера:
```bash
docker compose -f docker-compose.prod.yml logs --tail=100 backend
```
Вы должны увидеть:
```text
Running database migrations...
  → Running 028_CreateServiceRequestsTable.sql...
  ✓ 028_CreateServiceRequestsTable.sql completed
  → Running 029_SeedComprehensiveSyntheticData.sql...
  ✓ 029_SeedComprehensiveSyntheticData.sql completed
✓ Successfully executed migration(s)
Creating repository instances...
ServiceDeskSLAWorker started
BoardingCurfewWorker started
Server is running on port 3000
```

### 2. Проверка здоровья (Healthcheck):
```bash
curl http://127.0.0.1:3000/health
```
Ожидаемый ответ:
```json
{"status":"ok","database":"connected","timestamp":"..."}
```

### 3. Проверка таблиц в PostgreSQL через Docker:
> [!NOTE]
> Системный пользователь базы данных в Docker Compose — **`primakov`** (не `postgres`). База данных: `primakovapp` (или `primakov_db` в зависимости от конфигурации `.env`).
```bash
docker compose -f docker-compose.prod.yml exec postgres psql -U primakov -d primakovapp -c "SELECT COUNT(*) FROM schedules;"
docker compose -f docker-compose.prod.yml exec postgres psql -U primakov -d primakovapp -c "SELECT COUNT(*) FROM lessons;"
docker compose -f docker-compose.prod.yml exec postgres psql -U primakov -d primakovapp -c "SELECT COUNT(*) FROM requests;"
docker compose -f docker-compose.prod.yml exec postgres psql -U primakov -d primakovapp -c "SELECT COUNT(*) FROM canteen_menu;"
docker compose -f docker-compose.prod.yml exec postgres psql -U primakov -d primakovapp -c "SELECT COUNT(*) FROM stories;"
```

---

## 🌐 Обновление веб-админки (Admin Web)

Если вы запускаете веб-панель прямо на сервере:
```bash
cd /root/Primakov_App/admin-web
npm install
npm run build
```
После сборки бэкенд на Express автоматически раздает статику из папки `admin-web/dist`.

Если вы запускаете веб-панель локально:
```bash
cd admin-web
npm run dev
```
Она откроется на `http://localhost:5173` и будет сразу получать все живые данные с сервера `http://185.221.198.242:3000/api`.

---

## 🛠️ Типовые проблемы и их устранение (Troubleshooting)

### 1. Ошибка запуска Nginx: `failed to bind host port 0.0.0.0:443/tcp: address already in use`
**Причина**: Порт 443 (HTTPS) или 80 (HTTP) уже занят на самом сервере фоновым процессом (системный Apache/Nginx) или зависшим `docker-proxy`.

**Решение**:
```bash
# 1. Посмотреть, какой процесс занимает порт 443:
ss -tulpn | grep :443
# или
lsof -i :443

# 2. Если порт занят нативным системным Nginx или Apache — останавливаем и отключаем:
systemctl stop nginx 2>/dev/null || true
systemctl disable nginx 2>/dev/null || true
systemctl stop apache2 2>/dev/null || true
systemctl disable apache2 2>/dev/null || true

# 3. Если порт держит зависший docker-proxy:
systemctl restart docker

# 4. Перезапустить контейнеры:
cd /root/Primakov_App/backend
docker compose -f docker-compose.prod.yml up -d
```

### 2. Ошибка при подключении к БД: `FATAL: role "postgres" does not exist`
**Причина**: В контейнере `primakov-postgres` суперпользователь создан с именем `primakov` (параметр `POSTGRES_USER` в `docker-compose.prod.yml`).

**Решение**:
Всегда передавайте `-U primakov` вместо `-U postgres`:
```bash
docker compose -f docker-compose.prod.yml exec postgres psql -U primakov -d primakovapp
```

### 3. Ошибки миграций схемы (`string_to_uuid`, `not-null constraint` и др.)
Благодаря самовосстанавливающейся секции 0 в миграции `029_SeedComprehensiveSyntheticData.sql` и парсеру `migrationRunner.ts`:
- Зависимые представления (`active_requests`, `active_announcements`, `active_stories`) каскадно сбрасываются перед модификацией типов и восстанавливаются после.
- Колонки `room_id`, `category`, `content` безопасно приводятся к нужным типам без блокировок.
- Если миграция падает, раннер выводит в лог точный номер оператора и сниппет SQL:
```bash
docker compose -f docker-compose.prod.yml logs --tail=50 backend
```

---

## 🚨 Ручное применение миграций (если потребуется отдельно)

Если контейнер уже запущен, а вы хотите применить миграции вручную без перезапуска:
```bash
# Через Node.js скрипт внутри контейнера:
docker compose -f docker-compose.prod.yml exec backend node -e "
  const { createDatabasePool } = require('./dist/infrastructure/config/database');
  const { runMigrations } = require('./dist/infrastructure/database/migrations/migrationRunner');
  createDatabasePool().then(pool => runMigrations(pool).then(() => process.exit(0)));
"

# Либо напрямую через psql в контейнере базы данных:
cat /root/Primakov_App/backend/src/infrastructure/database/migrations/028_CreateServiceRequestsTable.sql | docker compose -f docker-compose.prod.yml exec -T postgres psql -U primakov -d primakovapp
cat /root/Primakov_App/backend/src/infrastructure/database/migrations/029_SeedComprehensiveSyntheticData.sql | docker compose -f docker-compose.prod.yml exec -T postgres psql -U primakov -d primakovapp
```

