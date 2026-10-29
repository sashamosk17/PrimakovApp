import { z } from 'zod';

export const createDeadlineSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  subject: z.string().max(100, 'Subject too long').optional(),
});

export type CreateDeadlineInput = z.infer<typeof createDeadlineSchema>;
