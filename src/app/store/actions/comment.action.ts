import { createAction, props } from '@ngrx/store';
import { Comment } from '../../models/comment.model';

export const loadComments = createAction('[Comments] Load Comments');

export const loadCommentsSuccess = createAction(
  '[Comments] Load Comments Success',
  props<{ comments: Comment[] }>()
);

export const updateCommentScore = createAction(
  '[Comments] Update Comment Score',
  props<{ id: number; score: number }>()
);


export const loadCommentsFailure = createAction(
  '[Comment] Load Comments Failure',
  props<{ error: any }>()
);

export const addComment = createAction(
  '[Comment] Add Comment',
  props<{ comment: Comment }>()
);

export const updateComment = createAction(
  '[Comment] Update Comment',
  props<{ commentId: number; content: string }>()
);

export const deleteComment = createAction(
  '[Comment] Delete Comment',
  props<{ commentId: number }>()
);

export const upvoteComment = createAction(
  '[Comment] Upvote Comment',
  props<{ commentId: number }>()
);

export const downvoteComment = createAction(
  '[Comment] Downvote Comment',
  props<{ commentId: number }>()
);

export const addReply = createAction(
  '[Comment] Add Reply',
  props<{ parentId: number; reply: Comment }>()
);
