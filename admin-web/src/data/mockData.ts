import type {
  User,
  DashboardMetrics,
  ActivityPoint,
  ServiceRequest,
  TeacherRating,
  Announcement,
  Subject,
  Schedule,
  Story,
  HouseStanding,
  HouseTransaction,
  BoardingRosterItem,
  WeekendLeaveRequest,
} from "../types";

export const MOCK_METRICS: DashboardMetrics = {
  totalStudents: 1240,
  totalTeachers: 86,
  totalAdmins: 5,
  activeRequests: 14,
  csiIndex: 4.88,
  attendanceRate: 96.4,
};

export const MOCK_WEEKLY_ACTIVITY: ActivityPoint[] = [
  { day: "Пн", count: 340 },
  { day: "Вт", count: 420 },
  { day: "Ср", count: 465 },
  { day: "Чт", count: 390 },
  { day: "Пт", count: 410 },
  { day: "Сб", count: 180 },
  { day: "Вс", count: 95 },
];

// Helper to generate seed users
const TEACHERS_SEED_DATA = [
  { id: "usr-teach-1", email: "elena.sokolova@primakov.school", firstName: "Елена", lastName: "Соколова", dept: "Кафедра математики" },
  { id: "usr-teach-2", email: "mikhail.vinogradov@primakov.school", firstName: "Михаил", lastName: "Виноградов", dept: "Кафедра математики" },
  { id: "usr-teach-3", email: "olga.kuznetsova@primakov.school", firstName: "Ольга", lastName: "Кузнецова", dept: "Кафедра математики" },
  { id: "usr-teach-4", email: "sergey.polyakov@primakov.school", firstName: "Сергей", lastName: "Поляков", dept: "Кафедра математики" },
  { id: "usr-teach-5", email: "tatiana.voronina@primakov.school", firstName: "Татьяна", lastName: "Воронина", dept: "Кафедра математики" },
  { id: "usr-teach-6", email: "anna.kovaleva@primakov.school", firstName: "Анна", lastName: "Ковалева", dept: "Кафедра словесности" },
  { id: "usr-teach-7", email: "victor.sidorov@primakov.school", firstName: "Виктор", lastName: "Сидоров", dept: "Кафедра словесности" },
  { id: "usr-teach-8", email: "natalia.belova@primakov.school", firstName: "Наталья", lastName: "Белова", dept: "Кафедра словесности" },
  { id: "usr-teach-9", email: "evgeniy.orlov@primakov.school", firstName: "Евгений", lastName: "Орлов", dept: "Кафедра словесности" },
  { id: "usr-teach-10", email: "marina.chernova@primakov.school", firstName: "Марина", lastName: "Чернова", dept: "Кафедра словесности" },
  { id: "usr-teach-11", email: "dmitriy.smirnov@primakov.school", firstName: "Дмитрий", lastName: "Смирнов", dept: "Кафедра естественных наук" },
  { id: "usr-teach-12", email: "irina.vasilieva@primakov.school", firstName: "Ирина", lastName: "Васильева", dept: "Кафедра естественных наук" },
  { id: "usr-teach-13", email: "konstantin.lebedev@primakov.school", firstName: "Константин", lastName: "Лебедев", dept: "Кафедра естественных наук" },
  { id: "usr-teach-14", email: "svetlana.zhukova@primakov.school", firstName: "Светлана", lastName: "Жукова", dept: "Кафедра естественных наук" },
  { id: "usr-teach-15", email: "artyom.kozlov@primakov.school", firstName: "Артем", lastName: "Козлов", dept: "Кафедра естественных наук" },
  { id: "usr-teach-16", email: "yulia.morozova@primakov.school", firstName: "Юлия", lastName: "Морозова", dept: "Кафедра иностранных языков" },
  { id: "usr-teach-17", email: "alexander.davydov@primakov.school", firstName: "Александр", lastName: "Давыдов", dept: "Кафедра иностранных языков" },
  { id: "usr-teach-18", email: "elizabeth.clark@primakov.school", firstName: "Элизабет", lastName: "Кларк", dept: "Кафедра иностранных языков" },
  { id: "usr-teach-19", email: "olga.novikova@primakov.school", firstName: "Ольга", lastName: "Новикова", dept: "Кафедра иностранных языков" },
  { id: "usr-teach-20", email: "denis.tarasov@primakov.school", firstName: "Денис", lastName: "Тарасов", dept: "Кафедра иностранных языков" },
  { id: "usr-teach-21", email: "ivan.ivanov@primakov.school", firstName: "Иван", lastName: "Иванов", dept: "Кафедра IT и робототехники" },
  { id: "usr-teach-22", email: "gleb.nikolaev@primakov.school", firstName: "Глеб", lastName: "Николаев", dept: "Кафедра IT и робототехники" },
  { id: "usr-teach-23", email: "polina.zaytseva@primakov.school", firstName: "Полина", lastName: "Зайцева", dept: "Кафедра IT и робототехники" },
  { id: "usr-teach-24", email: "roman.fedorov@primakov.school", firstName: "Роман", lastName: "Федоров", dept: "Кафедра IT и робототехники" },
  { id: "usr-teach-25", email: "vadim.stepanov@primakov.school", firstName: "Вадим", lastName: "Степанов", dept: "Кафедра физкультуры" },
  { id: "usr-teach-26", email: "marina.karpova@primakov.school", firstName: "Марина", lastName: "Карпова", dept: "Кафедра физкультуры" },
  { id: "usr-teach-27", email: "igor.matveev@primakov.school", firstName: "Игорь", lastName: "Матвеев", dept: "Кафедра физкультуры" },
];

