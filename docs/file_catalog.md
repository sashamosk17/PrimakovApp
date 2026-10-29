# Полный каталог файлов проекта (Source Code File Catalog)

В данном документе приведен исчерпывающий реестр всех файлов серверной (`backend/`) и клиентской (`flutter/`) частей проекта **PrimakovApp** с описанием назначения каждого файла, ключевых экспортируемых символов и связей с другими модулями.

---

## 1. Серверная часть (Backend)

Корень каталога: [backend/](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/backend)

### 1.1. Точка входа и конфигурация
| Файл | Описание и ответственность | Экспорты / Символы |
| :--- | :--- | :--- |
| [backend/src/main.ts](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/backend/src/main.ts) | Точка входа сервера: валидация env, инициализация пула PostgreSQL, запуск SQL-миграций, сборка DI-контейнера репозиториев, подключение роутов и middleware, graceful shutdown. | `startServer()` |
| [backend/src/infrastructure/config/validateEnv.ts](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/backend/src/infrastructure/config/validateEnv.ts) | Валидация переменных окружения при старте через схему Zod (DB_HOST, PORT, JWT_SECRET...). | `validateEnvironment()` |
| [backend/src/infrastructure/config/database.ts](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/backend/src/infrastructure/config/database.ts) | Конфигурация и управление пулом соединений `pg.Pool`, обработка дисконнектов. | `createDatabasePool()`, `closeDatabasePool()`, `getDatabasePool()` |
| [backend/src/infrastructure/config/cors.ts](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/backend/src/infrastructure/config/cors.ts) | Конфигурация Cross-Origin Resource Sharing. | `corsConfig` |
| [backend/src/infrastructure/config/rateLimiter.ts](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/backend/src/infrastructure/config/rateLimiter.ts) | Ограничители частоты запросов: general (100/мин), auth (5/мин), write (20/мин). | `generalRateLimiter`, `authRateLimiter`, `writeRateLimiter` |
| [backend/src/shared/types.ts](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/backend/src/shared/types.ts) | Глобальные типы данных: роли пользователей (`Role`), системные привилегии (`Permission`), payload токена (`AuthPayload`). | `Role`, `Permission`, `AuthPayload` |
| [backend/src/shared/constants.ts](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/backend/src/shared/constants.ts) | Ролевая матрица доступа: словарь разрешений для каждой роли (RBAC). | `ROLE_PERMISSIONS` |

### 1.2. Слой домена (Domain Layer)
Каталог: [backend/src/domain/](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/backend/src/domain)

| Файл | Описание и ответственность | Экспорты / Символы |
| :--- | :--- | :--- |
| `domain/entities/User.ts` | Доменная сущность пользователя: смена пароля, проверка прав `hasPermission`, сериализация. | `class User` |
| `domain/entities/Schedule.ts` | Доменная сущность расписания дня: привязка к пользователю и урокам. | `class Schedule` |
| `domain/entities/Lesson.ts` | Сущность урока: предмет, время, преподаватель, аудитория, домашнее задание. | `class Lesson` |
| `domain/entities/Deadline.ts` | Сущность дедлайна: статус (PENDING/COMPLETED/OVERDUE), отметка выполнения. | `class Deadline` |
| `domain/entities/Rating.ts` | Сущность рейтинга: оценка 1-5, OCC-версия, комментарий, хеш IP. | `class Rating` |
| `domain/entities/Story.ts` | Сущность сторис: медиа-ссылки, срок жизни, внешняя ссылка. | `class Story` |
| `domain/entities/Announcement.ts` | Сущность официального объявления с категоризацией. | `class Announcement` |
| `domain/value-objects/Email.ts` | Value Object валидного адреса электронной почты с нормализацией. | `class Email` |
| `domain/value-objects/Password.ts` | Value Object безопасного пароля: валидация сложности и хеширование bcrypt. | `class Password` |
| `domain/repositories/IUserRepository.ts` | Контракт интерфейса репозитория пользователей. | `interface IUserRepository` |
| `domain/repositories/IScheduleRepository.ts` | Контракт интерфейса репозитория расписаний. | `interface IScheduleRepository` |
| `domain/repositories/IDeadlineRepository.ts` | Контракт интерфейса репозитория дедлайнов. | `interface IDeadlineRepository` |
| `domain/repositories/IRatingRepository.ts` | Контракт интерфейса репозитория оценок и отзывов. | `interface IRatingRepository` |
| `domain/repositories/IStoryRepository.ts` | Контракт интерфейса репозитория историй гимназии. | `interface IStoryRepository` |
| `domain/repositories/IAnnouncementRepository.ts` | Контракт интерфейса репозитория объявлений. | `interface IAnnouncementRepository` |
| `domain/services/AuthService.ts` | Доменный сервис аутентификации: сверка bcrypt-паролей, генерация JWT токенов. | `class AuthService` |
| `domain/services/ScheduleService.ts` | Доменный сервис выборки расписания с fallback логикой. | `class ScheduleService` |
| `domain/services/DeadlineService.ts` | Доменный сервис управления жизненным циклом дедлайнов. | `class DeadlineService` |
| `domain/services/RatingService.ts` | Доменный сервис анонимного рейтингования с проверкой версий. | `class RatingService` |
| `domain/validation/authSchemas.ts` | Zod-схемы валидации регистрации и входа в систему. | `loginSchema`, `registerSchema` |
| `domain/validation/deadlineSchemas.ts` | Zod-схема валидации создания дедлайна. | `createDeadlineSchema` |

