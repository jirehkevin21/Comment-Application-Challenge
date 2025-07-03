import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { Store } from '@ngrx/store';
import { CommentService } from './services/comment.service';
import { of } from 'rxjs';
import { User, Comment } from './models/comment.model';
import * as commentActions from './store/actions/comment.action';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let storeDispatchSpy: jest.SpyInstance;
  let mockStore: any;
  let mockCommentService: any;

  const mockUser: User = {
    username: 'testuser',
    image: { png: 'avatar.png' }
  };

  const mockComments: Comment[] = [
    {
      id: 1,
      content: 'Test comment',
      createdAt: Date.now(),
      score: 5,
      user: mockUser,
      replies: []
    }
  ];

  beforeEach(async () => {
    mockStore = {
      select: jest.fn().mockReturnValue(of(mockComments)),
      dispatch: jest.fn()
    };

    mockCommentService = {
      getCurrentUser: jest.fn().mockReturnValue(of(mockUser))
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent], // standalone component import
      providers: [
        { provide: Store, useValue: mockStore },
        { provide: CommentService, useValue: mockCommentService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;

    storeDispatchSpy = jest.spyOn(mockStore, 'dispatch');
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch loadComments and set currentUser on ngOnInit', () => {
    component.ngOnInit();

    expect(storeDispatchSpy).toHaveBeenCalledWith(commentActions.loadComments());
    expect(component.currentUser).toEqual(mockUser);
  });

  it('should dispatch updateComment on onUpdateComment', () => {
    const updatePayload = { commentId: 1, content: 'Updated content' };
    component.onUpdateComment(updatePayload);

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      commentActions.updateComment({ commentId: 1, content: 'Updated content' })
    );
  });

  it('should toggle replyingToCommentId on onReplyToggle', () => {
    component.onReplyToggle(123);
    expect(component.replyingToCommentId).toBe(123);

    component.onReplyToggle(null);
    expect(component.replyingToCommentId).toBeNull();
  });

  it('should dispatch addReply and reset replyingToCommentId on onSubmitReply', () => {
    component.currentUser = mockUser;
    const replyContent = 'This is a reply';

    component.onSubmitReply({ parentId: 1, content: replyContent });

    expect(storeDispatchSpy).toHaveBeenCalled();
    const dispatchedArg = storeDispatchSpy.mock.calls[0][0];
    expect(dispatchedArg.parentId).toBe(1);
    expect(dispatchedArg.reply.content).toBe(replyContent);
    expect(component.replyingToCommentId).toBeNull();
  });

  it('should dispatch upvoteComment on onUpvote', () => {
    component.onUpvote(1);

    expect(storeDispatchSpy).toHaveBeenCalledWith(commentActions.upvoteComment({ commentId: 1 }));
  });

  it('should dispatch downvoteComment on onDownvote', () => {
    component.onDownvote(2);

    expect(storeDispatchSpy).toHaveBeenCalledWith(commentActions.downvoteComment({ commentId: 2 }));
  });

  it('should dispatch addComment and clear newCommentContent on submitComment', () => {
    component.currentUser = mockUser;
    component.newCommentContent = 'New comment';

    component.submitComment();

    expect(storeDispatchSpy).toHaveBeenCalled();
    const dispatchedArg = storeDispatchSpy.mock.calls[0][0];
    expect(dispatchedArg.comment.content).toBe('New comment');
    expect(component.newCommentContent).toBe('');
  });

  it('should NOT dispatch addComment if newCommentContent is empty on submitComment', () => {
    component.newCommentContent = '   ';

    component.submitComment();

    expect(storeDispatchSpy).not.toHaveBeenCalled();
  });

  it('should set deleteTarget on onDeleteClicked', () => {
    component.onDeleteClicked(5, true);

    expect(component.deleteTarget).toEqual({ id: 5, isReply: true });
  });

  it('should clear deleteTarget on cancelDelete', () => {
    component.deleteTarget = { id: 1, isReply: false };

    component.cancelDelete();

    expect(component.deleteTarget).toBeNull();
  });

  it('should dispatch deleteComment and clear deleteTarget on confirmDelete', () => {
    component.deleteTarget = { id: 7, isReply: false };

    component.confirmDelete();

    expect(storeDispatchSpy).toHaveBeenCalledWith(commentActions.deleteComment({ commentId: 7 }));
    expect(component.deleteTarget).toBeNull();
  });
});
