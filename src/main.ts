import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

import { provideHttpClient } from '@angular/common/http';
import { provideStore, MetaReducer } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { localStorageSync } from 'ngrx-store-localstorage';

import { commentReducer } from './app/store/reducers/comments.reducers';
import { CommentsEffects } from './app/store/effects/comment.effects';


export function localStorageSyncReducer(reducer: any): any {
  return localStorageSync({ keys: ['comments'], rehydrate: true })(reducer);
}

const metaReducers: MetaReducer[] = [localStorageSyncReducer];

bootstrapApplication(AppComponent, {
  providers: [
    provideStore({ comments: commentReducer }, { metaReducers }),
    provideHttpClient(),
    provideEffects([CommentsEffects]),
  ],
}).catch(err => console.error(err));
