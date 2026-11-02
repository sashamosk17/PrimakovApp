# Спецификация базы данных PostgreSQL (Database Reference)

В данном документе приведено детальное описание схемы реляционной базы данных **PrimakovApp** (PostgreSQL 14+), всех таблиц, столбцов, типов данных, индексов, внешних ключей и хронологии миграций.

---

## 1. Общие принципы проектирования БД

- **СУБД**: PostgreSQL 14+
- **Стратегия первичных ключей**: Использование UUIDv4 (`gen_random_uuid()` / `uuid_generate_v4()`) для всех основных сущностей (гарантирует уникальность в распределенных средах, устраняет коллизии при сидинге).
- **Временные метки**: `timestamptz` (timestamp with time zone) для всех дат создания и обновления.
- **Мягкое удаление (Soft Deletes)**: Поле `deleted_at timestamptz NULL` в таблицах `users`, `stories`, `announcements`. Записи никогда не удаляются физически из соображений аудита и сохранения целостности FK.
- **Оптимистическая блокировка (OCC)**: Целочисленный счетчик `version` в таблице `ratings` для предотвращения race condition при конкурентных обновлениях.
- **Анонимизация**: Внутреннее поле `ip_hash` (SHA-256) в таблице `ratings` предотвращает накрутку оценок учителей без сохранения персональных данных ученика.

---

## 2. Словарь таблиц и схема данных

### 2.1. Таблица `users` (Пользователи)
Основная таблица учетных записей учащихся, преподавателей и администраторов гимназии.
Миграции: `001_CreateUsersTable.sql`, `001a_AddGroupNameToUsers.sql`, `008_AddDeletedAtToUsers.sql`, `018_AddAvatarAndTwoFactorToUsers.sql`, `025_AddUserProfileFields.sql`.

| Столбец | Тип данных | Nullable | Ограничения / Default | Описание |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | Нет | `PRIMARY KEY` | Уникальный идентификатор пользователя |
| `email` | `VARCHAR(255)` | Нет | `UNIQUE` | Корпоративный или персональный email |
| `password_hash`| `VARCHAR(255)` | Нет | — | Хеш пароля (bcrypt, 10 раундов) |
| `first_name` | `VARCHAR(100)` | Нет | — | Имя пользователя |
| `last_name` | `VARCHAR(100)` | Нет | — | Фамилия пользователя |
| `role` | `VARCHAR(20)` | Нет | `CHECK in ('STUDENT', 'TEACHER', 'ADMIN', 'SUPERADMIN')` | Роль в системе для RBAC |
| `group_name` | `VARCHAR(50)` | Да | `NULL` | Название учебного класса (например, `10A`), только для учеников |
| `is_active` | `BOOLEAN` | Нет | `DEFAULT true` | Флаг активности учетной записи |
| `vk_id` | `VARCHAR(100)` | Да | `NULL` | Идентификатор профиля VK для будущей интеграции |
| `avatar_url` | `TEXT` | Да | `NULL` | URL или путь к загруженному аватару профиля |
| `birth_date` | `DATE` | Да | `NULL` | Дата рождения пользователя (для именинников и возраста) |
| `phone` | `VARCHAR(50)` | Да | `NULL` | Контактный номер телефона |
| `telegram` | `VARCHAR(100)` | Да | `NULL` | Telegram username (@username) для быстрой связи |
| `two_factor_enabled` | `BOOLEAN` | Нет | `DEFAULT false` | Флаг двухфакторной аутентификации |
| `created_at` | `TIMESTAMPTZ` | Нет | `DEFAULT CURRENT_TIMESTAMP` | Дата и время регистрации |
| `updated_at` | `TIMESTAMPTZ` | Нет | `DEFAULT CURRENT_TIMESTAMP` | Дата и время последнего обновления профиля |
| `deleted_at` | `TIMESTAMPTZ` | Да | `NULL` | Метка мягкого удаления |

---

### 2.2. Таблица `schedules` (Заголовки расписаний)
Связывает расписание на конкретную дату с индивидуальным учеником или учебной группой.
Миграции: `002_CreateSchedulesTable.sql`.

