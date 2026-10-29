export interface Story {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt: Date;
  expiresAt: Date;
  viewedBy: string[];
  author: string;
  linkUrl?: string;
  linkText?: string;
}
