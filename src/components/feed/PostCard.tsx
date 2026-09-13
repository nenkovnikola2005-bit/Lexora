import { Avatar } from "../ui/Avatar";
import type { Post } from "../../models/Post";
import { formatRelativeTime } from "../../utils/formatRelativeTime";
import { pluralizeSr } from "../../utils/pluralizeSr";
import "./PostCard.scss";

export interface PostCardProps {
  post: Post;
  currentUserId: string;
  onToggleLike: (postId: string) => void;
  onToggleSave: (postId: string) => void;
}

// Prikazuje jednu objavu iz feed-a: autora, sadržaj i akcije (lajk, čuvanje, komentari).
export function PostCard({ post, currentUserId, onToggleLike, onToggleSave }: PostCardProps) {
  const isLiked = post.likedBy.includes(currentUserId);
  const isSaved = post.savedBy.includes(currentUserId);

  return (
    <article className="post-card">
      <header className="post-card__header">
        <Avatar initials={post.authorInitials} size="md" />
        <div className="post-card__author">
          <p className="post-card__name">{post.authorName}</p>
          <p className="post-card__headline">{post.authorHeadline}</p>
          <p className="post-card__time">{formatRelativeTime(post.createdAt)}</p>
        </div>
      </header>

      <p className="post-card__content">{post.content}</p>

      <footer className="post-card__actions">
        <button
          type="button"
          className={
            isLiked ? "post-card__action post-card__action--liked" : "post-card__action"
          }
          aria-pressed={isLiked}
          onClick={() => onToggleLike(post.id)}
        >
          Sviđa mi se{post.likedBy.length > 0 ? ` (${post.likedBy.length})` : ""}
        </button>

        <span className="post-card__action post-card__action--static">
          {post.commentsCount} {pluralizeSr(post.commentsCount, "komentar", "komentara", "komentara")}
        </span>

        <button
          type="button"
          className={
            isSaved ? "post-card__action post-card__action--saved" : "post-card__action"
          }
          aria-pressed={isSaved}
          onClick={() => onToggleSave(post.id)}
        >
          {isSaved ? "Sačuvano" : "Sačuvaj"}
        </button>
      </footer>
    </article>
  );
}