| Столбец | Тип данных | Nullable | Ограничения / Default | Описание |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | Нет | `PRIMARY KEY` | Идентификатор дня расписания |
| `user_id` | `UUID` | Да | `REFERENCES users(id) ON DELETE CASCADE` | Владелец индивидуального расписания (ученик/учитель) |
| `group_id` | `VARCHAR(50)` | Да | `NULL` | Fallback-идентификатор класса (например, `10A`) |
| `date` | `DATE` | Нет | — | Календарная дата уроков (YYYY-MM-DD) |
| `created_at` | `TIMESTAMPTZ` | Нет | `DEFAULT CURRENT_TIMESTAMP` | Дата создания записи |
| `updated_at` | `TIMESTAMPTZ` | Нет | `DEFAULT CURRENT_TIMESTAMP` | Дата модификации |

*Индексы*: `CREATE INDEX idx_schedules_user_date ON schedules(user_id, date);`

---

### 2.3. Таблица `lessons` (Уроки / Занятия)
Конкретные уроки, входящие в расписание дня.
Миграции: `002a_CreateLessonsTable.sql`, `015_AddHomeworkDescriptionToLessons.sql`.

| Столбец | Тип данных | Nullable | Ограничения / Default | Описание |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | Нет | `PRIMARY KEY` | Идентификатор занятия |
| `schedule_id` | `UUID` | Нет | `REFERENCES schedules(id) ON DELETE CASCADE` | Ссылка на день расписания |
| `subject` | `VARCHAR(100)`| Нет | — | Название предмета (например, `Алгебра`) |
| `teacher_id` | `UUID` | Нет | `REFERENCES users(id)` | Преподаватель, ведущий занятие |
| `start_time` | `TIME` | Нет | — | Время начала урока (например, `08:30:00`) |
| `end_time` | `TIME` | Нет | — | Время окончания урока (например, `09:15:00`) |
| `room_id` | `UUID` | Да | `REFERENCES rooms(id)` | Ссылка на аудиторию кампуса |
| `room_number` | `VARCHAR(20)` | Да | — | Строковый номер аудитории (денормализация для скорости) |
| `has_homework`| `BOOLEAN` | Нет | `DEFAULT false` | Флаг наличия домашнего задания |
| `homework_description` | `TEXT` | Да | `NULL` | Полная формулировка домашнего задания |
| `created_at` | `TIMESTAMPTZ` | Нет | `DEFAULT CURRENT_TIMESTAMP` | Дата фиксации урока |

---

### 2.4. Таблица `deadlines` (Дедлайны по заданиям)
Индивидуальный трекер учебных задач учащегося.
Миграции: `003_CreateDeadlinesTable.sql`.

| Столбец | Тип данных | Nullable | Ограничения / Default | Описание |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | Нет | `PRIMARY KEY` | Идентификатор дедлайна |
| `user_id` | `UUID` | Нет | `REFERENCES users(id) ON DELETE CASCADE` | Создатель / исполнитель дедлайна |
| `title` | `VARCHAR(255)`| Нет | — | Заголовок учебного задания |
| `description` | `TEXT` | Да | — | Детали и критерии сдачи |
| `subject` | `VARCHAR(100)`| Да | — | Привязка к школьному предмету |
| `due_date` | `TIMESTAMPTZ` | Нет | — | Дедлайн (дата и время сдачи) |
| `status` | `VARCHAR(20)` | Нет | `CHECK in ('PENDING', 'COMPLETED', 'OVERDUE')` | Текущий статус выполнения |
| `completed_at`| `TIMESTAMPTZ` | Да | `NULL` | Момент фактической отметки выполнения |
| `created_at` | `TIMESTAMPTZ` | Нет | `DEFAULT CURRENT_TIMESTAMP` | Дата постановки |
| `updated_at` | `TIMESTAMPTZ` | Нет | `DEFAULT CURRENT_TIMESTAMP` | Дата обновления |

*Индексы*: `CREATE INDEX idx_deadlines_user_status ON deadlines(user_id, status);`

---

