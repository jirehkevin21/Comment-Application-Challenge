import { Comment, User } from './comment.model';

export interface CommentData {
  currentUser: User;
  comments: Comment[];
}