const CLASSES_LIST = [
  "1-А", "2-Б", "4-А",
  "5-А", "6-Б", "7-А", "8-В", "9-А", "9-Б",
  "10-А", "10-Б", "11-А", "11-Б",
];

const FIRST_NAMES = ["Александр", "Максим", "Иван", "Артем", "Дмитрий", "София", "Анна", "Мария", "Алиса", "Полина", "Кирилл", "Егор", "Дарья", "Виктория", "Елизавета"];
const LAST_NAMES = ["Иванов", "Смирнов", "Кузнецов", "Попов", "Васильев", "Петров", "Соколов", "Михайлов", "Новиков", "Федоров", "Морозов", "Волков", "Алексеев", "Лебедев", "Семенов"];

const generateStudents = (): User[] => {
  const students: User[] = [];
  let studentIdx = 1;

  for (const cls of CLASSES_LIST) {
    // 8-9 students per class -> ~110 students
    const count = cls.startsWith("10") || cls.startsWith("11") ? 9 : 8;
    for (let i = 0; i < count; i++) {
      const fName = FIRST_NAMES[(studentIdx + i) % FIRST_NAMES.length];
      const lName = LAST_NAMES[(studentIdx * 2 + i) % LAST_NAMES.length];
      const email = `${fName.toLowerCase()}.${lName.toLowerCase()}.${studentIdx}@primakov.school`;
      students.push({
        id: `usr-stud-${studentIdx}`,
        email,
        firstName: fName,
        lastName: lName,
        role: "STUDENT",
        isActive: true,
        groupName: cls,
        createdAt: "2026-09-01T08:00:00Z",
        updatedAt: "2026-10-30T10:00:00Z",
      });
      studentIdx++;
    }
  }

  return students;
};

export const MOCK_USERS: User[] = [
  {
    id: "usr-admin-1",
    email: "admin@primakov.school",
    firstName: "Александр",
    lastName: "Москалевич",
    role: "SUPERADMIN",
    isActive: true,
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    createdAt: "2026-01-15T08:00:00Z",
    updatedAt: "2026-10-30T10:00:00Z",
  },
  ...TEACHERS_SEED_DATA.map((t) => ({
    id: t.id,
    email: t.email,
    firstName: t.firstName,
    lastName: t.lastName,
    role: "TEACHER" as const,
    isActive: true,
    groupName: t.dept,
    createdAt: "2026-02-01T09:00:00Z",
    updatedAt: "2026-10-30T10:00:00Z",
  })),
  ...generateStudents(),
];