### 1.3. Слой сценариев (Application Layer / Use Cases)
Каталог: [backend/src/application/](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/backend/src/application)

| Файл | Описание и ответственность | Экспорты / Символы |
| :--- | :--- | :--- |
| `application/auth/LoginUseCase.ts` | Сценарий входа пользователя: проверка email, пароля, выдача токена. | `class LoginUseCase` |
| `application/auth/RegisterUseCase.ts` | Сценарий регистрации нового аккаунта. | `class RegisterUseCase` |
| `application/user/GetCurrentUserUseCase.ts` | Сценарий получения профиля текущего пользователя по JWT ID. | `class GetCurrentUserUseCase` |
| `application/user/UpdateProfileUseCase.ts` | Сценарий редактирования личных данных (имя, фамилия). | `class UpdateProfileUseCase` |
| `application/user/ChangePasswordUseCase.ts` | Сценарий смены пароля с валидацией старого пароля. | `class ChangePasswordUseCase` |
| `application/user/GetTeachersUseCase.ts` | Сценарий выборки всех преподавателей для рейтинга. | `class GetTeachersUseCase` |
| `application/schedule/GetScheduleByUserIdUseCase.ts` | Сценарий выборки персонального расписания ученика на дату. | `class GetScheduleByUserIdUseCase` |
| `application/schedule/GetScheduleUseCase.ts` | Сценарий выборки расписания группы. | `class GetScheduleUseCase` |
| `application/schedule/GetScheduleByDateUseCase.ts` | Сценарий выборки расписания группы на конкретный день. | `class GetScheduleByDateUseCase` |
| `application/deadline/CreateDeadlineUseCase.ts` | Сценарий создания нового дедлайна. | `class CreateDeadlineUseCase` |
| `application/deadline/GetUserDeadlinesUseCase.ts` | Сценарий выборки списка задач конкретного пользователя. | `class GetUserDeadlinesUseCase` |
| `application/deadline/CompleteDeadlineUseCase.ts` | Сценарий отметки дедлайна выполненным. | `class CompleteDeadlineUseCase` |
| `application/rating/RateTeacherUseCase.ts` | Сценарий отправки анонимной оценки преподавателю. | `class RateTeacherUseCase` |
| `application/rating/GetTeacherRatingsUseCase.ts` | Сценарий получения средних баллов преподавателей. | `class GetTeacherRatingsUseCase` |
| `application/story/GetStoriesUseCase.ts` | Сценарий выборки актуальных историй гимназии. | `class GetStoriesUseCase` |
| `application/story/MarkStoryAsViewedUseCase.ts` | Сценарий фиксации факта просмотра истории пользователем. | `class MarkStoryAsViewedUseCase` |
| `application/announcement/GetAnnouncementsUseCase.ts` | Сценарий выборки объявлений гимназии. | `class GetAnnouncementsUseCase` |
| `application/announcement/GetAnnouncementByCategoryUseCase.ts` | Сценарий выборки объявлений по категории. | `class GetAnnouncementByCategoryUseCase` |

### 1.4. Слой представления (Presentation Layer: Routes, Controllers, Middleware)
Каталог: [backend/src/presentation/](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/backend/src/presentation)