### 2.5. Таблица `ratings` (Анонимный рейтинг учителей)
Оценки преподавателей с защитой от флуда и оптимистической блокировкой.
Миграции: `004_CreateRatingsTable.sql`, `013_AddCommentToRatings.sql`.

| Столбец | Тип данных | Nullable | Ограничения / Default | Описание |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | Нет | `PRIMARY KEY` | Идентификатор оценки |
| `teacher_id` | `UUID` | Нет | `REFERENCES users(id) ON DELETE CASCADE` | Оцениваемый преподаватель |
| `user_id` | `UUID` | Да | `REFERENCES users(id) ON DELETE SET NULL` | ID ученика (не отдается в API) |
| `value` | `INTEGER` | Нет | `CHECK (value BETWEEN 1 AND 5)` | Оценка по шкале от 1 до 5 |
| `comment` | `TEXT` | Да | `NULL` | Текстовый отзыв об уроке |
| `version` | `INTEGER` | Нет | `DEFAULT 1` | Поле версионирования для OCC |
| `ip_hash` | `VARCHAR(64)` | Да | — | SHA-256 хеш IP-адреса отправителя |
| `created_at` | `TIMESTAMPTZ` | Нет | `DEFAULT CURRENT_TIMESTAMP` | Время отправки отзыва |
| `updated_at` | `TIMESTAMPTZ` | Нет | `DEFAULT CURRENT_TIMESTAMP` | Время изменения отзыва |

*Индексы*: `CREATE INDEX idx_ratings_teacher ON ratings(teacher_id);`

---

### 2.6. Таблицы `stories` и `story_views` (Истории и просмотры)
Медиа-новости гимназии и трекер просмотров.
Миграции: `006_CreateStoriesTable.sql`, `011_SeedStories.sql`, `012_CreateStoryViewsTable.sql`, `016_AddLinkFieldsToStories.sql`, `017_SeedNewStoriesFixed.sql`.

#### Таблица `stories`
| Столбец | Тип данных | Nullable | Ограничения / Default | Описание |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | Нет | `PRIMARY KEY` | Идентификатор сторис |
| `title` | `VARCHAR(255)`| Нет | — | Заголовок новости |
| `description` | `TEXT` | Да | — | Описание новости |
| `image_url` | `TEXT` | Да | — | Ссылка на CDN с изображением |
| `video_url` | `TEXT` | Да | — | Ссылка на видеофайл |
| `link_url` | `VARCHAR(500)`| Да | — | Внешняя гиперссылка кнопки действия |
| `link_text` | `VARCHAR(100)`| Да | `DEFAULT 'Подробнее'` | Текст на кнопке действия |
| `author_id` | `UUID` | Да | `REFERENCES users(id)` | Создатель (администратор/пресс-служба) |
| `created_at` | `TIMESTAMPTZ` | Нет | `DEFAULT CURRENT_TIMESTAMP` | Дата публикации |
| `expires_at` | `TIMESTAMPTZ` | Да | — | Дата автоскрытия истории |
| `deleted_at` | `TIMESTAMPTZ` | Да | `NULL` | Мягкое удаление |

#### Таблица `story_views`
| Столбец | Тип данных | Nullable | Ограничения / Default | Описание |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | Нет | `PRIMARY KEY` | Идентификатор просмотра |
| `story_id` | `UUID` | Нет | `REFERENCES stories(id) ON DELETE CASCADE` | Ссылка на сторис |
| `user_id` | `UUID` | Нет | `REFERENCES users(id) ON DELETE CASCADE` | Ссылка на просмотревшего пользователя |
| `viewed_at` | `TIMESTAMPTZ` | Нет | `DEFAULT CURRENT_TIMESTAMP` | Дата и время просмотра |

*Индексы*: `CREATE UNIQUE INDEX idx_story_user_view ON story_views(story_id, user_id);`

---

### 2.7. Таблица `announcements` (Объявления гимназии)
Миграции: `005_CreateAnnouncementsTable.sql`, `014_AlignAnnouncementsSchema.sql`.

