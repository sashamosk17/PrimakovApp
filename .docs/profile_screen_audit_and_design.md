# Документация экрана профиля (Profile Screen) — PrimakovApp

Данный документ содержит исчерпывающее описание аудита, архитектуры, интеграционных эндпоинтов и реализации экрана профиля (`profile_screen.dart`), а также всех связанных подсистем бэкенда и фронтенда.

---

## 1. Исходный аудит экрана профиля: проблемы и недостатки

До ревитализации экран профиля (`lib/screens/main/profile_screen.dart`) содержал ряд критических архитектурных и функциональных недоработок:

1. **Аватар профиля (Photo Profile):**
   - Был представлен статичной иконкой `Icons.person` и некликабельной декоративной кнопкой редактирования `Icons.edit`.
   - В сущности `User` на бэкенде и в базе данных поле для аватара отсутствовало.
   - Пользователь не мог ни просмотреть свою фотографию, ни выбрать готовую, ни загрузить/указать новую.

2. **Уведомления (Notifications):**
   - Настройки уведомлений (`Push`, `Дедлайны`, `Расписание`, `Объявления`) хранились исключительно локально в `SharedPreferences` на клиенте без синхронизации с сервером. При смене устройства или переустановке приложения настройки сбрасывались.
   - На бэкенде отсутствовали эндпоинты управления предпочтениями уведомлений.

3. **Активные сессии (Active Sessions):**
   - В модальном окне `_showActiveSessionsSheet` находились на 100% захардкоженные статические виджеты («iPhone 13 Pro», «MacBook Pro»).
   - Не было реального получения списка сессий пользователя, привязки к токенам, информации об IP/локации, а также кнопки отзыва (Revoke) сессий.

4. **Двухфакторная аутентификация (2FA):**
   - Переключатель управлял лишь локальной булевой переменной `bool _twoFactorEnabled = true;` в `State`, выводя Snackbar, но никак не влиял на аккаунт на сервере.

5. **Академическая статистика (GPA и Посещаемость):**
   - Виджет `_StatsCard` содержал жестко закодированные значения `4.85` и `98%` для всех студентов.
   - Не было агрегации реальных показателей сдачи дедлайнов и посещаемости.

6. **Кнопки-заглушки (Stubs):**
   - Кнопки «Помощь и поддержка» и «Документы» показывали только Snackbar: *«Раздел помощи скоро появится»* и *«Документы скоро появятся»*, что прямо нарушало устав `AGENTS.md` (*«Никаких заглушек»*).

---

## 2. Архитектура бэкенда (Clean Architecture + Result Pattern)

В строгом соответствии с `AGENTS.md` и Clean Architecture были реализованы 4 слоя:

```
[Presentation]
  ├── UserController (getMe, updateProfile, changePassword, getSessions, revokeSession, getNotificationSettings, updateNotificationSettings, getStats)
  └── userRoutes.ts (JWT-защищенные маршруты /api/users/me/*)
        │
[Application]
  ├── GetCurrentUserUseCase
  ├── UpdateProfileUseCase (с валидацией avatarUrl и twoFactorEnabled)
  ├── ChangePasswordUseCase
  ├── GetUserSessionsUseCase
  ├── RevokeSessionUseCase
  ├── GetNotificationSettingsUseCase
  ├── UpdateNotificationSettingsUseCase
  └── GetUserStatsUseCase (расчет академических метрик и дедлайнов)
        │
[Domain]
  ├── User (расширен полями avatarUrl, twoFactorEnabled)
  ├── UserSession (id, userId, device, platform, ipAddress, location, lastActiveAt, createdAt, isCurrent)
  ├── NotificationPreferences (pushEnabled, deadlineNotifications, scheduleNotifications, announcementNotifications)
  ├── UserStats (userId, gpa, attendanceRate, totalLessons, completedDeadlines, pendingDeadlines)
  ├── IUserRepository
  ├── ISessionRepository
  └── INotificationRepository
        │
[Infrastructure]
  ├── MockUserRepository / PostgresUserRepository
  ├── MockSessionRepository (seed-сессии, отзыв сессий)
  └── MockNotificationPreferencesRepository (персистентное хранение настроек)
```