| Файл | Описание и ответственность | Экспорты / Символы |
| :--- | :--- | :--- |
| `presentation/routes/authRoutes.ts` | Роуты аутентификации (`/api/auth/login`, `/register`). | `authRoutes()` |
| `presentation/routes/userRoutes.ts` | Роуты профиля и учителей (`/api/users/me`, `/teachers`). | `userRoutes()` |
| `presentation/routes/scheduleRoutes.ts` | Роуты расписания (`/api/schedule/user/:userId/:date`, `/:groupId`). | `scheduleRoutes()` |
| `presentation/routes/deadlineRoutes.ts` | Роуты дедлайнов (`/api/deadlines`, `/:id/complete`). | `deadlineRoutes()` |
| `presentation/routes/ratingRoutes.ts` | Роуты рейтингов учителей (`/api/ratings`). | `ratingRoutes()` |
| `presentation/routes/storyRoutes.ts` | Роуты историй гимназии (`/api/stories`, `/:id/view`). | `storyRoutes()` |
| `presentation/routes/announcementRoutes.ts`| Роуты объявлений (`/api/announcements`). | `announcementRoutes()` |
| `presentation/routes/roomRoutes.ts` | Роуты справочника аудиторий (`/api/rooms`, `/:number`). | `roomRoutes()` |
| `presentation/routes/requestRoutes.ts` | Роуты сервисных заявок (`/api/requests`, `/:id/status`). | `requestRoutes()` |
| `presentation/routes/canteenRoutes.ts` | Роуты меню столовой (`/api/canteen/menu/today`, `/:date`). | `canteenRoutes()` |
| `presentation/controllers/AuthController.ts` | Контроллер обработки HTTP-запросов авторизации. | `class AuthController` |
| `presentation/controllers/UserController.ts` | Контроллер профиля и управления пользователями. | `class UserController` |
| `presentation/controllers/ScheduleController.ts` | Контроллер выдачи индивидуального/группового расписания. | `class ScheduleController` |
| `presentation/controllers/DeadlineController.ts` | Контроллер управления задачами и статусами. | `class DeadlineController` |
| `presentation/controllers/RatingController.ts` | Контроллер приема и агрегации оценок (вычисляет ip_hash). | `class RatingController` |
| `presentation/controllers/StoryController.ts` | Контроллер отдачи историй и отметки просмотров. | `class StoryController` |
| `presentation/controllers/AnnouncementController.ts` | Контроллер выдачи объявлений по категориям. | `class AnnouncementController` |
| `presentation/controllers/RoomController.ts` | Контроллер каталога аудиторий, корпусов и этажей. | `class RoomController` |
| `presentation/controllers/RequestController.ts` | Контроллер создания и модерации сервисных заявок. | `class RequestController` |
| `presentation/controllers/CanteenController.ts` | Контроллер столовой: меню на даты и приемы пищи. | `class CanteenController` |
| `presentation/middleware/authMiddleware.ts` | Проверка валидности Bearer JWT токена в заголовке запроса. | `authMiddleware` |
| `presentation/middleware/rbacMiddleware.ts` | Проверка прав доступа пользователя по списку `Permission`. | `requirePermission` |
| `presentation/middleware/validationMiddleware.ts` | Валидация тела запроса против схемы Zod. | `validate` |
| `presentation/middleware/sanitizationMiddleware.ts` | Санитайзинг строк тела запроса (защита от XSS/инъекций). | `sanitizeInput` |
| `presentation/middleware/errorHandlerMiddleware.ts` | Глобальный перехватчик исключений с форматированием в envelope. | `errorHandlerMiddleware` |

### 1.5. Слой инфраструктуры (Infrastructure Layer: PostgreSQL & Migrations)
Каталог: [backend/src/infrastructure/database/](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/backend/src/infrastructure/database)

| Файл | Описание и ответственность | Экспорты / Символы |
| :--- | :--- | :--- |
| `postgres/PostgresUserRepository.ts` | Реализация `IUserRepository` на SQL-запросах к PostgreSQL. | `class PostgresUserRepository` |
| `postgres/PostgresScheduleRepository.ts`| Реализация `IScheduleRepository` (джойн с `lessons`, `rooms`, `users`). | `class PostgresScheduleRepository` |
| `postgres/PostgresDeadlineRepository.ts`| Реализация `IDeadlineRepository` (фильтрация по пользователю/статусу). | `class PostgresDeadlineRepository` |
| `postgres/PostgresRatingRepository.ts` | Реализация `IRatingRepository` с проверкой `version` для OCC. | `class PostgresRatingRepository` |
| `postgres/PostgresStoryRepository.ts` | Реализация `IStoryRepository` с отсечением `deleted_at IS NULL`. | `class PostgresStoryRepository` |
| `postgres/PostgresAnnouncementRepository.ts`| Реализация `IAnnouncementRepository` с фильтрами по категориям. | `class PostgresAnnouncementRepository` |
| `postgres/PostgresRoomRepository.ts` | Реализация репозитория аудиторий (фильтры по корпусу/этажу). | `class PostgresRoomRepository` |
| `postgres/PostgresRequestRepository.ts`| Реализация репозитория сервисных тикетов. | `class PostgresRequestRepository` |
| `postgres/PostgresCanteenMenuRepository.ts`| Реализация репозитория столовой (джойн `canteen_menu` и `menu_items`). | `class PostgresCanteenMenuRepository` |
| `migrations/migrationRunner.ts` | Автоматический загрузчик и исполнитель SQL-миграций из файлов 001-017. | `runMigrations()` |