| Столбец | Тип данных | Nullable | Ограничения / Default | Описание |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | Нет | `PRIMARY KEY` | Идентификатор объявления |
| `title` | `VARCHAR(255)`| Нет | — | Заголовок объявления |
| `description` | `TEXT` | Да | — | Краткое резюме |
| `content` | `TEXT` | Нет | — | Полный текст объявления |
| `image_url` | `TEXT` | Да | — | Иллюстрация |
| `date` | `DATE` | Нет | `DEFAULT CURRENT_DATE` | Дата события |
| `category` | `VARCHAR(50)` | Нет | `CHECK in ('ACADEMIC', 'EVENT', 'GENERAL', 'URGENT')` | Категория важности |
| `author_id` | `UUID` | Да | `REFERENCES users(id)` | Автор объявления |
| `created_at` | `TIMESTAMPTZ` | Нет | `DEFAULT CURRENT_TIMESTAMP` | Время публикации |
| `deleted_at` | `TIMESTAMPTZ` | Да | `NULL` | Мягкое удаление |

---

### 2.8. Таблица `rooms` (Аудитории кампуса)
Справочник помещений гимназии для расписания и сервисных заявок.

| Столбец | Тип данных | Nullable | Ограничения / Default | Описание |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | Нет | `PRIMARY KEY` | Идентификатор аудитории |
| `number` | `VARCHAR(20)` | Нет | `UNIQUE` | Номер кабинета (например, `304`, `А-12`) |
| `name` | `VARCHAR(100)`| Да | — | Название (например, `Лаборатория физики`) |
| `building` | `VARCHAR(50)` | Нет | `DEFAULT 'Main'` | Корпус (`Main`, `A`, `B`) |
| `floor` | `INTEGER` | Нет | `CHECK (floor BETWEEN -1 AND 6)` | Номер этажа |
| `capacity` | `INTEGER` | Да | — | Вместимость учащихся |
| `latitude` | `DECIMAL(10,8)`| Да| — | Гео-координата для карты кампуса |
| `longitude` | `DECIMAL(11,8)`| Да| — | Гео-координата для карты кампуса |
| `description` | `TEXT` | Да | — | Оснащение (проектор, интерактивная доска) |
| `is_active` | `BOOLEAN` | Нет | `DEFAULT true` | Доступность для занятий |
| `created_at` | `TIMESTAMPTZ` | Нет | `DEFAULT CURRENT_TIMESTAMP` | Дата занесения в реестр |
| `updated_at` | `TIMESTAMPTZ` | Нет | `DEFAULT CURRENT_TIMESTAMP` | Дата обновления |

---

### 2.9. Таблица `requests` (Сервисные заявки)
Внутренняя тикетная система гимназии (IT, хозяйственная часть, клининг).

| Столбец | Тип данных | Nullable | Ограничения / Default | Описание |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | Нет | `PRIMARY KEY` | Номер тикета |
| `type` | `VARCHAR(50)` | Нет | `CHECK in ('IT', 'MAINTENANCE', 'CLEANING')` | Тип проблемы |
| `title` | `VARCHAR(255)`| Нет | — | Краткая суть заявки |
| `description` | `TEXT` | Нет | — | Подробное описание неисправности |
| `status` | `VARCHAR(30)` | Нет | `CHECK in ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')` | Статус выполнения |
| `priority` | `VARCHAR(20)` | Нет | `CHECK in ('LOW', 'MEDIUM', 'HIGH', 'URGENT')` | Приоритет срочности |
| `creator_id` | `UUID` | Нет | `REFERENCES users(id)` | Пользователь, создавший заявку |
| `assignee_id` | `UUID` | Да | `REFERENCES users(id)` | Ответственный исполнитель |
| `room_id` | `UUID` | Да | `REFERENCES rooms(id)` | Аудитория, где возникла проблема |
| `notes` | `TEXT` | Да | — | Служебные заметки исполнителя |
| `created_at` | `TIMESTAMPTZ` | Нет | `DEFAULT CURRENT_TIMESTAMP` | Время подачи заявки |
| `updated_at` | `TIMESTAMPTZ` | Нет | `DEFAULT CURRENT_TIMESTAMP` | Время смены статуса |
| `completed_at`| `TIMESTAMPTZ` | Да | `NULL` | Время закрытия заявки |

---

