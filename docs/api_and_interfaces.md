# Спецификация API и интерфейсов PrimakovApp

В данном документе приведена исчерпывающая спецификация контрактов взаимодействия между мобильным клиентом Flutter и REST API сервером, а также описание ключевых доменных интерфейсов ядра.

---

## 1. Общие конвенции API

### 1.1. Базовые URL и протоколы
- **Production Server**: `http://185.221.198.242:3000/api`
- **Local Dev Server**: `http://localhost:3000/api`
- **Протокол**: HTTP/1.1 (JSON over HTTP), кодировка `UTF-8`.
- **Заголовки по умолчанию**:
  - `Content-Type: application/json`
  - `Accept: application/json`
  - `Authorization: Bearer <JWT_TOKEN>` (для всех защищенных маршрутов)

### 1.2. Стандартный формат ответов (Envelope)

#### Успешный ответ (HTTP 200 / 201)
```json
{
  "status": "success",
  "data": {
    /* Полезная нагрузка */
  }
}
```

#### Ответ с ошибкой (HTTP 4xx / 5xx)
```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Некорректные входные данные",
    "details": [
      {
        "field": "email",
        "message": "Неверный формат адреса электронной почты"
      }
    ]
  }
}
```

---

## 2. Спецификация эндпоинтов REST API

### 2.1. Модуль аутентификации (`/api/auth`)
Реализация: [authRoutes.ts](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/backend/src/presentation/routes/authRoutes.ts) | [AuthController.ts](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/backend/src/presentation/controllers/AuthController.ts)

