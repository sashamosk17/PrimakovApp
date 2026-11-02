import 'package:flutter/material.dart';

class AppLocalizations {
  final Locale locale;

  AppLocalizations(this.locale);

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations) ??
        AppLocalizations(const Locale('ru', 'RU'));
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  static final Map<String, Map<String, String>> _localizedValues = {
    'ru': {
      // General
      'appName': 'Гимназия Примакова',
      'cancel': 'Отмена',
      'save': 'Сохранить',
      'delete': 'Удалить',
      'close': 'Закрыть',
      'retry': 'Повторить',
      'error': 'Ошибка',
      'success': 'Успешно',
      'loading': 'Загрузка...',

      // Bottom Nav
      'navHome': 'Главная',
      'navSchedule': 'Расписание',
      'navServices': 'Сервисы',
      'navProfile': 'Профиль',

      // Home Screen
      'greetingMorning': 'Доброе утро',
      'greetingAfternoon': 'Добрый день',
      'greetingEvening': 'Добрый вечер',
      'todaySchedule': 'Расписание на сегодня',
      'viewAllSchedule': 'Все расписание →',
      'upcomingDeadlines': 'Ближайшие дедлайны',
      'schoolNews': 'Новости гимназии',
      'stories': 'Истории гимназии',

      // Schedule Screen
      'schedule': 'Расписание',
      'noLessonsToday': 'В этот день уроков нет',
      'room': 'Кабинет',
      'floor': 'этаж',
      'teacher': 'Преподаватель',
      'homework': 'Домашнее задание',
      'noHomework': 'ДЗ не задано',
      'bellSchedule': 'Сетка звонков',
      'substituteLesson': 'Замена урока',
      'offlineBadge': 'Данные из офлайн-кэша',
      'syncNow': 'Обновить',

      // Deadlines
      'deadlines': 'Дедлайны',
      'allTasks': 'Все',
      'activeTasks': 'Активные',
      'completedTasks': 'Завершенные',
      'addDeadline': 'Добавить задачу',
      'title': 'Название задачи',
      'subject': 'Предмет',
      'dueDate': 'Срок сдачи',
      'priority': 'Приоритет',
      'urgent': 'Срочно',
      'high': 'Высокий',
      'medium': 'Средний',
      'low': 'Низкий',
      'emptyDeadlines': 'Все задачи выполнены! Отличная работа.',

      // Canteen
      'canteen': 'Столовая',
      'canteenMenu': 'Меню столовой',
      'todayMenu': 'Меню на сегодня',
      'breakfast': 'Завтрак',
      'lunch': 'Обед',
      'snack': 'Полдник',
      'dinner': 'Ужин',
      'calories': 'ккал',
      'protein': 'Белки',
      'fat': 'Жиры',
      'carbs': 'Углеводы',
      'portionWeight': 'г',
      'allergens': 'Аллергены',
      'vegetarian': 'Вегетарианское',
      'noMenuForDate': 'Меню на выбранную дату еще не опубликовано',

      // Services
      'services': 'Кампусные сервисы',
      'itHelpdesk': 'IT-поддержка',
      'facilitiesHelpdesk': 'Хозяйственный ремонт',
      'cleaningService': 'Клининг аудиторий',
      'createTicket': 'Подать заявку',
      'teacherRatings': 'Рейтинг преподавателей',
      'campusDirectory': 'Навигатор кабинетов',
      'myTickets': 'Мои обращения',

      // Teacher Ratings
      'rateTeacher': 'Оценить учителя',
      'anonymousReview': 'Анонимный отзыв',
      'score': 'Оценка',
      'comment': 'Комментарий',
      'submitRating': 'Отправить отзыв',

      // Profile & Settings
      'profile': 'Профиль',
      'settings': 'Настройки',
      'appearance': 'Внешний вид',
      'darkMode': 'Темная тема',
      'lightMode': 'Светлая тема',
      'language': 'Язык',
      'selectedLanguage': 'Русский',
      'chooseLanguage': 'Выберите язык',
      'notifications': 'Уведомления',
      'aboutApp': 'О приложении',
      'version': 'Версия',
      'licenses': 'Лицензии',
      'privacyPolicy': 'Политика конфиденциальности',
      'logout': 'Выйти из аккаунта',
      'confirmLogout': 'Вы уверены, что хотите выйти из приложения?',
    },
    'en': {
      // General
      'appName': 'Primakov Gymnasium',
      'cancel': 'Cancel',
      'save': 'Save',
      'delete': 'Delete',
      'close': 'Close',
      'retry': 'Retry',
      'error': 'Error',
      'success': 'Success',
      'loading': 'Loading...',

      // Bottom Nav
      'navHome': 'Home',
      'navSchedule': 'Schedule',
      'navServices': 'Services',
      'navProfile': 'Profile',

      // Home Screen
      'greetingMorning': 'Good morning',
      'greetingAfternoon': 'Good afternoon',
      'greetingEvening': 'Good evening',
      'todaySchedule': 'Today\'s Schedule',
      'viewAllSchedule': 'View Schedule →',
      'upcomingDeadlines': 'Upcoming Deadlines',
      'schoolNews': 'Gymnasium News',
      'stories': 'Campus Stories',

      // Schedule Screen
      'schedule': 'Timetable',
      'noLessonsToday': 'No lessons scheduled for this day',
      'room': 'Room',
      'floor': 'floor',
      'teacher': 'Teacher',
      'homework': 'Homework',
      'noHomework': 'No homework assigned',
      'bellSchedule': 'Bell Schedule',
      'substituteLesson': 'Teacher Substitution',
      'offlineBadge': 'Offline cached data',
      'syncNow': 'Refresh',

      // Deadlines
      'deadlines': 'Deadlines',
      'allTasks': 'All',
      'activeTasks': 'Active',
      'completedTasks': 'Completed',
      'addDeadline': 'Add Task',
      'title': 'Task Title',
      'subject': 'Subject',
      'dueDate': 'Due Date',
      'priority': 'Priority',
      'urgent': 'Urgent',
      'high': 'High',
      'medium': 'Medium',
      'low': 'Low',
      'emptyDeadlines': 'All tasks completed! Great job.',

      // Canteen
      'canteen': 'Canteen',
      'canteenMenu': 'Canteen Menu',
      'todayMenu': 'Today\'s Menu',
      'breakfast': 'Breakfast',
      'lunch': 'Lunch',
      'snack': 'Afternoon Snack',
      'dinner': 'Dinner',
      'calories': 'kcal',
      'protein': 'Protein',
      'fat': 'Fat',
      'carbs': 'Carbs',
      'portionWeight': 'g',
      'allergens': 'Allergens',
      'vegetarian': 'Vegetarian',
      'noMenuForDate': 'Menu for selected date has not been published yet',

      // Services
      'services': 'Campus Services',
      'itHelpdesk': 'IT Support',
      'facilitiesHelpdesk': 'Facilities & Repairs',
      'cleaningService': 'Room Cleaning',
      'createTicket': 'Submit Request',
      'teacherRatings': 'Teacher Feedback',
      'campusDirectory': 'Campus Room Directory',
      'myTickets': 'My Service Tickets',

      // Teacher Ratings
      'rateTeacher': 'Rate Teacher',
      'anonymousReview': 'Anonymous Review',
      'score': 'Score',
      'comment': 'Comment',
      'submitRating': 'Submit Feedback',

      // Profile & Settings
      'profile': 'Profile',
      'settings': 'Settings',
      'appearance': 'Appearance',
      'darkMode': 'Dark Theme',
      'lightMode': 'Light Theme',
      'language': 'Language',
      'selectedLanguage': 'English',
      'chooseLanguage': 'Select Language',
      'notifications': 'Notifications',
      'aboutApp': 'About Application',
      'version': 'Version',
      'licenses': 'Licenses',
      'privacyPolicy': 'Privacy Policy',
      'logout': 'Sign Out',
      'confirmLogout': 'Are you sure you want to log out of the application?',
    },
  };

  String translate(String key) {
    final langCode = locale.languageCode;
    return _localizedValues[langCode]?[key] ??
        _localizedValues['ru']?[key] ??
        key;
  }

  // Getters for convenience
  String get navHome => translate('navHome');
  String get navSchedule => translate('navSchedule');
  String get navServices => translate('navServices');
  String get navProfile => translate('navProfile');

  String get todaySchedule => translate('todaySchedule');
  String get noLessonsToday => translate('noLessonsToday');
  String get room => translate('room');
  String get floor => translate('floor');
  String get teacher => translate('teacher');
  String get homework => translate('homework');

  String get deadlines => translate('deadlines');
  String get canteen => translate('canteen');
  String get services => translate('services');
  String get settings => translate('settings');
  String get language => translate('language');
  String get logout => translate('logout');
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) => ['ru', 'en'].contains(locale.languageCode);

  @override
  Future<AppLocalizations> load(Locale locale) async {
    return AppLocalizations(locale);
  }

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