### 2.10. Таблицы `canteen_menu` и `menu_items` (Столовая)
Миграции: `009_CreateCanteenMenuTables.sql`, `010_SeedCanteenMenu.sql`.

#### Таблица `canteen_menu`
| Столбец | Тип данных | Nullable | Ограничения / Default | Описание |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | Нет | `PRIMARY KEY` | Идентификатор меню |
| `date` | `DATE` | Нет | — | Календарная дата подачи |
| `meal_type` | `VARCHAR(30)` | Нет | `CHECK in ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK')` | Прием пищи |
| `created_at` | `TIMESTAMPTZ` | Нет | `DEFAULT CURRENT_TIMESTAMP` | Время добавления меню |

*Индексы*: `CREATE UNIQUE INDEX idx_canteen_date_meal ON canteen_menu(date, meal_type);`

#### Таблица `menu_items`
| Столбец | Тип данных | Nullable | Ограничения / Default | Описание |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | Нет | `PRIMARY KEY` | Идентификатор блюда |
| `menu_id` | `UUID` | Нет | `REFERENCES canteen_menu(id) ON DELETE CASCADE`| Ссылка на прием пищи |
| `name` | `VARCHAR(255)`| Нет | — | Название блюда |
| `description` | `TEXT` | Да | — | Состав блюда |
| `category` | `VARCHAR(100)`| Да | — | Категория (Супы, Салаты, Горячее) |
| `calories` | `INTEGER` | Нет | `DEFAULT 0` | Калорийность (ккал) |
| `protein` | `DECIMAL(6,2)`| Да | — | Белки (г) |
| `fat` | `DECIMAL(6,2)`| Да | — | Жиры (г) |
| `carbs` | `DECIMAL(6,2)`| Да | — | Углеводы (г) |
| `weight` | `INTEGER` | Да | — | Масса порции (граммы) |
| `image_url` | `TEXT` | Да | — | Фотография готового блюда |
| `allergens` | `TEXT[]` | Нет | `DEFAULT '{}'` | Массив аллергенов (глютен, лактоза, орехи) |
| `is_vegetarian`| `BOOLEAN` | Нет | `DEFAULT false` | Вегетарианское блюдо |
| `is_vegan` | `BOOLEAN` | Нет | `DEFAULT false` | Веганское блюдо |
| `price` | `DECIMAL(8,2)`| Да | — | Цена (в рублях) |
| `display_order`| `INTEGER` | Нет | `DEFAULT 0` | Порядок отображения в меню |

---

### 2.11. Таблица `audit_logs` (Журнал аудита действий администрации)
Миграции: `019_CreateAuditLogsTable.sql`.

| Столбец | Тип данных | Nullable | Ограничения / Default | Описание |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | Нет | `PRIMARY KEY DEFAULT gen_random_uuid()` | Идентификатор записи аудита |
| `user_id` | `UUID` | Да | `REFERENCES users(id) ON DELETE SET NULL` | Администратор, выполнивший действие |
| `action` | `VARCHAR(100)`| Нет | — | Тип операции (`CREATE_USER`, `DELETE_USER`, `SUBSTITUTE_TEACHER`...) |
| `entity` | `VARCHAR(50)` | Нет | — | Затронутая сущность (`USER`, `SCHEDULE`, `SUBJECT`, `CANTEEN`...) |
| `entity_id` | `VARCHAR(100)`| Да | — | ID затронутой сущности |
| `details` | `JSONB` | Да | — | Дополнительный контекст операции в формате JSON |
| `ip_address` | `VARCHAR(45)` | Да | — | IP-адрес инициатора запроса |
| `created_at` | `TIMESTAMPTZ` | Нет | `DEFAULT CURRENT_TIMESTAMP` | Время фиксации действия в аудит-логе |

*Индексы*: `idx_audit_logs_created_at`, `idx_audit_logs_user_id`, `idx_audit_logs_action`, `idx_audit_logs_entity`.

---

### 2.12. Таблицы `subjects` и `teacher_subjects` (Справочник дисциплин и аккредитация)
Миграции: `020_CreateSubjectsAndTeacherSubjectsTable.sql`, `024_SeedStandardSubjects.sql`.

