export interface User {
  username: string;
  image: { png: string };
}

export interface Comment {
  id: number;
  content: string;
  createdAt: number | string;
  score: number;
  user: User;
  replyingTo?: string;
  replies?: Comment[]; 
}
