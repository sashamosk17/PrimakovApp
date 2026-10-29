import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email format').min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
  name: z.string().max(100, 'Name too long').optional(),
  group: z.string().max(50, 'Group too long').optional(),
  role: z.enum(['student', 'teacher', 'admin', 'STUDENT', 'TEACHER', 'ADMIN']).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