---

## 2. Клиентская часть (Flutter Frontend)

Корень каталога: [flutter/](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/flutter)

### 2.1. Конфигурация и точка входа
| Файл | Описание и ответственность | Экспорты / Символы |
| :--- | :--- | :--- |
| [flutter/lib/main.dart](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/flutter/lib/main.dart) | Главная точка входа Flutter: инициализация локализации (ru_RU), `ProviderScope`, переключение `AuthNavigator`/`MainNavigator`, 4 таба `BottomNavigationBar`. | `main()`, `class PrimakovApp`, `class MainNavigator` |
| [flutter/lib/config/api_config.dart](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/flutter/lib/config/api_config.dart) | Синглтон Dio, baseUrl из `API_BASE_URL`, инъекция Bearer-токена, логирование, обработка 401. | `class ApiConfig` |
| [flutter/lib/config/app_colors.dart](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/flutter/lib/config/app_colors.dart) | Палитра цветов: геральдический красный гимназии (`primaryRed`), светлая и темная темы. | `class AppColors` |
| [flutter/lib/config/app_theme.dart](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/flutter/lib/config/app_theme.dart) | Конфигурация тем `ThemeData.light` и `ThemeData.dark` по Material 3. | `class AppTheme` |
| [flutter/lib/config/app_typography.dart](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/flutter/lib/config/app_typography.dart) | Типографические стили для семейств шрифтов Manrope и Inter. | `class AppTypography` |
| [flutter/lib/config/app_spacing.dart](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/flutter/lib/config/app_spacing.dart) | Константы отступов (xs..xxl) и радиусов скруглений (radiusSm..radiusPill). | `class AppSpacing` |

### 2.2. Модели данных (DTO)
| Файл | Описание и ответственность | Экспорты / Символы |
| :--- | :--- | :--- |
| [flutter/lib/models/api_models.dart](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/flutter/lib/models/api_models.dart) | Единый файл всех DTO с `fromJson`, `toJson` и `copyWith`: `User`, `UserRole`, `Lesson`, `Schedule`, `Deadline`, `DeadlineStatus`, `Rating`, `Story`, `Announcement`, `Room`, `SupportRequest`, `RequestType`, `RequestPriority`, `RequestStatus`, `CanteenMenu`, `CanteenMenuItem`, `MealType`, `NotificationSettings`. | `class User`, `class Lesson`, `class Schedule`, `class Deadline`, `class Rating` и др. |

### 2.3. Сетевой слой (API Services)
Каталог: [flutter/lib/services/api/](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/flutter/lib/services/api)

| Файл | Описание и ответственность |
| :--- | :--- |
| `auth_service.dart` | HTTP-клиент для входа (`/api/auth/login`) и регистрации (`/register`). |
| `schedule_service.dart` | HTTP-клиент для получения расписания по `userId` и `groupId`. |
| `deadline_service.dart` | HTTP-клиент для создания, чтения и завершения дедлайнов. |
| `rating_service.dart` | HTTP-клиент для отправки оценки преподавателю и чтения рейтинга. |
| `canteen_service.dart` | HTTP-клиент для загрузки меню столовой по датам и приемам пищи. |
| `room_service.dart` | HTTP-клиент для поиска аудиторий кампуса по корпусам и этажам. |
| `request_service.dart` | HTTP-клиент для создания и смены статуса тикетов техподдержки. |
| `story_service.dart` | HTTP-клиент для получения сторис и отправки отметки о просмотре. |
| `announcement_service.dart`| HTTP-клиент для получения объявлений по категориям. |
| `user_service.dart` | HTTP-клиент для работы с профилем (`/api/users/me`) и списком преподавателей. |

### 2.4. Провайдеры состояния (Riverpod)
Каталог: [flutter/lib/providers/](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/flutter/lib/providers)

