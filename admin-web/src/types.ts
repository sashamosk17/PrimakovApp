export type Role = "STUDENT" | "TEACHER" | "ADMIN" | "SUPERADMIN";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
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
  userId: string;
  value: number;
  comment: string;
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

