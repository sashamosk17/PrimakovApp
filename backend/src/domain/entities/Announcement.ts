export interface Announcement {
  id: string;
  title: string;
  description: string;
  content?: string;
  imageUrl?: string;
  date: Date;
  category: "EVENT" | "NEWS" | "MAINTENANCE" | "IMPORTANT";
  createdAt: Date;
  authorId: string;
}
