import { Avatar } from "../ui/Avatar";
import type { Comment } from "../../models/Comment";
import { formatRelativeTime } from "../../utils/formatRelativeTime";
import "./CommentItem.scss";

export interface CommentItemProps {
  comment: Comment;
}

// Prikazuje jedan komentar ispod objave: autora, tekst i vreme.
export function CommentItem({ comment }: CommentItemProps) {
  return (
    <li className="comment-item">
      <Avatar initials={comment.authorInitials} size="sm" />
      <div className="comment-item__body">
        <div className="comment-item__bubble">
          <p className="comment-item__author">{comment.authorName}</p>
          <p className="comment-item__content">{comment.content}</p>
        </div>
        <p className="comment-item__time">{formatRelativeTime(comment.createdAt)}</p>
      </div>
    </li>
  );
}