export const MOCK_REQUESTS: ServiceRequest[] = [
  {
    id: "req-1",
    type: "IT",
    title: "Не работает интерактивная панель SmartBoard",
    description: "В кабинете 305 сенсорный ввод не реагирует на стилус после перезагрузки.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    creatorId: "usr-teach-1",
    roomId: "305",
    createdAt: "2026-10-30T08:30:00Z",
    updatedAt: "2026-10-30T09:00:00Z",
    notes: "Направлен дежурный инженер IT",
  },
  {
    id: "req-2",
    type: "CLEANING",
    title: "Влажная уборка после практической работы",
    description: "Лаборатория химии 103: необходимо протереть рабочие столы.",
    status: "PENDING",
    priority: "MEDIUM",
    creatorId: "usr-teach-2",
    roomId: "103",
    createdAt: "2026-10-30T10:15:00Z",
    updatedAt: "2026-10-30T10:15:00Z",
  },
  {
    id: "req-3",
    type: "MAINTENANCE",
    title: "Замена светодиодной лампы",
    description: "Кабинет 201: мигает центральный светильник над доской.",
    status: "COMPLETED",
    priority: "LOW",
    creatorId: "usr-teach-3",
    roomId: "201",
    createdAt: "2026-10-28T14:00:00Z",
    updatedAt: "2026-10-29T11:30:00Z",
    notes: "Лампа заменена завхозом",
  },
];

export const MOCK_RATINGS: TeacherRating[] = [
  {
    id: "rat-1",
    teacherId: "usr-teach-1",
    userId: "usr-stud-1",
    value: 5,
    comment: "Очень доступно объясняет начала математического анализа и стереометрию!",
    createdAt: "2026-10-29T15:00:00Z",
  },
  {
    id: "rat-2",
    teacherId: "usr-teach-2",
    userId: "usr-stud-2",
    value: 5,
    comment: "Лучшие лабораторные работы по оптике и механике в гимназии.",
    createdAt: "2026-10-28T16:30:00Z",
  },
  {
    id: "rat-3",
    teacherId: "usr-teach-3",
    userId: "usr-stud-3",
    value: 4,
    comment: "Строгий, но справедливый учитель. Отличные разборы сочинений.",
    createdAt: "2026-10-27T12:00:00Z",
  },
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann-1",
    title: "Торжественная линейка и День гимназиста",
    content: "В пятницу в центральном атриуме состоится ежегодная церемония посвящения и награждения победителей олимпиад.",
    category: "События",
    publishedAt: "2026-10-29T08:00:00Z",
    imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "ann-2",
    title: "Обновление рациона школьного питания",
    content: "Комбинат питания вводит расширенное меню с повышенным содержанием белков и фермерских продуктов.",
    category: "Питание",
    publishedAt: "2026-10-28T10:00:00Z",
  },
];

export const MOCK_SUBJECTS: Subject[] = [
  { id: "sub-1", name: "Математика", description: "Алгебра, геометрия и начала анализа", createdAt: "2026-09-01T08:00:00Z", updatedAt: "2026-09-01T08:00:00Z" },
  { id: "sub-2", name: "Русский язык", description: "Орфография, стилистика и культура речи", createdAt: "2026-09-01T08:00:00Z", updatedAt: "2026-09-01T08:00:00Z" },
  { id: "sub-3", name: "Физика", description: "Теоретическая и экспериментальная физика", createdAt: "2026-09-01T08:00:00Z", updatedAt: "2026-09-01T08:00:00Z" },
  { id: "sub-4", name: "История", description: "Отечественная и всеобщая история", createdAt: "2026-09-01T08:00:00Z", updatedAt: "2026-09-01T08:00:00Z" },
  { id: "sub-5", name: "Химия", description: "Неорганическая и органическая химия", createdAt: "2026-09-01T08:00:00Z", updatedAt: "2026-09-01T08:00:00Z" },
  { id: "sub-6", name: "Информатика", description: "Программирование Python и веб-технологии", createdAt: "2026-09-01T08:00:00Z", updatedAt: "2026-09-01T08:00:00Z" },
  { id: "sub-7", name: "Английский язык", description: "Углубленный курс и подготовка к международным экзаменам", createdAt: "2026-09-01T08:00:00Z", updatedAt: "2026-09-01T08:00:00Z" },
  { id: "sub-8", name: "Биология", description: "Общая биология, анатомия и генетика", createdAt: "2026-09-01T08:00:00Z", updatedAt: "2026-09-01T08:00:00Z" },
];

