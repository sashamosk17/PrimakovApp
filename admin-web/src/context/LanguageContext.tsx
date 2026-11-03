import React, { createContext, useContext, useState } from "react";

export type AdminLanguage = "ru" | "en";

interface LanguageContextType {
  language: AdminLanguage;
  setLanguage: (lang: AdminLanguage) => void;
  t: (key: string) => string;
}

const translations: Record<AdminLanguage, Record<string, string>> = {
  ru: {
    // Navigation
    "nav.dashboard": "Дашборд",
    "nav.users": "Пользователи",
    "nav.schedule": "Расписание и предметы",
    "nav.canteen": "Столовая и меню",
    "nav.requests": "Заявки",
    "nav.ratings": "Рейтинги учителей",
    "nav.announcements": "Объявления",
    "nav.stories": "Истории (Stories)",
    "nav.houses": "Лига Домов",
    "nav.boarding": "Пансион",
    "nav.enrollment": "Новое зачисление",
    "nav.logout": "Выйти",
    "nav.portal": "Институциональный портал",
    "nav.school": "Гимназия Примакова",

    // Header
    "header.title": "Elite Academy Admin",
    "header.searchPlaceholder": "Поиск записей, учеников, заявок... (Ctrl+K)",
    "header.notifications": "Центр срочных оповещений",
    "header.noUrgentAlerts": "Срочных оповещений нет",
    "header.urgentRequests": "Срочные сервисные заявки",
    "header.recentSubstitutions": "Замены преподавателей",
    "header.viewAll": "Перейти ко всем",

    // Dashboard
    "dash.title": "Институциональный Обзор",
    "dash.subtitle": "Добро пожаловать в административную панель Гимназии им. Примакова.",
    "dash.period": "Учебный период",
    "dash.semester": "Осенний семестр 2026",
    "dash.totalStudents": "Всего учащихся",
    "dash.activeRequests": "Активных сервисных заявок",
    "dash.csi": "Индекс CSI (Рейтинг учителей)",
    "dash.attendance": "Посещаемость занятий",
    "dash.weeklyActivity": "Недельная активность экосистемы",
    "dash.activitySubtitle": "Количество обращений и заходов в приложение",
    "dash.students": "Ученики",
    "dash.teachers": "Учителя",
    "dash.recentRequests": "Недавние сервисные заявки",
    "dash.allRequests": "Все заявки →",
    "dash.addStudent": "Добавить ученика",
    "dash.createAnn": "Создать объявление",
    "dash.importCsv": "Импорт CSV базы",
    "dash.serviceDesk": "Сервисный стол заявок",
    "dash.announcements": "Объявления гимназии",
    "dash.spotlight": "Гордость Гимназии",

    // Users
    "users.title": "Управление Пользователями",
    "users.total": "Всего пользователей в системе:",
    "users.exportCsv": "Экспорт CSV",
    "users.importCsv": "Импорт CSV",
    "users.addUser": "Добавить пользователя",
    "users.all": "Все",
    "users.students": "Ученики",
    "users.teachers": "Учителя",
    "users.admins": "Администраторы",
    "users.searchPlaceholder": "Поиск по ФИО или email...",
    "users.searchBtn": "Найти",
    "users.classFilter": "Класс:",
    "users.allClasses": "Все классы",
    "users.colUser": "Пользователь",
    "users.colEmail": "Email",
    "users.colRole": "Роль и класс",
    "users.colStatus": "Статус",
    "users.colRegistered": "Регистрация",
    "users.colActions": "Действия",
    "users.active": "Активен",
    "users.disabled": "Отключен",
    "users.editUser": "Редактировать",
    "users.resetPass": "Сброс пароля",
    "users.delete": "Удалить",
    "users.viewProfile": "Профиль",
    "users.profileTitle": "Карточка пользователя",
    "users.birthDate": "Дата рождения",
    "users.contacts": "Контакты",
    "users.phone": "Телефон",
    "users.telegram": "Telegram",
    "users.scheduleTitle": "Расписание на день",
    "users.noLessonsToday": "Уроков на выбранный день не запланировано",
    "users.birthdayToday": "🎂 Сегодня день рождения!",
    "users.birthdaySoon": "🎉 День рождения на этой неделе!",

    // Schedule
    "sched.title": "Расписание и Замены Уроков",
    "sched.gridClasses": "Сетка классов",
    "sched.matrixView": "Матрица дня (Matrix Grid)",
    "sched.initDay": "Инициализировать день",
    "sched.addLesson": "+ Добавить урок",
    "sched.substitute": "Замена учителя",
    "sched.deleteLesson": "Отменить урок",
    "sched.collisionWarning": "Внимание: коллизия преподавателя!",
    "sched.slot": "Урок",
    "sched.room": "Каб.",
    "sched.hw": "ДЗ",

    // Requests
    "req.title": "Сервисный Стол Заявок",
    "req.subtitle": "Управление заявками на ремонт, IT-поддержку и уборку",
    "req.allCategories": "Все категории",
    "req.allStatuses": "Все статусы",
    "req.pending": "Новые",
    "req.inProgress": "В работе",
    "req.completed": "Выполненные",
    "req.cancelled": "Отмененные",
    "req.assignee": "Ответственный мастер",
    "req.assign": "Назначить",
    "req.resolveNotes": "Резолюция / Заметка",
    "req.completeBtn": "Завершить заявку",
    "req.inWorkBtn": "В работу",

    // Ratings
    "ratings.title": "Модерация Рейтингов Учителей",
    "ratings.subtitle": "Контроль отзывов учеников и обратной связи",
    "ratings.teacher": "Преподаватель",
    "ratings.author": "Автор (Класс)",
    "ratings.score": "Оценка",
    "ratings.comment": "Отзыв / Комментарий",
    "ratings.status": "Статус модерации",
    "ratings.approve": "Одобрить",
    "ratings.hide": "Скрыть",
    "ratings.delete": "Удалить",
    "ratings.allRatings": "Все оценки",
    "ratings.filterTeacher": "Все преподаватели",

    // Announcements
    "ann.title": "Школьные Объявления и Новости",
    "ann.subtitle": "Публикация анонсов, поздравлений и оповещений гимназии",
    "ann.new": "Новое объявление",
    "ann.published": "Опубликованные объявления",
    "ann.delete": "Удалить новость",
    "ann.category": "Категория",
    "ann.audience": "Целевая аудитория",
    "ann.publishBtn": "Опубликовать",

    // Canteen
    "canteen.title": "Столовая и Питание",
  },
  en: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.users": "Users & Rosters",
    "nav.schedule": "Timetable & Subjects",
    "nav.canteen": "Canteen & Nutrition",
    "nav.requests": "Service Desk",
    "nav.ratings": "Teacher Feedback",
    "nav.announcements": "Announcements",
    "nav.stories": "Stories",
    "nav.houses": "House Cup",
    "nav.boarding": "Boarding Life",
    "nav.enrollment": "New Enrollment",
    "nav.logout": "Sign Out",
    "nav.portal": "Institutional Portal",
    "nav.school": "Primakov Gymnasium",

    // Header
    "header.title": "Elite Academy Admin",
    "header.searchPlaceholder": "Search rosters, students, tickets... (Ctrl+K)",
    "header.notifications": "Urgent Alert Center",
    "header.noUrgentAlerts": "No urgent alerts",
    "header.urgentRequests": "Urgent Service Tickets",
    "header.recentSubstitutions": "Teacher Substitutions",
    "header.viewAll": "View all",

    // Dashboard
    "dash.title": "Institutional Overview",
    "dash.subtitle": "Welcome to the Primakov Gymnasium administrative control portal.",
    "dash.period": "Academic Term",
    "dash.semester": "Fall Term 2026",
    "dash.totalStudents": "Total Students",
    "dash.activeRequests": "Active Service Requests",
    "dash.csi": "CSI Teacher Rating",
    "dash.attendance": "Daily Attendance",
    "dash.weeklyActivity": "Weekly Ecosystem Traffic",
    "dash.activitySubtitle": "Requests and user interactions logged",
    "dash.students": "Students",
    "dash.teachers": "Faculty",
    "dash.recentRequests": "Recent Helpdesk Requests",
    "dash.allRequests": "All Requests →",
    "dash.addStudent": "Enroll Student",
    "dash.createAnn": "Publish Notice",
    "dash.importCsv": "Import CSV Roster",
    "dash.serviceDesk": "Campus Helpdesk",
    "dash.announcements": "School Notices",
    "dash.spotlight": "Gymnasium Pride",

    // Users
    "users.title": "User Directory & Rosters",
    "users.total": "Total system users:",
    "users.exportCsv": "Export CSV",
    "users.importCsv": "Import CSV",
    "users.addUser": "Add User",
    "users.all": "All",
    "users.students": "Students",
    "users.teachers": "Faculty",
    "users.admins": "Staff & Admins",
    "users.searchPlaceholder": "Search name or email...",
    "users.searchBtn": "Search",
    "users.classFilter": "Class:",
    "users.allClasses": "All Classes",
    "users.colUser": "User",
    "users.colEmail": "Email",
    "users.colRole": "Role & Class",
    "users.colStatus": "Status",
    "users.colRegistered": "Joined",
    "users.colActions": "Actions",
    "users.active": "Active",
    "users.disabled": "Suspended",
    "users.editUser": "Edit Profile",
    "users.resetPass": "Reset Password",
    "users.delete": "Delete",
    "users.viewProfile": "Profile",
    "users.profileTitle": "User Profile Card",
    "users.birthDate": "Date of Birth",
    "users.contacts": "Contacts",
    "users.phone": "Phone",
    "users.telegram": "Telegram",
    "users.scheduleTitle": "Day Timetable",
    "users.noLessonsToday": "No lessons scheduled for this day",
    "users.birthdayToday": "🎂 Birthday today!",
    "users.birthdaySoon": "🎉 Birthday coming up this week!",

    // Schedule
    "sched.title": "Timetable & Teacher Substitutions",
    "sched.gridClasses": "Class Rosters",
    "sched.matrixView": "Timetable Matrix (Grid)",
    "sched.initDay": "Initialize Day",
    "sched.addLesson": "+ Add Lesson",
    "sched.substitute": "Substitute Teacher",
    "sched.deleteLesson": "Cancel Lesson",
    "sched.collisionWarning": "Warning: Teacher schedule conflict!",
    "sched.slot": "Slot",
    "sched.room": "Room",
    "sched.hw": "HW",

    // Requests
    "req.title": "Service Desk & Work Orders",
    "req.subtitle": "Track IT tickets, facilities maintenance, and cleaning requests",
    "req.allCategories": "All Categories",
    "req.allStatuses": "All Statuses",
    "req.pending": "Pending",
    "req.inProgress": "In Progress",
    "req.completed": "Completed",
    "req.cancelled": "Cancelled",
    "req.assignee": "Assigned Technician",
    "req.assign": "Assign",
    "req.resolveNotes": "Resolution Notes",
    "req.completeBtn": "Complete Ticket",
    "req.inWorkBtn": "Take in Work",

    // Ratings
    "ratings.title": "Teacher Feedback Moderation",
    "ratings.subtitle": "Review anonymous student feedback and moderate responses",
    "ratings.teacher": "Faculty Member",
    "ratings.author": "Student (Class)",
    "ratings.score": "Score",
    "ratings.comment": "Feedback",
    "ratings.status": "Moderation Status",
    "ratings.approve": "Approve",
    "ratings.hide": "Hide",
    "ratings.delete": "Delete",
    "ratings.allRatings": "All Scores",
    "ratings.filterTeacher": "All Faculty",

    // Announcements
    "ann.title": "School Announcements & Stories",
    "ann.subtitle": "Broadcast campus news, assembly updates, and calendar highlights",
    "ann.new": "Create Announcement",
    "ann.published": "Published Announcements",
    "ann.delete": "Delete Notice",
    "ann.category": "Category",
    "ann.audience": "Target Audience",
    "ann.publishBtn": "Publish Now",

    // Canteen
    "canteen.title": "Canteen & Nutrition Management",
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: "ru",
  setLanguage: () => { },
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<AdminLanguage>(() => {
    return (localStorage.getItem("primakov_admin_lang") as AdminLanguage) || "ru";
  });

  const setLanguage = (lang: AdminLanguage) => {
    localStorage.setItem("primakov_admin_lang", lang);
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations["ru"]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