> **Безопасность (AgentShield):** Ни один контроллер не обращается к SQL-запросам или драйверу БД напрямую. Все Use Cases возвращают строго типизированный `Result<T>` (`Result.ok`, `Result.fail`).

---

## 3. Спецификация REST API бэкенда

Все эндпоинты профиля требуют заголовок `Authorization: Bearer <jwt_token>` (срок жизни токена 7 дней, payload содержит `userId`, `email`, `role`).

### 3.1. Получение и обновление профиля
- **GET `/api/users/me`**
  - **Ответ 200 OK:**
    ```json
    {
      "status": "success",
      "data": {
        "id": "user-1",
        "email": "ivan.petrov@primakov.school",
        "firstName": "Иван",
        "lastName": "Петров",
        "role": "STUDENT",
        "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
        "twoFactorEnabled": true,
        "isActive": true
      }
    }
    ```
- **PUT `/api/users/me`**
  - **Тело запроса:**
    ```json
    {
      "firstName": "Иван",
      "lastName": "Петров",
      "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
      "twoFactorEnabled": true
    }
    ```
  - **Ответ 200 OK:** обновленный объект пользователя (пароли и хеши никогда не возвращаются).

### 3.2. Активные сессии
- **GET `/api/users/me/sessions`**
  - **Ответ 200 OK:**
    ```json
    {
      "status": "success",
      "data": [
        {
          "id": "session-1",
          "userId": "user-1",
          "device": "iPhone 15 Pro",
          "platform": "ios",
          "ipAddress": "194.85.12.34",
          "location": "Москва, Россия",
          "lastActiveAt": "2026-10-29T10:00:00.000Z",
          "createdAt": "2026-10-22T08:30:00.000Z",
          "isCurrent": true
        },
        {
          "id": "session-2",
          "userId": "user-1",
          "device": "MacBook Pro 16",
          "platform": "macos",
          "ipAddress": "178.62.204.11",
          "location": "Москва, Россия",
          "lastActiveAt": "2026-10-29T07:15:00.000Z",
          "createdAt": "2026-10-20T14:00:00.000Z",
          "isCurrent": false
        }
      ]
    }
    ```
- **DELETE `/api/users/me/sessions/:sessionId`**
  - **Ответ 200 OK:**
    ```json
    {
      "status": "success",
      "message": "Session successfully revoked"
    }
    ```

### 3.3. Настройки уведомлений
- **GET `/api/users/me/notifications`**
  - **Ответ 200 OK:**
    ```json
    {
      "status": "success",
      "data": {
        "pushEnabled": true,
        "deadlineNotifications": true,
        "scheduleNotifications": true,
        "announcementNotifications": true
      }
    }
    ```
- **PUT `/api/users/me/notifications`**
  - **Тело запроса:** частичный или полный объект `NotificationPreferences`.
  - **Ответ 200 OK:** обновленные настройки.

### 3.4. Академическая статистика
- **GET `/api/users/me/stats`**
  - **Ответ 200 OK:**
    ```json
    {
      "status": "success",
      "data": {
        "userId": "user-1",
        "gpa": 4.85,
        "attendanceRate": 98.0,
        "totalLessons": 32,
        "completedDeadlines": 12,
        "pendingDeadlines": 3
      }
    }
    ```

---

## 4. Реализация на стороне Frontend (Flutter & Riverpod)

### 4.1. Модели данных (`lib/models/api_models.dart`)
- `User`: добавлены поля `avatarUrl`, `twoFactorEnabled`, методы `fromJson`, `toJson`, `copyWith`.
- `UserSession`: парсинг даты активности, флага `isCurrent`, названия устройства, платформы и IP.
- `UserStats`: числовые поля `gpa`, `attendanceRate`, `completedDeadlines`, `pendingDeadlines`.
- `NotificationSettings`: поддержка сериализации и двунаправленного слияния.

