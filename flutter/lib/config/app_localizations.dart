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
      'all': 'Все',

      // Roles
      'roleStudent': 'Ученик',
      'roleTeacher': 'Учитель',
      'roleAdmin': 'Администратор',
      'roleSuperadmin': 'Директорат',

      // Bottom Nav
      'navHome': 'Главная',
      'navSchedule': 'Расписание',
      'navServices': 'Сервисы',
      'navProfile': 'Профиль',

      // Auth
      'loginTitle': 'Вход в гимназию',
      'loginSubtitle': 'Корпоративный портал гимназистов и преподавателей',
      'email': 'Корпоративный Email',
      'password': 'Пароль',
      'loginButton': 'Войти в систему',
      'registerButton': 'Зарегистрироваться',
      'forgotPassword': 'Забыли пароль?',
      'dontHaveAccount': 'Нет аккаунта?',
      'alreadyHaveAccount': 'Уже есть аккаунт?',
      'firstName': 'Имя',
      'lastName': 'Фамилия',
      'chooseRole': 'Выберите роль',

      // Home Screen & Day Glance
      'greetingMorning': 'Доброе утро',
      'greetingAfternoon': 'Добрый день',
      'greetingEvening': 'Добрый вечер',
      'todaySchedule': 'Расписание на сегодня',
      'viewAllSchedule': 'Все расписание →',
      'upcomingDeadlines': 'Ближайшие дедлайны',
      'schoolNews': 'Новости гимназии',
      'stories': 'Истории гимназии',
      'badgeNow': 'СЕЙЧАС',
      'badgeWeekend': 'ВЫХОДНОЙ',
      'badgeDay': 'ДЕНЬ',
      'badgeSoon': 'СКОРО УРОК',
      'badgeInProgress': 'ИДЕТ УРОК',
      'badgeBreak': 'ПЕРЕМЕНА',
      'badgeFinished': 'УРОКИ ОКОНЧЕНЫ',
      'weekendTitle': 'Воскресенье • Отдых',
      'weekendSubtitle': 'Подготовьтесь к новой учебной неделе',
      'noLessonsTodayTitle': 'Нет уроков на сегодня',
      'freeSchedule': 'Свободный график • Отличного дня!',
      'schoolDayOver': 'Учебный день завершен',
      'goodJobToday': 'Отличная работа сегодня! Отдыхайте.',
      'academicGpa': 'Успеваемость и GPA',
      'weightedGpa': 'Средневзвешенный GPA',
      'cafeteriaBalance': 'Баланс питания',
      'quoteDay': 'Цитата дня',

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
      'vegan': 'Веганское',
      'noMenuForDate': 'Меню на выбранную дату еще не опубликовано',

      // Boarding Life
      'boarding': 'Пансион Раздоры',
      'boardingLife': 'Пансион (Boarding Life)',
      'inCampus': 'В кампусе',
      'onLeave': 'На выезде',
      'eveningCheckin': 'Вечерняя перекличка',
      'imInDormitory': 'Я в корпусе',
      'leavePass': 'Заявление на выезд',
      'weekendPass': 'Выезд на выходные',

      // Houses
      'houseCup': 'Лига Домов (House Cup)',
      'houseNorth': 'Север',
      'houseSouth': 'Юг',
      'houseEast': 'Восток',
      'houseWest': 'Запад',
      'points': 'баллов',
      'leader': 'Лидер',
      'rank': 'Место',

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
      'appearance': 'Оформление',
      'darkMode': 'Темная тема',
      'lightMode': 'Светлая тема',
      'language': 'Язык',
      'appLanguage': 'Язык интерфейса',
      'selectedLanguage': 'Русский',
      'chooseLanguage': 'Выберите язык',
      'contacts': 'Контакты',
      'phone': 'Телефон',
      'telegram': 'Telegram',
      'corporateEmail': 'Корпоративная почта',
      'twoFactorAuth': 'Двухфакторная аутентификация',
      'activeSessions': 'Активные сессии',
      'publicProfile': 'Мой публичный профиль',
      'editProfile': 'Редактировать профиль',
      'changePassword': 'Сменить пароль',
      'helpAndSupport': 'Помощь и поддержка',
      'curator': 'Академический куратор',
      'documentsAndRegulations': 'Документы и регламенты',
      'notifications': 'Уведомления',
      'aboutApp': 'О приложении',
      'version': 'Версия',
      'licenses': 'Лицензии',
      'privacyPolicy': 'Политика конфиденциальности',
      'logout': 'Выйти из профиля',
      'confirmLogout': 'Вы уверены, что хотите выйти из приложения?',
      'birthDate': 'Дата рождения',
      'yearsOld': 'лет',
      'studentGpa': 'Средний балл',
      'attendance': 'Посещаемость',
      'deadlinesDone': 'Сдано дедлайнов',
      'deadlinesPending': 'В процессе',
      'devicesOnline': 'устройства в сети',
      'twoFactorSubtitle': 'Дополнительная защита аккаунта',
      'twoFactorEnabledMsg': '2FA успешно включена',
      'twoFactorDisabledMsg': '2FA выключена',
      'twoFactorErrorMsg': 'Ошибка переключения 2FA',
      'adminPanel': 'Панель администратора (Web)',
      'adminPanelSubtitle': 'Управление пользователями, контентом и заявками',
      'cannotOpenWebPanel': 'Не удалось открыть веб-панель',
      'publicProfileSubtitle': 'Контакты, расписание и как вас видят в справочнике',
      'editProfileSubtitle': 'Контакты, дата рождения, личные данные',
      'changePasswordSubtitle': 'Обновить пароль доступа',
      'helpAndSupportSubtitle': 'Куратор, техническая поддержка, контакты',
      'documentsAndRegulationsSubtitle': 'Устав, правила, заказ справок',
      'aboutAppSubtitle': 'Версия • Лицензии',
      'aboutAppDescription': 'Информационная система управления учебным процессом АНОО «Гимназия им. Е.М. Примакова».',
      'confirmLogoutTitle': 'Выход из аккаунта',
      'russian': 'Русский',
      'english': 'English',
      'gymnasist': 'Гимназист',
      'mySchedule': 'Мое расписание',
      'allLessons': 'Все уроки',
      'nextLesson': 'Следующий урок',
      'untilFirstLesson': 'До первого урока',
      'untilLessonEnd': 'До конца урока',
      'minutesShort': 'мин',
      'lessThanMinute': 'менее минуты',
      'bigRecess': 'Большая перемена',
      'canteenMenuNav': 'Меню столовой',
      'activeDeadlinesCount': 'активных дедлайна',
      'allTasksDone': 'Все задания выполнены',
      'checkDeadlines': 'Проверить',
      'activeTasksCount': 'активных задачи',
      'allDoneOnTime': 'Все сдано вовремя',
      'progress': 'Прогресс',
      'cafeteria': 'Столовая',
      'balance': 'Баланс',
      'quoteThought': 'МЫСЛЬ ДНЯ',
      'gpaPerformance': 'Успеваемость и GPA',
      'medalCandidate': 'Претендент на медаль',
      'goodStudent': 'Хорошист',
      'currentGpa': 'Текущий средний балл',
      'gradeSimulator': 'Симулятор оценок',
      'calculator': 'Калькулятор',
      'boardingCampus': 'Пансион Примакова • Раздоры',
      'allServices': 'Все сервисы',
      'eveningCheckInTime': 'Вечерний Check-in (21:00)',
      'boardingDormPrompt': 'Подтвердите присутствие в жилом корпусе пансиона',
      'imInCampus': 'Я в кампусе',
      'takeLeave': 'Отпроситься',
      'noNews': 'Нет новостей',
      'welcome': 'Добро пожаловать!',
      'fillAllFields': 'Пожалуйста, заполните все поля',
      'passwordsDoNotMatch': 'Пароли не совпадают',
      'passwordMinLength': 'Пароль должен быть не менее 6 символов',
      'registration': 'Регистрация',
      'confirmPassword': 'Подтвердите пароль',
      'passwordRecoverySoon': 'Восстановление пароля скоро появится',
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
      'all': 'All',

      // Roles
      'roleStudent': 'Student',
      'roleTeacher': 'Teacher',
      'roleAdmin': 'Administrator',
      'roleSuperadmin': 'Directorate',

      // Bottom Nav
      'navHome': 'Home',
      'navSchedule': 'Schedule',
      'navServices': 'Services',
      'navProfile': 'Profile',

      // Auth
      'loginTitle': 'Sign In to Gymnasium',
      'loginSubtitle': 'Primakov School Student & Faculty Portal',
      'email': 'Corporate Email',
      'password': 'Password',
      'loginButton': 'Sign In',
      'registerButton': 'Create Account',
      'forgotPassword': 'Forgot password?',
      'dontHaveAccount': 'Don\'t have an account?',
      'alreadyHaveAccount': 'Already have an account?',
      'firstName': 'First Name',
      'lastName': 'Last Name',
      'chooseRole': 'Select Role',

      // Home Screen & Day Glance
      'greetingMorning': 'Good morning',
      'greetingAfternoon': 'Good afternoon',
      'greetingEvening': 'Good evening',
      'todaySchedule': 'Today\'s Schedule',
      'viewAllSchedule': 'View Schedule →',
      'upcomingDeadlines': 'Upcoming Deadlines',
      'schoolNews': 'Gymnasium News',
      'stories': 'Campus Stories',
      'badgeNow': 'NOW',
      'badgeWeekend': 'WEEKEND',
      'badgeDay': 'DAY',
      'badgeSoon': 'LESSON SOON',
      'badgeInProgress': 'IN PROGRESS',
      'badgeBreak': 'RECESS',
      'badgeFinished': 'DAY OVER',
      'weekendTitle': 'Sunday • Rest Day',
      'weekendSubtitle': 'Prepare for the upcoming school week',
      'noLessonsTodayTitle': 'No lessons scheduled today',
      'freeSchedule': 'Free schedule • Have a wonderful day!',
      'schoolDayOver': 'Classes finished for today',
      'goodJobToday': 'Great work today! Enjoy your rest.',
      'academicGpa': 'Academic Records & GPA',
      'weightedGpa': 'Weighted GPA',
      'cafeteriaBalance': 'Meal Card Balance',
      'quoteDay': 'Quote of the Day',

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
      'vegan': 'Vegan',
      'noMenuForDate': 'Menu for selected date has not been published yet',

      // Boarding Life
      'boarding': 'Boarding Razdory',
      'boardingLife': 'Gymnasium Boarding Life',
      'inCampus': 'In Campus',
      'onLeave': 'On Leave',
      'eveningCheckin': 'Evening Roll Call',
      'imInDormitory': 'I am in Dormitory',
      'leavePass': 'Leave Pass Request',
      'weekendPass': 'Weekend Leave Pass',

      // Houses
      'houseCup': 'House Cup Tournament',
      'houseNorth': 'North',
      'houseSouth': 'South',
      'houseEast': 'East',
      'houseWest': 'West',
      'points': 'points',
      'leader': 'Leader',
      'rank': 'Rank',

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
      'appLanguage': 'App Language',
      'selectedLanguage': 'English',
      'chooseLanguage': 'Select Language',
      'contacts': 'Contacts',
      'phone': 'Phone',
      'telegram': 'Telegram',
      'corporateEmail': 'Corporate Email',
      'twoFactorAuth': 'Two-Factor Authentication',
      'activeSessions': 'Active Sessions',
      'publicProfile': 'My Public Profile',
      'editProfile': 'Edit Profile',
      'changePassword': 'Change Password',
      'helpAndSupport': 'Help & Support',
      'curator': 'Academic Curator',
      'documentsAndRegulations': 'Documents & Policies',
      'notifications': 'Notifications',
      'aboutApp': 'About Application',
      'version': 'Version',
      'licenses': 'Licenses',
      'privacyPolicy': 'Privacy Policy',
      'logout': 'Sign Out',
      'confirmLogout': 'Are you sure you want to log out of the application?',
      'birthDate': 'Date of Birth',
      'yearsOld': 'y.o.',
      'studentGpa': 'GPA',
      'attendance': 'Attendance',
      'deadlinesDone': 'Completed deadlines',
      'deadlinesPending': 'In progress',
      'devicesOnline': 'devices online',
      'twoFactorSubtitle': 'Additional account security',
      'twoFactorEnabledMsg': '2FA enabled successfully',
      'twoFactorDisabledMsg': '2FA disabled',
      'twoFactorErrorMsg': '2FA toggle error',
      'adminPanel': 'Administrator Panel (Web)',
      'adminPanelSubtitle': 'Manage users, content and requests',
      'cannotOpenWebPanel': 'Failed to open web panel',
      'publicProfileSubtitle': 'Contacts, schedule and directory visibility',
      'editProfileSubtitle': 'Contacts, birth date, personal info',
      'changePasswordSubtitle': 'Update access password',
      'helpAndSupportSubtitle': 'Curator, technical support, contacts',
      'documentsAndRegulationsSubtitle': 'Charter, rules, certificate requests',
      'aboutAppSubtitle': 'Version • Licenses',
      'aboutAppDescription': 'Academic information and management system of Primakov Gymnasium.',
      'confirmLogoutTitle': 'Sign Out',
      'russian': 'Russian',
      'english': 'English',
      'gymnasist': 'Gymnasium Student',
      'mySchedule': 'My Schedule',
      'allLessons': 'All Lessons',
      'nextLesson': 'Next Lesson',
      'untilFirstLesson': 'Until first lesson',
      'untilLessonEnd': 'Until lesson end',
      'minutesShort': 'min',
      'lessThanMinute': 'less than a minute',
      'bigRecess': 'Recess',
      'canteenMenuNav': 'Canteen Menu',
      'activeDeadlinesCount': 'active deadlines',
      'allTasksDone': 'All tasks completed',
      'checkDeadlines': 'Review',
      'activeTasksCount': 'active tasks',
      'allDoneOnTime': 'All completed on time',
      'progress': 'Progress',
      'cafeteria': 'Canteen',
      'balance': 'Balance',
      'quoteThought': 'QUOTE OF THE DAY',
      'gpaPerformance': 'Academic Records & GPA',
      'medalCandidate': 'Honors Candidate',
      'goodStudent': 'Good Standing',
      'currentGpa': 'Current GPA',
      'gradeSimulator': 'Grade Simulator',
      'calculator': 'Calculator',
      'boardingCampus': 'Primakov Boarding • Razdory',
      'allServices': 'All Services',
      'eveningCheckInTime': 'Evening Check-in (21:00)',
      'boardingDormPrompt': 'Confirm your presence in the dormitory',
      'imInCampus': 'I am in campus',
      'takeLeave': 'Request Leave',
      'noNews': 'No announcements',
      'welcome': 'Welcome!',
      'fillAllFields': 'Please fill in all fields',
      'passwordsDoNotMatch': 'Passwords do not match',
      'passwordMinLength': 'Password must be at least 6 characters',
      'registration': 'Registration',
      'confirmPassword': 'Confirm Password',
      'passwordRecoverySoon': 'Password recovery coming soon',
    },
  };

  String translate(String key) {
    final langCode = locale.languageCode;
    return _localizedValues[langCode]?[key] ??
        _localizedValues['ru']?[key] ??
        key;
  }

  // Getters for convenience
  String get appName => translate('appName');
  String get cancel => translate('cancel');
  String get save => translate('save');
  String get delete => translate('delete');
  String get close => translate('close');
  String get retry => translate('retry');
  String get error => translate('error');
  String get success => translate('success');
  String get loading => translate('loading');
  String get all => translate('all');

  String get navHome => translate('navHome');
  String get navSchedule => translate('navSchedule');
  String get navServices => translate('navServices');
  String get navProfile => translate('navProfile');

  String get loginTitle => translate('loginTitle');
  String get loginSubtitle => translate('loginSubtitle');
  String get email => translate('email');
  String get password => translate('password');
  String get loginButton => translate('loginButton');
  String get registerButton => translate('registerButton');

  String get todaySchedule => translate('todaySchedule');
  String get noLessonsToday => translate('noLessonsToday');
  String get room => translate('room');
  String get floor => translate('floor');
  String get teacher => translate('teacher');
  String get homework => translate('homework');

  String get deadlines => translate('deadlines');
  String get canteen => translate('canteen');
  String get boarding => translate('boarding');
  String get houseCup => translate('houseCup');
  String get services => translate('services');
  String get settings => translate('settings');
  String get language => translate('language');
  String get logout => translate('logout');
  String get appearance => translate('appearance');
  String get darkMode => translate('darkMode');
  String get lightMode => translate('lightMode');
  String get roleStudent => translate('roleStudent');
  String get roleTeacher => translate('roleTeacher');
  String get roleAdmin => translate('roleAdmin');
  String get roleSuperadmin => translate('roleSuperadmin');
  String get confirmLogoutTitle => translate('confirmLogoutTitle');
  String get confirmLogout => translate('confirmLogout');
  String get appLanguage => translate('appLanguage');
  String get chooseLanguage => translate('chooseLanguage');
  String get russian => translate('russian');
  String get english => translate('english');
  String get birthDate => translate('birthDate');
  String get phone => translate('phone');
  String get telegram => translate('telegram');
  String get corporateEmail => translate('corporateEmail');
  String get twoFactorAuth => translate('twoFactorAuth');
  String get activeSessions => translate('activeSessions');
  String get publicProfile => translate('publicProfile');
  String get editProfile => translate('editProfile');
  String get changePassword => translate('changePassword');
  String get helpAndSupport => translate('helpAndSupport');
  String get documentsAndRegulations => translate('documentsAndRegulations');
  String get aboutApp => translate('aboutApp');
  String get schoolNews => translate('schoolNews');
  String get badgeNow => translate('badgeNow');
  String get badgeWeekend => translate('badgeWeekend');
  String get badgeDay => translate('badgeDay');
  String get badgeSoon => translate('badgeSoon');
  String get badgeInProgress => translate('badgeInProgress');
  String get badgeBreak => translate('badgeBreak');
  String get badgeFinished => translate('badgeFinished');
  String get weekendTitle => translate('weekendTitle');
  String get weekendSubtitle => translate('weekendSubtitle');
  String get noLessonsTodayTitle => translate('noLessonsTodayTitle');
  String get freeSchedule => translate('freeSchedule');
  String get schoolDayOver => translate('schoolDayOver');
  String get goodJobToday => translate('goodJobToday');
  String get quoteDay => translate('quoteDay');
  String get quoteThought => translate('quoteThought');
  String get gpaPerformance => translate('gpaPerformance');
  String get mySchedule => translate('mySchedule');
  String get allLessons => translate('allLessons');
  String get welcome => translate('welcome');
  String get registration => translate('registration');
  String get forgotPassword => translate('forgotPassword');
  String get dontHaveAccount => translate('dontHaveAccount');
  String get alreadyHaveAccount => translate('alreadyHaveAccount');
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
