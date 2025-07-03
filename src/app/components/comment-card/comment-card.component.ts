import {
  Component,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Comment, User } from '../../models/comment.model';

@Component({
  selector: 'app-comment-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comment-card.component.html',
  styleUrls: ['./comment-card.component.scss']
})
export class CommentCardComponent {
  @Input() comment!: Comment;
  @Input() currentUser!: User;
  @Input() replyingToCommentId!: number | null;

  @Output() upvote = new EventEmitter<number>();
  @Output() downvote = new EventEmitter<number>();
  @Output() replyClicked = new EventEmitter<number | null>();
  @Output() submitReplyEvent = new EventEmitter<{ parentId: number; content: string }>();
  @Output() updateComment = new EventEmitter<{ commentId: number; content: string }>();
  @Output() delete = new EventEmitter<number>();

  replyContent: string = '';
  isEditing: boolean = false;
  editContent: string = '';

  onEditClick() {
  this.isEditing = true;
  this.editContent = this.comment.content; 
  }

  onUpdateClick() {
  if (!this.editContent.trim()) return;

  this.updateComment.emit({
    commentId: this.comment.id,
    content: this.editContent.trim()
  });

  this.isEditing = false; 
}

  onUpvote() {
    this.upvote.emit(this.comment.id);
  }

  onDownvote() {
    this.downvote.emit(this.comment.id);
  }

  onReplyClick() {
  if (this.replyingToCommentId === this.comment.id) {
    this.replyClicked.emit(null);
  } else {
    this.replyClicked.emit(this.comment.id);
  }
}

  onSubmitReply() {
    const content = this.replyContent.trim();
    if (!content) return;

    this.submitReplyEvent.emit({
      parentId: this.comment.id,
      content: content
    });

    this.replyContent = '';
    this.replyClicked.emit(null); 
  }

  resolveAvatar(path: string): string {
    const fileName = path.split('/').pop();
    return `assets/avatar/${fileName}`;
  }

  get timeAgo(): string {
    const now = Date.now();
    const createdAt = typeof this.comment.createdAt === 'string'
      ? new Date(this.comment.createdAt).getTime()
      : this.comment.createdAt;

    const secondsAgo = Math.floor((now - createdAt) / 1000);
    if (secondsAgo < 60) return `${secondsAgo}s ago`;

    const minutes = Math.floor(secondsAgo / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }
}