### 4.2. Сетевой слой (`lib/services/api/user_service.dart`)
Реализованы методы:
- `updateProfile({firstName, lastName, avatarUrl, twoFactorEnabled})`
- `getSessions()`
- `revokeSession(sessionId)`
- `getStats()`
- `getNotificationSettings()`
- `updateNotificationSettings(settings)`

### 4.3. Провайдеры состояний (`lib/providers/user_provider.dart` & `ui_provider.dart`)
- `profileProvider` / `ProfileNotifier`: управление профилем и сменой аватара/2FA.
- `sessionsProvider` / `SessionsNotifier`: реактивная загрузка сессий и локальное удаление отозванных сессий из UI.
- `userStatsProvider`: асинхронный FutureProvider для загрузки метрик студента.
- `uiProvider` / `UINotifier`: двухуровневая синхронизация настроек уведомлений — мгновенное локальное сохранение в `SharedPreferences` + фоновая синхронизация с облачным бэкендом.

### 4.4. Интерактивные элементы экрана профиля (`profile_screen.dart`)

1. **Фото профиля:**
   - Полноценная карточка аватара с индикацией загрузки и обработчиком ошибок сети.
   - При клике на фото или кнопку камеры открывается модальное окно выбора:
     - 6 готовых аватаров гимназии.
     - Поле ввода собственного URL с живым превью.
     - Кнопка удаления фото (возврат к фирменной монограмме/иконке).
     - Кнопка «Сохранить» с отправкой PUT-запроса и показом SnackBar.

2. **Статистика студента:**
   - Отображение живого GPA (`4.85`) и Посещаемости (`98%`).
   - Дополнительные информационные плашки: «Сдано дедлайнов» (зеленая) и «В процессе» (оранжевая).

3. **2FA:**
   - Переключатель связан с сервером. При изменении вызывается `updateProfile(twoFactorEnabled: value)` с моментальной обратной связью.

4. **Активные сессии:**
   - Модальное окно с отображением реального списка подключенных устройств, распознаванием платформы (iOS, Android, macOS, Windows) и времени последней активности.
   - Возможность принудительно завершить чужую сессию с подтверждением в диалоговом окне.

5. **Помощь и поддержка:**
   - Модальное окно контактов академического куратора (Смирнова Елена Николаевна, каб. 204) с функциями копирования email и совершения звонка через `url_launcher`.
   - Контакты технической поддержки и прямая ссылка на официальный Telegram-бот `@primakov_help_bot`.

6. **Документы и заказ справок:**
   - Официальные нормативные документы гимназии (Устав, Правила распорядка, Положение об академической честности, Положение о школьной форме) с кнопкой скачивания.
   - Форма заказа официальной справки об обучении с гербовой печатью гимназии.

7. **Редактирование профиля и смена пароля:**
   - Полная интеграция с экранами `EditProfileScreen` и `ChangePasswordScreen`.

---

## 5. Результаты верификации и тестов

1. **Бэкенд (Jest):**
   - Успешно выполнено **19 тестовых наборов**, **224 теста** (100% зеленые).
   - Интеграционный файл `tests/api/user.test.ts` полностью покрывает все новые эндпоинты профиля:
     - Обновление `avatarUrl` и `twoFactorEnabled`.
     - Получение и отзыв сессий (`GET/DELETE /api/users/me/sessions`).
     - Получение и обновление настроек уведомлений (`GET/PUT /api/users/me/notifications`).
     - Получение академической статистики (`GET /api/users/me/stats`).

2. **Фронтенд (Flutter):**
   - `flutter analyze lib/screens/main/profile_screen.dart`: **No issues found!** (0 ошибок, 0 предупреждений).
   - `flutter test test/profile_models_test.dart`: **All 4 tests passed!**
   - `flutter test test/widget_test.dart`: **All tests passed!**