| Файл | Описание и ответственность | Ключевые провайдеры |
| :--- | :--- | :--- |
| `auth_provider.dart` | Управление состоянием авторизации, хранение токена и профиля. | `authProvider`, `isAuthenticatedProvider`, `currentUserProvider` |
| `schedule_provider.dart` | Загрузка и кэширование расписания уроков на выбранную дату. | `scheduleProvider`, `selectedDateProvider` |
| `deadline_provider.dart` | Реактивный список учебных задач, оптимистичные обновления. | `deadlineProvider`, `pendingDeadlinesProvider` |
| `rating_provider.dart` | Состояние рейтингов учителей, отправка оценок и отзывов. | `ratingProvider` |
| `canteen_provider.dart` | Загрузка меню на дату и выбранный прием пищи. | `canteenProvider`, `selectedMealTypeProvider` |
| `room_provider.dart` | Каталог аудиторий с возможностью фильтрации по корпусу. | `roomProvider` |
| `request_provider.dart` | Управление тикетами техподдержки пользователя. | `requestProvider` |
| `story_provider.dart` | Список историй гимназии и локальный трекинг просмотров. | `storyProvider` |
| `announcement_provider.dart`| Список официальных объявлений с фильтрами категорий. | `announcementProvider` |
| `user_provider.dart` | Список учителей и операции редактирования личного профиля. | `teachersListProvider`, `userProvider` |
| `ui_provider.dart` | Управление темой оформления и настройками push-уведомлений. | `isDarkModeProvider`, `uiProvider` |

### 2.5. Пользовательский интерфейс: Экраны (Screens)
Каталог: [flutter/lib/screens/](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/flutter/lib/screens)

| Файл | Описание и ответственность |
| :--- | :--- |
| `auth/login_screen.dart` | Экран входа с валидацией, переключателем видимости пароля и кнопкой входа. |
| `auth/register_screen.dart` | Экран создания учетной записи ученика/преподавателя. |
| `main/home_screen.dart` | Главный дашборд Bento Grid: лента Stories, карточка расписания, баланс, дедлайны, новости. |
| `main/schedule_screen.dart` | Календарное расписание уроков с временными слотами, аудиториями и ДЗ. |
| `main/lesson_detail_screen.dart` | Детальный экран урока: полное задание, кабинет, кнопка оценки учителя. |
| `main/deadline_screen.dart` | Трекер дедлайнов с вкладками статусов и конфетти при завершении задачи. |
| `main/add_deadline_screen.dart` | Форма создания дедлайна с выбором даты сдачи через пикер. |
| `main/story_viewer_screen.dart` | Полноэкранный плеер сторис с таймером и кнопкой перехода по внешней ссылке. |
| `main/services_screen.dart` | Плиточный каталог сервисов гимназии со строкой поиска. |
| `main/profile_screen.dart` | Профиль учащегося: роль, класс, переход к настройкам, редактированию и выходу. |
| `main/edit_profile_screen.dart` | Форма изменения имени и фамилии. |
| `main/change_password_screen.dart`| Форма безопасной смены пароля. |
| `main/settings_screen.dart` | Экран управления темой (светлая/темная) и триггерами уведомлений. |
| `canteen_menu_screen.dart` | Меню столовой: Завтрак/Обед/Полдник, расчет калорий, КБЖУ, бейджи аллергенов. |
| `teacher_ratings_screen.dart` | Экран со списком учителей, средними оценками и диалогом анонимного отзыва. |
| `rooms_list_screen.dart` | Навигационный справочник аудиторий кампуса с фильтрами по этажам и корпусам. |
| `create_request_screen.dart` | Оформление сервисной заявки на IT-помощь, ремонт или клининг. |
| `announcements_screen.dart` | Лента официальных объявлений гимназии по категориям. |

### 2.6. Переиспользуемые виджеты (Widgets)
Каталог: [flutter/lib/widgets/](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/flutter/lib/widgets)

| Файл | Описание и визуальная роль |
| :--- | :--- |
| `glassmorphic_app_bar.dart` | Аппбар с эффектом матового стекла (BackdropFilter blur). |
| `lesson_card.dart` | Карточка урока: время, предмет, чип кабинета, индикатор наличия ДЗ. |
| `deadline_card.dart` | Карточка задания со сроком сдачи, предметом и интерактивным чекбоксом. |
| `story_card.dart` | Круглая ячейка истории с градиентной окантовкой статуса просмотра. |
| `today_schedule_widget.dart` | Компактный виджет текущего/ближайшего урока для главной страницы. |
| `upcoming_deadlines_widget.dart` | Виджет горящих дедлайнов с таймером оставшегося времени. |
| `custom_button.dart` | Фирменная кнопка гимназии с анимацией клика и индикатором загрузки. |
| `custom_text_field.dart` | Стилизованное поле ввода с валидацией и переключателем видимости пароля. |
| `custom_dropdown.dart` | Выпадающее меню выбора категорий и аудиторий. |
| `priority_toggle.dart` | Сегментированный переключатель приоритета заявок (LOW/MEDIUM/HIGH/URGENT). |
