import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommentCardComponent } from './comment-card.component';
import { Comment, User } from '../../models/comment.model';
import { By } from '@angular/platform-browser';

describe('CommentCardComponent', () => {
  let component: CommentCardComponent;
  let fixture: ComponentFixture<CommentCardComponent>;

  const mockUser: User = {
    username: 'testuser',
    image: { png: 'avatar.png'}
  };

  const mockComment: Comment = {
    id: 1,
    content: 'This is a comment',
    createdAt: Date.now() - 1000 * 60 * 5, // 5 minutes ago
    score: 3,
    user: mockUser,
    replies: []
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentCardComponent], // standalone import
    }).compileComponents();

    fixture = TestBed.createComponent(CommentCardComponent);
    component = fixture.componentInstance;

    component.comment = mockComment;
    component.currentUser = mockUser;
    component.replyingToCommentId = null;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onEditClick', () => {
    it('should set isEditing to true and editContent to comment content', () => {
      component.onEditClick();
      expect(component.isEditing).toBe(true);
      expect(component.editContent).toBe(mockComment.content);
    });
  });

  describe('onUpdateClick', () => {
    it('should emit updateComment event with trimmed content and set isEditing to false', () => {
      component.editContent = '  updated content  ';
      jest.spyOn(component.updateComment, 'emit');

      component.onUpdateClick();

      expect(component.updateComment.emit).toHaveBeenCalledWith({
        commentId: mockComment.id,
        content: 'updated content'
      });
      expect(component.isEditing).toBe(false);
    });

    it('should NOT emit if editContent is empty or whitespace', () => {
      component.editContent = '   ';
      jest.spyOn(component.updateComment, 'emit');

      component.onUpdateClick();

      expect(component.updateComment.emit).not.toHaveBeenCalled();
      expect(component.isEditing).toBe(false);
    });
  });

  describe('onUpvote', () => {
    it('should emit upvote event with comment id', () => {
      jest.spyOn(component.upvote, 'emit');
      component.onUpvote();
      expect(component.upvote.emit).toHaveBeenCalledWith(mockComment.id);
    });
  });

  describe('onDownvote', () => {
    it('should emit downvote event with comment id', () => {
      jest.spyOn(component.downvote, 'emit');
      component.onDownvote();
      expect(component.downvote.emit).toHaveBeenCalledWith(mockComment.id);
    });
  });

  describe('onReplyClick', () => {
    it('should emit null if replyingToCommentId matches comment id', () => {
      component.replyingToCommentId = mockComment.id;
      jest.spyOn(component.replyClicked, 'emit');
      component.onReplyClick();
      expect(component.replyClicked.emit).toHaveBeenCalledWith(null);
    });

    it('should emit comment id if replyingToCommentId does not match comment id', () => {
      component.replyingToCommentId = null;
      jest.spyOn(component.replyClicked, 'emit');
      component.onReplyClick();
      expect(component.replyClicked.emit).toHaveBeenCalledWith(mockComment.id);
    });
  });

  describe('onSubmitReply', () => {
    beforeEach(() => {
      jest.spyOn(component.submitReplyEvent, 'emit');
      jest.spyOn(component.replyClicked, 'emit');
    });

    it('should emit submitReplyEvent and reset replyContent, then emit replyClicked(null)', () => {
      component.replyContent = ' A reply ';
      component.onSubmitReply();

      expect(component.submitReplyEvent.emit).toHaveBeenCalledWith({
        parentId: mockComment.id,
        content: 'A reply'
      });

      expect(component.replyContent).toBe('');
      expect(component.replyClicked.emit).toHaveBeenCalledWith(null);
    });

    it('should NOT emit if replyContent is empty or whitespace', () => {
      component.replyContent = '   ';
      component.onSubmitReply();

      expect(component.submitReplyEvent.emit).not.toHaveBeenCalled();
      expect(component.replyClicked.emit).not.toHaveBeenCalled();
    });
  });

  describe('resolveAvatar', () => {
    it('should return path with just the filename appended to assets/avatar/', () => {
      const path = 'some/fake/path/avatar.png';
      expect(component.resolveAvatar(path)).toBe('assets/avatar/avatar.png');
    });
  });

  describe('timeAgo', () => {
    it('should return seconds ago if less than 60 seconds', () => {
      component.comment.createdAt = Date.now() - 30 * 1000; // 30 seconds ago
      expect(component.timeAgo).toMatch(/\d+s ago/);
    });

    it('should return minutes ago if less than 60 minutes', () => {
      component.comment.createdAt = Date.now() - 5 * 60 * 1000; // 5 minutes ago
      expect(component.timeAgo).toMatch(/\d+m ago/);
    });

    it('should return hours ago if less than 24 hours', () => {
      component.comment.createdAt = Date.now() - 3 * 60 * 60 * 1000; // 3 hours ago
      expect(component.timeAgo).toMatch(/\d+h ago/);
    });

    it('should return days ago if more than 24 hours', () => {
      component.comment.createdAt = Date.now() - 5 * 24 * 60 * 60 * 1000; // 5 days ago
      expect(component.timeAgo).toMatch(/\d+d ago/);
    });

    it('should correctly parse string date for createdAt', () => {
      component.comment.createdAt = new Date(Date.now() - 120 * 1000).toISOString();
      expect(component.timeAgo).toMatch(/\d+m ago/);
    });
  });
});