export const MOCK_SCHEDULES: Schedule[] = [
  {
    id: "sch-10a",
    groupId: "10-А",
    date: "2026-11-02",
    createdAt: "2026-11-01T10:00:00Z",
    updatedAt: "2026-11-01T10:00:00Z",
    lessons: [
      { id: "les-1", subject: "Математика", teacherId: "usr-teach-1", teacherName: "Елена Соколова", startTime: "09:00", endTime: "09:45", room: "305", floor: 3, hasHomework: true, homeworkDescription: "Параграф 14, № 120-125" },
      { id: "les-2", subject: "Русский язык", teacherId: "usr-teach-6", teacherName: "Анна Ковалева", startTime: "10:00", endTime: "10:45", room: "201", floor: 2, hasHomework: false },
      { id: "les-3", subject: "Физика", teacherId: "usr-teach-11", teacherName: "Дмитрий Смирнов", startTime: "11:00", endTime: "11:45", room: "102", floor: 1, hasHomework: true, homeworkDescription: "Подготовка к лабораторной" },
      { id: "les-4", subject: "Информатика", teacherId: "usr-teach-21", teacherName: "Иван Иванов", startTime: "12:45", endTime: "13:30", room: "501", floor: 5, hasHomework: false },
    ],
  },
  {
    id: "sch-11b",
    groupId: "11-Б",
    date: "2026-11-02",
    createdAt: "2026-11-01T10:00:00Z",
    updatedAt: "2026-11-01T10:00:00Z",
    lessons: [
      { id: "les-5", subject: "Алгебра", teacherId: "usr-teach-1", teacherName: "Елена Соколова", startTime: "09:00", endTime: "09:45", room: "306", floor: 3, hasHomework: true },
      { id: "les-6", subject: "Биология", teacherId: "usr-teach-12", teacherName: "Ирина Васильева", startTime: "10:00", endTime: "10:45", room: "205", floor: 2, hasHomework: false },
      { id: "les-7", subject: "Обществознание", teacherId: "usr-teach-7", teacherName: "Виктор Сидоров", startTime: "11:00", endTime: "11:45", room: "401", floor: 4, hasHomework: true },
    ],
  },
  {
    id: "sch-9a",
    groupId: "9-А",
    date: "2026-11-02",
    createdAt: "2026-11-01T10:00:00Z",
    updatedAt: "2026-11-01T10:00:00Z",
    lessons: [
      { id: "les-8", subject: "Химия", teacherId: "usr-teach-13", teacherName: "Константин Лебедев", startTime: "09:00", endTime: "09:45", room: "103", floor: 1, hasHomework: true },
      { id: "les-9", subject: "Геометрия", teacherId: "usr-teach-2", teacherName: "Михаил Виноградов", startTime: "10:00", endTime: "10:45", room: "305", floor: 3, hasHomework: false },
    ],
  },
  {
    id: "sch-10b",
    groupId: "10-Б",
    date: "2026-11-02",
    createdAt: "2026-11-01T10:00:00Z",
    updatedAt: "2026-11-01T10:00:00Z",
    lessons: [
      { id: "les-10", subject: "Физика", teacherId: "usr-teach-11", teacherName: "Дмитрий Смирнов", startTime: "09:00", endTime: "09:45", room: "102", floor: 1, hasHomework: false },
      { id: "les-11", subject: "Информатика", teacherId: "usr-teach-22", teacherName: "Глеб Николаев", startTime: "10:00", endTime: "10:45", room: "502", floor: 5, hasHomework: true },
    ],
  },
];

