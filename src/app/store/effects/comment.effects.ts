import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as CommentsActions from './../actions/comment.action';
import { CommentService } from '../../services/comment.service';

@Injectable()
export class CommentsEffects {
  private actions$ = inject(Actions);
  private commentService = inject(CommentService);

  loadComments$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CommentsActions.loadComments),
      tap(() => console.log('[Effect] loadComments triggered')),
      switchMap(() => 
        this.commentService.loadComments().pipe(
          map(({ comments }) => CommentsActions.loadCommentsSuccess({ comments })),
          catchError(error => of(CommentsActions.loadCommentsFailure({ error })))
        )
      )
    )
  );
}

