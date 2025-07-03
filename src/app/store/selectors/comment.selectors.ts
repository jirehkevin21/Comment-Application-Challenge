import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CommentState } from '../reducers/comments.reducers';

export const selectCommentFeature = createFeatureSelector<CommentState>('comments');

export const selectAllComments = createSelector(
  selectCommentFeature,
  (state: CommentState) => state.comments 
);