| Метод | Путь | Auth | Ограничение (Rate Limit) | Назначение |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/api/auth/login` | Нет | 5 запр / мин | Аутентификация пользователя по email и паролю |
| `POST` | `/api/auth/register` | Нет | 5 запр / мин | Регистрация нового аккаунта |

#### `POST /api/auth/login`
- **Запрос Body**:
  ```json
  {
    "email": "student@primakov.school",
    "password": "SecurePassword123!"
  }
  ```
- **Успешный ответ (HTTP 200)**:
  ```json
  {
    "status": "success",
    "data": {
      "user": {
        "id": "c4b18c64-42b7-4c07-b352-7f7229a4e99a",
        "email": "student@primakov.school",
        "firstName": "Александр",
        "lastName": "Морозов",
        "role": "STUDENT",
        "isActive": true,
        "vkId": null
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
- **Ошибки**: `400 Bad Request` (ошибка валидации Zod), `401 Unauthorized` (неверный логин/пароль), `429 Too Many Requests`.

---

### 2.2. Модуль пользователей и профиля (`/api/users`)
Реализация: [userRoutes.ts](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/backend/src/presentation/routes/userRoutes.ts) | [UserController.ts](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/backend/src/presentation/controllers/UserController.ts)

| Метод | Путь | Auth | Назначение |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/users/teachers` | Нет | Публичный список преподавателей для рейтинга |
| `GET` | `/api/users/me` | Да | Получение профиля текущего пользователя |
| `PUT` | `/api/users/me` | Да | Редактирование имени и фамилии профиля |
| `PUT` | `/api/users/me/password` | Да | Смена пароля текущего пользователя |

#### `PUT /api/users/me`
- **Запрос Body**:
  ```json
  {
    "firstName": "Александр",
    "lastName": "Смирнов"
  }
  ```
- **Успешный ответ (HTTP 200)**:
  ```json
  {
    "status": "success",
    "data": {
      "id": "c4b18c64-42b7-4c07-b352-7f7229a4e99a",
      "email": "student@primakov.school",
      "firstName": "Александр",
      "lastName": "Смирнов",
      "role": "STUDENT"
    }
  }
  ```

#### `PUT /api/users/me/password`
- **Запрос Body**:
  ```json
  {
    "oldPassword": "SecurePassword123!",
    "newPassword": "NewStrongPassword456!"
  }
  ```
- **Ошибки**: `400 Bad Request` (неверный текущий пароль или слабый новый пароль).

---

### 2.3. Модуль расписания (`/api/schedule`)
Реализация: [scheduleRoutes.ts](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/backend/src/presentation/routes/scheduleRoutes.ts) | [ScheduleController.ts](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/backend/src/presentation/controllers/ScheduleController.ts)

| Метод | Путь | Auth | Назначение |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/schedule/user/:userId/:date` | Да | Персональное расписание ученика/учителя на дату |
| `GET` | `/api/schedule/:groupId` | Нет | Общее расписание класса / группы |
| `GET` | `/api/schedule/:groupId/:date` | Нет | Расписание класса / группы на конкретную дату (YYYY-MM-DD) |

#### Пример ответа `GET /api/schedule/user/:userId/2026-05-12` (HTTP 200)
```json
{
  "status": "success",
  "data": {
    "id": "f8a0e8c4-9541-4822-b062-7ec0ffb65403",
    "groupId": "10A",
    "date": "2026-05-12",
    "lessons": [
      {
        "id": "1e5db5c3-8eb1-4d3f-b883-294b4e1837b2",
        "subject": "Математический анализ",
        "teacherId": "d820f4b1-8b83-4929-a1b7-a3cfcf5c09e3",
        "teacherName": "Иванов Иван Иванович",
        "startTime": "08:30:00",
        "endTime": "09:15:00",
        "room": "304",
        "floor": 3,
        "hasHomework": true,
        "homeworkDescription": "Параграф 14, задачи 14.1-14.8 в тетради"
      }
    ]
  }
}
```

---

### 2.4. Модуль дедлайнов (`/api/deadlines`)
Реализация: [deadlineRoutes.ts](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/backend/src/presentation/routes/deadlineRoutes.ts) | [DeadlineController.ts](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/backend/src/presentation/controllers/DeadlineController.ts)

| Метод | Путь | Auth | Назначение |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/deadlines` | Нет/Да | Список дедлайнов (поддерживает query param `?userId=...`) |
| `POST` | `/api/deadlines` | Да | Создание нового дедлайна пользователем |
| `PATCH` | `/api/deadlines/:deadlineId/complete`| Да | Отметка дедлайна как выполненного |

#### `POST /api/deadlines`
- **Запрос Body**:
  ```json
  {
    "title": "Эссе по обществознанию",
    "description": "Тема: Институты гражданского общества в XXI веке",
    "subject": "Обществознание",
    "dueDate": "2026-05-18T18:00:00.000Z"
  }
  ```
- **Успешный ответ (HTTP 201)**:
  ```json
  {
    "status": "success",
    "data": {
      "id": "4e7151e2-b5e1-4c28-9443-4ef1f21dbfc1",
      "title": "Эссе по обществознанию",
      "description": "Тема: Институты гражданского общества в XXI веке",
      "subject": "Обществознание",
      "dueDate": "2026-05-18T18:00:00.000Z",
      "status": "PENDING",
      "createdAt": "2026-05-10T10:00:00.000Z"
    }
  }
  ```

---

### 2.5. Модуль рейтингов преподавателей (`/api/ratings`)
Реализация: [ratingRoutes.ts](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/backend/src/presentation/routes/ratingRoutes.ts) | [RatingController.ts](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/backend/src/presentation/controllers/RatingController.ts)

| Метод | Путь | Auth | Назначение |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/ratings` | Да | Список средних оценок и отзывов по учителям |
| `POST` | `/api/ratings` | Да | Отправка оценки (1-5) и анонимного отзыва |

#### `POST /api/ratings`
- **Запрос Body**:
  ```json
  {
    "teacherId": "d820f4b1-8b83-4929-a1b7-a3cfcf5c09e3",
    "rate": 5,
    "comment": "Превосходно объясняет сложный материал!"
  }
  ```
- **Особенности**: Идентификатор ученика `studentId` сохраняется в БД для контроля повторного голосования, но **не выдается** в публичных запросах (анонимность). Внутренне генерируется `ip_hash`.

---

### 2.6. Модуль Stories (`/api/stories`)
Реализация: [storyRoutes.ts](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/backend/src/presentation/routes/storyRoutes.ts) | [StoryController.ts](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/backend/src/presentation/controllers/StoryController.ts)

| Метод | Путь | Auth | Назначение |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/stories` | Нет | Получение активных историй гимназии |
| `POST` | `/api/stories/:storyId/view` | Нет/Да | Отметка истории как просмотренной пользователем |

#### Пример элемента Stories (HTTP 200)
```json
{
  "id": "7b09435b-11c5-43ea-9fcb-a9b83b8b64e5",
  "title": "Победа на Всеросе!",
  "description": "Поздравляем команду гимназии с триумфом на олимпиаде по экономике",
  "imageUrl": "https://cdn.primakov.school/stories/olymp2026.jpg",
  "videoUrl": null,
  "linkUrl": "https://primakov.school/news/olymp-results",
  "linkText": "Читать подробнее",
  "viewedBy": ["c4b18c64-42b7-4c07-b352-7f7229a4e99a"]
}
```

---

### 2.7. Модуль объявлений (`/api/announcements`)
Реализация: [announcementRoutes.ts](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/backend/src/presentation/routes/announcementRoutes.ts) | [AnnouncementController.ts](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/backend/src/presentation/controllers/AnnouncementController.ts)

| Метод | Путь | Auth | Назначение |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/announcements` | Нет | Получение списка всех актуальных объявлений |
| `GET` | `/api/announcements/category/:category` | Нет | Фильтрация объявлений (`ACADEMIC`, `EVENT`, `GENERAL`, `URGENT`) |

---

### 2.8. Модуль аудиторий и навигации (`/api/rooms`)
Реализация: [roomRoutes.ts](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/backend/src/presentation/routes/roomRoutes.ts) | [RoomController.ts](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/backend/src/presentation/controllers/RoomController.ts)

| Метод | Путь | Auth | Назначение |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/rooms` | Нет | Полный реестр аудиторий кампуса |
| `GET` | `/api/rooms/:number` | Нет | Поиск аудитории по номеру (например, `304`) |
| `GET` | `/api/rooms/building/:building` | Нет | Аудитории корпуса (`A`, `B`, `Main`) |
| `GET` | `/api/rooms/building/:building/floor/:floor` | Нет | Аудитории конкретного этажа |

---

### 2.9. Модуль сервисных заявок (`/api/requests`)
Реализация: [requestRoutes.ts](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/backend/src/presentation/routes/requestRoutes.ts) | [RequestController.ts](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/backend/src/presentation/controllers/RequestController.ts)

| Метод | Путь | Auth | Назначение |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/requests` | Да | Создание заявки на обслуживание/ремонт/IT |
| `GET` | `/api/requests` | Да | Получение заявок, созданных текущим пользователем |
| `GET` | `/api/requests/assigned` | Да | Заявки, назначенные на текущего исполнителя |
| `PATCH`| `/api/requests/:id/status` | Да | Обновление статуса (`IN_PROGRESS`, `COMPLETED`, `CANCELLED`) |
| `GET` | `/api/requests/active` | Да | Список активных заявок |
| `GET` | `/api/requests/type/:type` | Да | Заявки по типу (`IT`, `MAINTENANCE`, `CLEANING`) |

---

### 2.10. Модуль столовой (`/api/canteen`)
Реализация: [canteenRoutes.ts](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/backend/src/presentation/routes/canteenRoutes.ts) | [CanteenController.ts](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/backend/src/presentation/controllers/CanteenController.ts)

| Метод | Путь | Auth | Назначение |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/canteen/menu/today` | Нет | Меню школьной столовой на сегодняшний день |
| `GET` | `/api/canteen/menu/:date` | Нет | Меню на произвольную дату (YYYY-MM-DD) |
| `GET` | `/api/canteen/menu/:date/:mealType` | Нет | Меню на прием пищи (`BREAKFAST`, `LUNCH`, `DINNER`, `SNACK`) |

#### Пример ответа позиции меню:
```json
{
  "id": "50e93b2a-5e26-4d2a-89a1-0f7e1b52a0a2",
  "name": "Суп-пюре из брокколи со сливками",
  "category": "Первые блюда",
  "calories": 185,
  "protein": 4.5,
  "fat": 12.0,
  "carbs": 14.2,
  "weight": 250,
  "allergens": ["lactose"],
  "isVegetarian": true,
  "isVegan": false,
  "price": 120.0
}
```

---

## 3. Ключевые интерфейсы и контракты

### 3.1. Интерфейсы репозиториев ядра (TypeScript)
Расположение: [backend/src/domain/repositories/](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/backend/src/domain/repositories)

```typescript
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
  update(user: User): Promise<void>;
  delete(id: string): Promise<void>;
  findTeachers(): Promise<User[]>;
}

export interface IScheduleRepository {
  findByUserIdAndDate(userId: string, date: string): Promise<Schedule | null>;
  findByGroupId(groupId: string): Promise<Schedule | null>;
  findByGroupIdAndDate(groupId: string, date: string): Promise<Schedule | null>;
}

export interface IDeadlineRepository {
  findByUserId(userId: string): Promise<Deadline[]>;
  findById(id: string): Promise<Deadline | null>;
  save(deadline: Deadline): Promise<void>;
  complete(id: string): Promise<void>;
}

export interface IRatingRepository {
  save(rating: Rating): Promise<Rating>;
  findByTeacherId(teacherId: string): Promise<Rating[]>;
  getAllRatings(): Promise<Rating[]>;
}
```

### 3.2. Клиентские модели данных (Dart / Flutter)
Расположение: [flutter/lib/models/api_models.dart](file:///c:/Users/sasha/ВШЭ/3%20курс/Digital_PM/Primakov_App/flutter/lib/models/api_models.dart)

- `User`: Поля `id`, `email`, `firstName`, `lastName`, `role` (`UserRole`), `isActive`, `vkId`.
- `Lesson`: Поля `id`, `subject`, `teacherId`, `teacherName`, `startTime`, `endTime`, `room`, `floor`, `hasHomework`, `homeworkDescription`.
- `Schedule`: Поля `id`, `groupId`, `date`, `List<Lesson> lessons`.
- `Deadline`: Поля `id`, `title`, `description`, `dueDate`, `userId`, `status` (`DeadlineStatus`), `subject`, `createdAt`, `completedAt`.
- `Rating`: Поля `id`, `teacherId`, `studentId`, `rate` (double), `comment`, `createdAt`.
- `Story`: Поля `id`, `title`, `description`, `imageUrl`, `videoUrl`, `viewedBy`, `linkUrl`, `linkText`.
- `CanteenMenu`: Поля `id`, `date`, `mealType` (`MealType`), `List<CanteenMenuItem> items`.
- `SupportRequest`: Поля `id`, `title`, `description`, `type` (`RequestType`), `priority`, `status`, `creatorId`, `assigneeId`, `roomId`.

---

## 4. Обработка граничных ситуаций (Edge Cases) и ошибки

| HTTP Статус | Ситуация в системе | Поведение Backend | Поведение Flutter Client |
| :--- | :--- | :--- | :--- |
| **`400 Bad Request`** | Ошибка валидации Zod (пустой пароль, невалидный email, формат даты) | Возвращает JSON со списком некорректных полей `details` | Подсвечивает конкретное текстовое поле красной подсказкой |
| **`401 Unauthorized`** | JWT токен отсутствует, подделан или истек (срок 7 дней) | Возвращает `error.code: "UNAUTHORIZED"` | Перехватчик `Dio Interceptor` сбрасывает токен в `SharedPreferences` и редиректит на `LoginScreen` |
| **`403 Forbidden`** | У пользователя нет прав по RBAC (например, ученик пытается модерировать сторис) | Возвращает `error.code: "FORBIDDEN"` | Показывает `SnackBar` с предупреждением «Недостаточно прав» |
| **`404 Not Found`** | Запрошен несуществующий ресурс (аудитория, расписание на выходной день) | Возвращает `error.code: "NOT_FOUND"` | Отображает плейсхолдер «Расписание на этот день отсутствует» |
| **`409 Conflict`** | Коллизия версий OCC при рейтинге преподавателя | Откат транзакции, ответ `error.code: "CONCURRENCY_CONFLICT"` | Повторный тихий запрос актуальных данных и предложение обновить оценку |
| **`429 Too Many Requests`** | Превышен лимит запросов Rate Limiter (брутфорс авторизации, спам заявками) | Заголовок `Retry-After: 60`, сообщение о превышении лимита | Блокирует кнопку отправки на указанное время с таймером |
| **`500 Internal Error`** | Падение пула соединений БД или необработанное исключение | Логирование в консоль/файл, ответ без утечки stack trace | Отображает экран «Ошибка связи с сервером гимназии. Попробуйте позже» |
| **Сеть недоступна** | Отсутствие интернета у клиента | Запрос не доходит | `DioException.connectionTimeout`: Flutter показывает offline-баннер |
