import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Comment, User } from '../models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private dataUrl = './assets/data/data.json';

  constructor(private http: HttpClient) {}

  loadComments(): Observable<{ comments: Comment[], currentUser?: User }> {
  const localData = localStorage.getItem('comments');

  if (localData) {
  try {
    const parsed = JSON.parse(localData);
    const comments = Array.isArray(parsed) ? parsed : parsed.comments;
    
    if (Array.isArray(comments) && comments.length > 0) {
      console.log('[Service] Loaded from localStorage:', comments);
      return of({ comments });
    } else {
      console.warn('[Service] Empty localStorage. Fallback to JSON.');
    }
  } catch (e) {
    console.warn('[Service] Invalid localStorage. Fallback to JSON.');
  }
}


  return this.http.get<{ comments: Comment[], currentUser: User }>(this.dataUrl).pipe(
    tap(data => {
      console.log('[Service] Loaded from JSON:', data);
      localStorage.setItem('comments', JSON.stringify(data.comments));
    }),
    map(data => ({ comments: data.comments, currentUser: data.currentUser })),
    catchError(error => {
      console.error('[Service] Failed to load JSON', error);
      return of({ comments: [] });
    })
  );
}


  getCurrentUser(): Observable<User> {
    return this.http.get<{ currentUser: User }>(this.dataUrl).pipe(
      map(data => data.currentUser)
    );
  }
}