#### Таблица `subjects` (Дисциплины)
| Столбец | Тип данных | Nullable | Ограничения / Default | Описание |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | Нет | `PRIMARY KEY DEFAULT gen_random_uuid()` | Идентификатор дисциплины |
| `name` | `VARCHAR(150)`| Нет | `UNIQUE` | Название предмета (например, `Алгебра и начала анализа`) |
| `description` | `TEXT` | Да | — | Описание кафедры / направленности дисциплины |
| `created_at` | `TIMESTAMPTZ` | Нет | `DEFAULT CURRENT_TIMESTAMP` | Дата добавления дисциплины |
| `updated_at` | `TIMESTAMPTZ` | Нет | `DEFAULT CURRENT_TIMESTAMP` | Дата изменения параметров |

#### Таблица `teacher_subjects` (Матрица закрепления преподавателей)
Связывает преподавателей со списком предметов, которые они имеют право вести в гимназии.

| Столбец | Тип данных | Nullable | Ограничения / Default | Описание |
| :--- | :--- | :---: | :--- | :--- |
| `teacher_id` | `UUID` | Нет | `REFERENCES users(id) ON DELETE CASCADE` | Идентификатор преподавателя |
| `subject_id` | `UUID` | Нет | `REFERENCES subjects(id) ON DELETE CASCADE` | Идентификатор учебного предмета |
| `created_at` | `TIMESTAMPTZ` | Нет | `DEFAULT CURRENT_TIMESTAMP` | Дата и время закрепления |

*Первичный ключ*: Составной `PRIMARY KEY (teacher_id, subject_id)`.  
*Индексы*: `idx_teacher_subjects_teacher`, `idx_teacher_subjects_subject`.

---

### 2.13. Таблица `system_settings` (Системные настройки)
Миграции: `021_CreateSystemSettingsTable.sql`.

| Столбец | Тип данных | Nullable | Ограничения / Default | Описание |
| :--- | :--- | :---: | :--- | :--- |
| `key` | `VARCHAR(100)`| Нет | `PRIMARY KEY` | Ключ параметра (например, `canteen_ordering_enabled`) |
| `value` | `JSONB` | Нет | — | Значение настройки в JSON-формате |
| `description` | `TEXT` | Да | — | Описание назначения конфигурационного параметра |
| `updated_at` | `TIMESTAMPTZ` | Нет | `DEFAULT CURRENT_TIMESTAMP` | Время обновления настройки |
| `updated_by` | `UUID` | Да | `REFERENCES users(id) ON DELETE SET NULL` | Пользователь, изменивший настройку |

---

### 2.14. Таблица `deadline_notifications` (Логирование отправки push-уведомлений)
Миграции: `022_CreateDeadlineNotificationsTable.sql`.

| Столбец | Тип данных | Nullable | Ограничения / Default | Описание |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | Нет | `PRIMARY KEY DEFAULT gen_random_uuid()` | Идентификатор отправленного алерта |
| `deadline_id` | `UUID` | Нет | `REFERENCES deadlines(id) ON DELETE CASCADE` | Задача, по которой отправлен пуш |
| `notification_type`| `VARCHAR(50)`| Нет | `CHECK in ('24h', '2h')` | Горизонт срабатывания алерта |
| `sent_at` | `TIMESTAMPTZ` | Нет | `DEFAULT CURRENT_TIMESTAMP` | Момент фактической отправки уведомления |

*Ограничение уникальности*: `CONSTRAINT uq_deadline_notification_type UNIQUE (deadline_id, notification_type)`.  
*Индексы*: `idx_deadline_notifications_lookup ON (deadline_id, notification_type)`.

---

## 3. Реестр миграций базы данных

Расположение: [backend/src/infrastructure/database/migrations/](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/backend/src/infrastructure/database/migrations)

Миграции выполняются автоматически при старте сервера модулем [migrationRunner.ts](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/backend/src/infrastructure/database/migrations/migrationRunner.ts) с контролем выполнения через таблицу служебных записей `migrations`. При сборке Docker-контейнера скрипт `scripts/copy-migrations.js` гарантированно копирует все `.sql` файлы в директорию `dist/`.

