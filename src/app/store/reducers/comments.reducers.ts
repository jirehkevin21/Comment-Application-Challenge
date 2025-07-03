import { createReducer, on } from '@ngrx/store';
import * as CommentActions from '../actions/comment.action';
import { Comment } from '../../models/comment.model';

export interface CommentState {
  comments: Comment[];
}

const initialState: CommentState = {
  comments: []
};

function updateScoreRecursively(
  comments: Comment[],
  commentId: number,
  delta: number
): Comment[] {
  return comments.map(comment => {
    if (comment.id === commentId) {
      return { ...comment, score: comment.score + delta };
    }

    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: updateScoreRecursively(comment.replies, commentId, delta),
      };
    }

    return comment;
  });
}


function addReplyToThread(comments: Comment[], parentId: number, reply: Comment): Comment[] {
  return comments.map(comment => {
    if (comment.id === parentId) {
      return {
        ...comment,
        replies: [...(comment.replies ?? []), reply]
      };
    } else if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: addReplyToThread(comment.replies, parentId, reply)
      };
    }
    return comment; 
  });
}


function updateCommentContent(comments: Comment[], commentId: number, content: string): Comment[] {
  return comments.map(comment => {
    if (comment.id === commentId) {
      return { ...comment, content };
    }

    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: updateCommentContent(comment.replies, commentId, content)
      };
    }

    return comment;
  });
}

function deleteCommentRecursive(comments: Comment[], commentId: number): Comment[] {
  return comments
    .filter(c => c.id !== commentId)
    .map(c => ({
      ...c,
      replies: c.replies ? deleteCommentRecursive(c.replies, commentId) : []
    }));
}



export const commentReducer = createReducer(
  initialState,

  

  on(CommentActions.loadCommentsSuccess, (state, { comments }) => ({
    ...state,
    comments: [...comments] 
  })),

  on(CommentActions.updateCommentScore, (state, { id, score }) => ({
    ...state,
    comments: state.comments.map(c =>
      c.id === id ? { ...c, score } : c
    )
  })),

  on(CommentActions.addComment, (state, { comment }) => ({
    ...state,
    comments: [...state.comments, comment]
  })),

  on(CommentActions.updateComment, (state, { commentId, content }) => ({
  ...state,
  comments: updateCommentContent(state.comments, commentId, content)
})),

  on(CommentActions.deleteComment, (state, { commentId }) => ({
  ...state,
  comments: deleteCommentRecursive(state.comments, commentId)
})),

  on(CommentActions.upvoteComment, (state, { commentId }) => ({
  ...state,
  comments: updateScoreRecursively(state.comments, commentId, 1)
})),

on(CommentActions.downvoteComment, (state, { commentId }) => ({
  ...state,
  comments: updateScoreRecursively(state.comments, commentId, -1)
})),

  on(CommentActions.addReply, (state, { parentId, reply }) => {
  console.log('Reducer - adding reply to parentId:', parentId);
  return {
    ...state,
    comments: addReplyToThread(state.comments, parentId, reply)
  };
})
);
