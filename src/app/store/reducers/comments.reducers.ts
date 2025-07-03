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

function sortCommentsByScoreAndReplies(comments: Comment[]): Comment[] {
  return comments
    .slice()
    .sort((a, b) => b.score - a.score) 
    .map(comment => ({
      ...comment,
      replies: comment.replies
        ? [...comment.replies].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        : []
    }));
}



function sortRepliesByDate(replies: Comment[]): Comment[] {
  return [...replies]
    .sort((a, b) => {
      const aTime = typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : a.createdAt;
      const bTime = typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : b.createdAt;
      return aTime - bTime; 
    })
    .map(reply => ({
      ...reply,
      replies: sortRepliesByDate(reply.replies ?? []) 
    }));
}

function sortByScore(comments: Comment[]): Comment[] {
  return comments
    .slice()
    .sort((a, b) => b.score - a.score);
}

export const commentReducer = createReducer(
  initialState,

  on(CommentActions.loadCommentsSuccess, (state, { comments }) => ({
  ...state,
  comments: sortCommentsByScoreAndReplies(comments)
})),


 on(CommentActions.addComment, (state, { comment }) => {
  const updatedComments = [...state.comments, comment];
  const sortedComments = sortByScore(updatedComments);
  return {
    ...state,
    comments: sortedComments
  };
}),
  on(CommentActions.updateCommentScore, (state, { id, score }) => ({
    ...state,
    comments: state.comments.map(c =>
      c.id === id ? { ...c, score } : c
    )
  })),

  on(CommentActions.addComment, (state, { comment }) => ({
  ...state,
  comments: sortByScore([...state.comments, comment])
})),

  on(CommentActions.updateComment, (state, { commentId, content }) => ({
  ...state,
  comments: updateCommentContent(state.comments, commentId, content)
})),

  on(CommentActions.deleteComment, (state, { commentId }) => ({
  ...state,
  comments: deleteCommentRecursive(state.comments, commentId)
})),

 on(CommentActions.upvoteComment, (state, { commentId }) => {
  const updated = updateScoreRecursively(state.comments, commentId, 1);
  return {
    ...state,
    comments: sortByScore(updated)
  };
}),

on(CommentActions.downvoteComment, (state, { commentId }) => {
  const updated = updateScoreRecursively(state.comments, commentId, -1);
  return {
    ...state,
    comments: sortByScore(updated)
  };
}),

  on(CommentActions.addReply, (state, { parentId, reply }) => {
  console.log('ReducerId:', parentId);
  return {
    ...state,
    comments: addReplyToThread(state.comments, parentId, reply)
  };
})
);
