# 🚀 Руководство по развертыванию PrimakovApp на сервере и управлению проектом

В данном руководстве зафиксированы результаты работы по настройке и развертыванию серверной части **PrimakovApp**, переносу базы данных в Docker, настройке мониторинга здоровья сервиса и организации удобного рабочего процесса разработки без сложных CI/CD конвейеров.

---

## 📋 Параметры сервера и сетевая конфигурация

- **IP-адрес сервера**: `185.221.198.242`
- **ОС**: Ubuntu 22.04 LTS (Jammy)
- **Порт Backend API**: `3000` (напрямую доступен из интернета)
- **Базовый URL для клиентов (Flutter Web / Android / iOS)**: `http://185.221.198.242:3000/api`
- **Эндпоинт проверки здоровья (Healthcheck)**: `http://185.221.198.242:3000/health`
- **СУБД**: PostgreSQL 15 (в изолированном Docker-контейнере с постоянным volume `primakov_postgres_data`)

> [!NOTE]
> **Особенности портов 80 и 443**: Порт 443 на данном VPS фильтруется внешней защитой хостинга (Akamai EdgeSuite / Cloudflare proxy), возвращая ошибку `Invalid URL` для незарегистрированных доменов. Поэтому прямое подключение на порт `3000` является наиболее надежным, стабильным и быстрым решением без посредников.

---

## 🏗️ Архитектура развертывания (Docker Compose)

Файл конфигурации: [`backend/docker-compose.prod.yml`](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/backend/docker-compose.prod.yml)

```mermaid
flowchart TD
    subgraph Client["Клиентские приложения"]
        WEB["Flutter Web (Chrome / Edge)"]
        MOBILE["Flutter Mobile (Android APK / iOS)"]
    end

    subgraph Host["Сервер (185.221.198.242)"]
        PORT["Порт 3000 (Внешний)"]
        
        subgraph DockerNet["Docker Network: primakov_network"]
            BACKEND["primakov-backend (Node.js 20 Express, dist/main.js)"]
            POSTGRES[("primakov-postgres (PostgreSQL 15 Alpine)")]
        end
        
        VOLUME[("Volume: primakov_postgres_data")]
    end

    WEB -->|HTTP REST / CORS| PORT
    MOBILE -->|HTTP REST| PORT
    PORT --> BACKEND
    BACKEND -->|TCP 5432 (Internal)| POSTGRES
    POSTGRES --- VOLUME
```

### Сервисы в Docker:
1. **`primakov-postgres`**:
   - Образ `postgres:15-alpine`.
   - Данные сохраняются в постоянном томе `primakov_postgres_data` (не удаляются при перезапусках контейнеров).
   - Встроенный Healthcheck (`pg_isready -U primakov -d primakovapp`).
   - Доступен локально на сервере (`127.0.0.1:5432`) и внутри сети `primakov_network`.
2. **`primakov-backend`**:
   - Сборка из `backend/Dockerfile` (Node.js 20 multi-stage build).
   - Подключается к `postgres` по внутреннему имени хоста.
   - Запускается только после успешного прохождения проверки здоровья базы данных (`condition: service_healthy`).
   - Наружу проброшен порт `3000:3000`.

---

## 🔄 Рабочий процесс обновления (Deploy Workflow)

Вместо медленных и падающих внешних CI/CD пайплайнов настроен простой и надежный процесс «Git Push -> Server Pull»:

### 1. На локальном компьютере:
Пишите код, проверяйте тесты и отправляйте в репозиторий:
```bash
git add .
git commit -m "feat: ваша новая фича"
git push origin main
```

### 2. На сервере (обновление в 1 команду):
Подключитесь по SSH и запустите готовый скрипт:
```bash
ssh root@185.221.198.242
cd ~/Primakov_App/backend
./scripts/server/deploy.sh
```

Что делает скрипт [`deploy.sh`](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/backend/scripts/server/deploy.sh):
1. Выполняет `git pull origin main`.
2. Пересобирает Docker-образ бэкенда (`docker compose build backend`).
3. Бесшовно перезапускает контейнер (`docker compose up -d`).
4. Очищает временные висячие слои (`docker image prune -f`).
5. Проверяет ответ эндпоинта здоровья `/health`.