export const MOCK_STORIES: Story[] = [
  {
    id: "story-1",
    title: "30-я юбилейная конференция Модель ООН",
    description: "Торжественное мероприятие, посвященное 30-летию конференции в Гимназии Примакова.",
    imageUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80",
    linkUrl: "https://primakov.school/news/model-oon",
    linkText: "Подробнее о конференции",
    createdAt: "2026-11-01T10:00:00Z",
    expiresAt: "2026-11-08T10:00:00Z",
    viewedBy: ["usr-1", "usr-2", "usr-3"],
  },
  {
    id: "story-2",
    title: "Встреча с космонавтами Роскосмоса",
    description: "Уникальная встреча с представителями космической отрасли в нашем атриуме.",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
    linkUrl: "https://primakov.school/news/space-meeting",
    linkText: "Смотреть фотоотчет",
    createdAt: "2026-11-02T12:00:00Z",
    expiresAt: "2026-11-09T12:00:00Z",
    viewedBy: ["usr-1"],
  },
  {
    id: "story-3",
    title: "Хакатон Primakov Digital 2026",
    description: "Регистрация команд открыта! Успейте подать заявку до 10 ноября.",
    imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80",
    linkUrl: "https://primakov.school/hackathon",
    linkText: "Подать заявку",
    createdAt: "2026-11-03T09:00:00Z",
    expiresAt: "2026-11-10T09:00:00Z",
    viewedBy: [],
  },
];

export const MOCK_HOUSES_STANDINGS: HouseStanding[] = [
  { house: "NORTH", totalPoints: 1450, rank: 1 },
  { house: "WEST", totalPoints: 1380, rank: 2 },
  { house: "EAST", totalPoints: 1290, rank: 3 },
  { house: "SOUTH", totalPoints: 1210, rank: 4 },
];

export const MOCK_HOUSE_TRANSACTIONS: HouseTransaction[] = [
  {
    id: "tx-1",
    house: "NORTH",
    points: 50,
    category: "OLYMPIAD",
    reason: "1 место в региональном этапе ВсОШ по физике",
    awardedBy: "Елена Смирнова",
    createdAt: "2026-11-02T14:30:00Z",
  },
  {
    id: "tx-2",
    house: "WEST",
    points: 40,
    category: "SPORTS",
    reason: "Победа в первенстве гимназии по баскетболу",
    awardedBy: "Алексей Волков",
    createdAt: "2026-11-01T16:15:00Z",
  },
  {
    id: "tx-3",
    house: "EAST",
    points: 30,
    category: "CHARITY",
    reason: "Организация осенней благотворительной ярмарки",
    awardedBy: "Ольга Морозова",
    createdAt: "2026-10-31T11:00:00Z",
  },
];

export const MOCK_BOARDING_ROSTER: BoardingRosterItem[] = [
  {
    studentId: "student-b-1",
    studentName: "Даниил Смирнов",
    groupName: "11-Б",
    roomNumber: "304",
    status: "PRESENT",
    lastCheckInTime: "2026-11-02T21:05:00Z",
    hasActiveLeave: false,
  },
  {
    studentId: "student-b-2",
    studentName: "София Орлова",
    groupName: "10-А",
    roomNumber: "212",
    status: "PRESENT",
    lastCheckInTime: "2026-11-02T21:12:00Z",
    hasActiveLeave: false,
  },
  {
    studentId: "student-b-3",
    studentName: "Артем Кузнецов",
    groupName: "9-А",
    roomNumber: "108",
    status: "LATE",
    lastCheckInTime: "2026-11-02T21:40:00Z",
    hasActiveLeave: false,
  },
  {
    studentId: "student-b-4",
    studentName: "Екатерина Попова",
    groupName: "11-А",
    roomNumber: "306",
    status: "ABSENT",
    hasActiveLeave: true,
  },
];

export const MOCK_LEAVE_REQUESTS: WeekendLeaveRequest[] = [
  {
    id: "leave-1",
    studentId: "student-b-4",
    studentName: "Екатерина Попова (11-А)",
    departureDate: "2026-11-06T17:00:00Z",
    returnDate: "2026-11-08T20:00:00Z",
    transportType: "Родители",
    status: "APPROVED",
    guardianConfirmed: true,
    createdAt: "2026-11-02T15:00:00Z",
  },
  {
    id: "leave-2",
    studentId: "student-b-1",
    studentName: "Даниил Смирнов (11-Б)",
    departureDate: "2026-11-06T18:00:00Z",
    returnDate: "2026-11-08T21:00:00Z",
    transportType: "Шаттл кампуса",
    status: "PENDING",
    guardianConfirmed: true,
    createdAt: "2026-11-03T09:30:00Z",
  },
];
