// app.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Comment, User } from './models/comment.model';
import { selectAllComments } from './store/selectors/comment.selectors';
import {
  loadComments,
  upvoteComment,
  downvoteComment,
  addComment,
  addReply,
  updateComment
} from './store/actions/comment.action';
import { CommonModule } from '@angular/common';
import { CommentCardComponent } from './components/comment-card/comment-card.component';
import { CommentService } from './services/comment.service';
import { FormsModule } from '@angular/forms';
import { deleteComment } from './store/actions/comment.action';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, CommentCardComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  replyingToCommentId: number | null = null;
  private store = inject(Store);
  private commentService = inject(CommentService);

  newCommentContent: string = '';
  comments$: Observable<Comment[]> = this.store.select(selectAllComments);

  currentUser!: User;

  commentIdToDelete: number | null = null;
  deleteTarget: { id: number, isReply: boolean } | null = null;

 ngOnInit() {
  console.log('[AppComponent] Dispatching loadComments');
  this.store.dispatch(loadComments());

  this.commentService.getCurrentUser().subscribe(user => {
    this.currentUser = user;
  });

  this.comments$.subscribe(comments => {
    console.log('[AppComponent] Comments from store:', comments);
  });
}

onUpdateComment(event: { commentId: number; content: string }) {
  this.store.dispatch(updateComment({ commentId: event.commentId, content: event.content }));
  this.saveToLocalStorage(); 
}


onReplyToggle(commentId: number | null) {
  this.replyingToCommentId = commentId;
}



onSubmitReply(event: { parentId: number; content: string }) {
  const reply: Comment = {
    id: Date.now(),
    content: event.content,
    createdAt: Date.now(),
    score: 0,
    user: this.currentUser,
    replyingTo: this.getReplyingToUsername(event.parentId),
    replies: []
  };

  this.store.dispatch(addReply({ parentId: event.parentId, reply }));
  this.replyingToCommentId = null;
}

addReplyToThread(comments: Comment[], parentId: number, reply: Comment): Comment[] {
  return comments.map(comment => {
    if (comment.id === parentId) {
      return {
        ...comment,
        replies: [...(comment.replies ?? []), reply]
      };
    }

    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: this.addReplyToThread(comment.replies, parentId, reply)
      };
    }

    return comment;
  });
}


getReplyingToUsername(parentId: number): string | undefined {
  let user: string | undefined;
  this.comments$.pipe(take(1)).subscribe(comments => {
    const findUser = (comments: Comment[]): string | undefined => {
  for (let c of comments) {
    if (c.id === parentId) return c.user.username;
    if (c.replies) {
      const u = findUser(c.replies);
      if (u) return u;
    }
  }
  return undefined; 
};
    user = findUser(comments);
  });
  return user;
}


  onUpvote(commentId: number) {
    this.store.dispatch(upvoteComment({ commentId }));
    this.saveToLocalStorage();
  }

  onDownvote(commentId: number) {
    this.store.dispatch(downvoteComment({ commentId }));
    this.saveToLocalStorage();
  }

  submitComment() {
    if (!this.newCommentContent.trim()) return;

    const newComment: Comment = {
      id: Date.now(),
      content: this.newCommentContent.trim(),
      createdAt: Date.now(),
      score: 0,
      user: this.currentUser,
      replies: [],
    };

    this.store.dispatch(addComment({ comment: newComment }));
    this.newCommentContent = '';
    this.saveToLocalStorage();
  }

  saveToLocalStorage() {
  this.comments$.pipe(take(1)).subscribe(comments => {
    localStorage.setItem('comments', JSON.stringify(comments));
  });
}

flattenReplies(replies: Comment[]): Comment[] {
  const flat: Comment[] = [];

  const recurse = (list: Comment[]) => {
    for (let item of list) {
      flat.push(item);
      if (item.replies?.length) {
        recurse(item.replies);
      }
    }
  };

  recurse(replies);
  return flat;
}

onDeleteClicked(id: number, isReply = false) {
  this.deleteTarget = { id, isReply };
}

cancelDelete() {
  this.deleteTarget = null;
}

confirmDelete() {
  if (!this.deleteTarget) return;

  const { id } = this.deleteTarget;

  this.store.dispatch(deleteComment({ commentId: id }));
  this.saveToLocalStorage();

  this.deleteTarget = null;
}

  
}