| № | Файл миграции | Назначение и SQL-изменения |
| :---: | :--- | :--- |
| `001` | `001_CreateUsersTable.sql` | Создание базовой таблицы `users` со столбцами аутентификации и ролями. |
| `001a`| `001a_AddGroupNameToUsers.sql` | Добавление столбца `group_name` для поддержки привязки к школьным классам. |
| `002` | `002_CreateSchedulesTable.sql` | Создание таблицы `schedules` с поддержкой `user_id` и `group_id`. |
| `002a`| `002a_CreateLessonsTable.sql` | Создание таблицы `lessons` с внешними ключами на расписание, учителя и аудиторию. |
| `003` | `003_CreateDeadlinesTable.sql` | Создание таблицы `deadlines` с индексами по пользователю и статусу задачи. |
| `004` | `004_CreateRatingsTable.sql` | Создание таблицы `ratings` со шкалой 1-5, полем `version` (OCC) и `ip_hash`. |
| `005` | `005_CreateAnnouncementsTable.sql` | Создание таблицы `announcements` с категоризацией объявлений. |
| `006` | `006_CreateStoriesTable.sql` | Создание таблицы `stories` для публикации медиа-контента гимназии. |
| `007` | `007_SeedUsers.sql` | Первоначальное наполнение учетных записей (тестовые ученики, учителя, админ). |
| `008` | `008_AddDeletedAtToUsers.sql` | Внедрение столбца `deleted_at` для мягкого удаления пользователей. |
| `009` | `009_CreateCanteenMenuTables.sql` | Создание связанных таблиц `canteen_menu` и `menu_items` с КБЖУ и аллергенами. |
| `010` | `010_SeedCanteenMenu.sql` | Сидирование недельного рациона столовой гимназии. |
| `011` | `011_SeedStories.sql` | Сидирование стартовых школьных новостей в формате сторис. |
| `012` | `012_CreateStoryViewsTable.sql` | Создание таблицы `story_views` с уникальным индексом `(story_id, user_id)`. |
| `013` | `013_AddCommentToRatings.sql` | Добавление текстового столбца `comment` в таблицу `ratings`. |
| `014` | `014_AlignAnnouncementsSchema.sql`| Синхронизация полей объявлений (`date`, `category`, `image_url`). |
| `015` | `015_AddHomeworkDescriptionToLessons.sql`| Расширение таблицы `lessons` текстовым полем `homework_description`. |
| `016` | `016_AddLinkFieldsToStories.sql` | Добавление столбцов `link_url` и `link_text` для кликабельных кнопок в сторис. |
| `017` | `017_SeedNewStoriesFixed.sql` | Обновление демонстрационного пула историй актуальными событиями. |
| `018` | `018_AddAvatarAndTwoFactorToUsers.sql` | Добавление полей `avatar_url` и `two_factor_enabled` в таблицу `users` для поддержки расширенного профиля и 2FA. |
| `019` | `019_CreateAuditLogsTable.sql` | Создание таблицы `audit_logs` для системного аудита действий администраторов. |
| `020` | `020_CreateSubjectsAndTeacherSubjectsTable.sql` | Создание справочника `subjects` и матрицы закрепления `teacher_subjects`. |
| `021` | `021_CreateSystemSettingsTable.sql` | Создание таблицы `system_settings` для хранения динамических конфигураций. |
| `022` | `022_CreateDeadlineNotificationsTable.sql` | Создание таблицы `deadline_notifications` для дедупликации пуш-алертов за 24ч и 2ч. |
| `023` | `023_SeedLargeScaleUsersAndClasses.sql` | Масштабное сидирование 110+ учащихся и 27 педагогов по всем 24 классам гимназии с нормализацией классов через дефис (`10-А`, `11-А`). |
| `024` | `024_SeedStandardSubjects.sql` | Первоначальное наполнение справочника 25 ключевыми гимназическими дисциплинами по 5 кафедрам. |
| `025` | `025_AddUserProfileFields.sql` | Добавление полей профиля `birth_date`, `phone`, `telegram` в таблицу `users`, сидирование ДР и контактов тестовых пользователей. |
