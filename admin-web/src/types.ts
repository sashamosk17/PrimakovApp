export type Role = "STUDENT" | "TEACHER" | "ADMIN" | "SUPERADMIN";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  avatarUrl?: string;
  groupName?: string;
  birthDate?: string;
  phone?: string;
  telegram?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LessonProfileDTO {
  id: string;
  subject: string;
  teacherId: string;
  teacherName?: string;
  startTime: string;
  endTime: string;
  room: string;
  floor: number;
  hasHomework: boolean;
  homeworkDescription?: string;
}

export interface UserProfileDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  avatarUrl?: string;
  groupName?: string;
  birthDate?: string;
  phone?: string;
  telegram?: string;
  vkId?: string;
  createdAt: string;
  updatedAt: string;
  todayLessons: LessonProfileDTO[];
}

export interface DashboardMetrics {
  totalStudents: number;
  totalTeachers: number;
  totalAdmins: number;
  activeRequests: number;
  csiIndex: number;
  attendanceRate: number;
}

export interface ActivityPoint {
  day: string;
  count: number;
}

export interface ServiceRequest {
  id: string;
  type: "IT" | "MAINTENANCE" | "CLEANING";
  title: string;
  description: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  creatorId: string;
  assigneeId?: string;
  roomId?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface TeacherRating {
  id: string;
  teacherId: string;
  teacherName?: string;
  userId: string;
  userName?: string;
  value: number;
  comment: string;
  status?: "APPROVED" | "HIDDEN" | "PENDING";
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  publishedAt: string;
  imageUrl?: string;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherAssignment {
  teacherId: string;
  subjectId: string;
  createdAt: string;
  teacherName?: string;
  subjectName?: string;
}

export type LessonType = "CLASS" | "SUBGROUP" | "PROFILE" | "INDIVIDUAL";

export interface Lesson {
  id: string;
  subject: string;
  teacherId: string;
  teacherName?: string;
  startTime: string;
  endTime: string;
  room: string;
  floor?: number;
  building?: string;
  hasHomework?: boolean;
  homeworkDescription?: string;
  lessonType?: LessonType;
  subgroupName?: string;
  studentId?: string;
  studentName?: string;
}

export interface Schedule {
  id: string;
  groupId: string;
  date: string;
  lessons: Lesson[];
  createdAt: string;
  updatedAt: string;
}

export type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

export interface CanteenMenuItem {
  id: string;
  menuId: string;
  name: string;
  description?: string;
  category?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  weight?: number;
  price?: number;
  imageUrl?: string;
  isVegetarian: boolean;
  isVegan: boolean;
  allergens?: string[];
  displayOrder: number;
  createdAt?: string;
}

export interface CanteenMenu {
  id: string;
  date: string;
  mealType: MealType;
  isActive: boolean;
  items: CanteenMenuItem[];
  createdAt?: string;
  updatedAt?: string;
}