---

## 💻 Локальный запуск Flutter с подключением к серверу

В коде `flutter/lib/config/api_config.dart` по умолчанию настроен URL сервера: `http://185.221.198.242:3000/api`.

### Запуск в браузере Chrome:
```powershell
cd flutter
flutter run -d chrome
```

### Запуск как приложение Windows:
```powershell
cd flutter
flutter run -d windows
```

### Запуск на подключенном смартфоне Android:
```powershell
cd flutter
flutter run
```

---

## 🔑 Учетные записи для тестирования

База данных полностью заполнена реальными данными и тестовыми аккаунтами.

| Email | Роль | Пароль | Описание |
| :--- | :---: | :---: | :--- |
| `ivan.petrov@primakov.school` | `STUDENT` | `password123` | Ученик Иван Петров (активное расписание, оценки) |
| `maria.sokolova@primakov.school` | `STUDENT` | `password123` | Ученица Мария Соколова |
| `aleksei.smirnov@primakov.school` | `STUDENT` | `password123` | Ученик Алексей Смирнов |
| `teacher.ivanov@primakov.school` | `TEACHER` | `password123` | Преподаватель Иван Иванов |
| `teacher.sidorov@primakov.school` | `TEACHER` | `password123` | Преподаватель Виктор Сидоров |
| `admin@primakov.school` | `ADMIN` | `password123` | Администратор комплекса |

> [!TIP]
> **Как сменить пароль любого пользователя через Docker в 1 команду:**
> ```bash
> # Хэш bcrypt для пароля 'password123':
> # $2b$10$rvXonxDqxcanLBEwpqO.5eXnFBIYk1Ur80gN64.ScRwYu8Ecab0Mq
> 
> cat << 'EOF' | docker exec -i primakov-postgres psql -U primakov -d primakovapp
> UPDATE users SET password_hash = '$2b$10$rvXonxDqxcanLBEwpqO.5eXnFBIYk1Ur80gN64.ScRwYu8Ecab0Mq' WHERE email = 'нужный_email';
> EOF
> ```

---

## 💾 Резервное копирование и сохранность данных (Бэкапы)

В репозитории подготовлен скрипт горячего резервного копирования [`backend/scripts/server/backup-db.sh`](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/backend/scripts/server/backup-db.sh).

### Ручной запуск бэкапа:
```bash
/root/Primakov_App/backend/scripts/server/backup-db.sh
```
- Дамп базы выполняется через `pg_dump` внутри контейнера.
- Сжимается алгоритмом gzip (`.sql.gz`).
- Сохраняется в директорию `~/backups/primakov_db/`.
- Автоматически удаляются бэкапы старше 14 дней.

### Настройка автоматического бэкапа каждую ночь:
Выполните на сервере:
```bash
(crontab -l 2>/dev/null; echo "0 3 * * * /root/Primakov_App/backend/scripts/server/backup-db.sh > /dev/null 2>&1") | crontab -
```

---

## 🛠️ Решенные технические инциденты и исправления

В процессе настройки были устранены следующие проблемы:
1. **Конфликт занятых портов**: Порт 3000 и 5432 на хосте освобождены от нативных служб; база данных полностью изолирована внутри Docker.
2. **Перенос данных из нативного PostgreSQL 14 в Docker PostgreSQL 15**:
   - Выполнен чистый экспорт всех таблиц (пользователи, расписания, уроки, рейтинги, столовая, заявки).
   - База восстановлена в Docker Volume `primakov_postgres_data`.
3. **Отсутствующие колонки схемы `users` (Ошибка 401)**:
   - В код модели `PostgresUserRepository` требовались поля `avatar_url` и `two_factor_enabled`.
   - Создана миграция `018_AddAvatarAndTwoFactorToUsers.sql`, колонки успешно добавлены в базу.
4. **CORS и веб-клиент**:
   - В `backend/src/infrastructure/config/cors.ts` добавлена поддержка wildcard `*` в `ALLOWED_ORIGINS` для работы Flutter Web при локальной разработке.
5. **Healthcheck мониторинг**:
   - Добавлены эндпоинты `/health` и `/api/health`, возвращающие статус подключения к базе данных и uptime.
