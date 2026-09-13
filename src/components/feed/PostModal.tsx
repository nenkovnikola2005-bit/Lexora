import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { BookmarkIcon } from "../ui/icons/BookmarkIcon";
import { LikeIcon } from "../ui/icons/LikeIcon";
import { CommentItem } from "./CommentItem";
import type { Comment } from "../../models/Comment";
import type { Post } from "../../models/Post";
import type { User } from "../../models/User";
import type { CommentService } from "../../services/CommentService";
import { formatRelativeTime } from "../../utils/formatRelativeTime";
import { pluralizeSr } from "../../utils/pluralizeSr";
import "./PostModal.scss";

export interface PostModalProps {
  post: Post;
  currentUser: User;
  commentService: CommentService;
  onClose: () => void;
  onToggleLike: (postId: string) => void;
  onToggleSave: (postId: string) => void;
  onCommentAdded: (postId: string) => void;
}

// Popup prozor jedne objave: pun tekst, reakcije i komentari.
export function PostModal({
  post,
  currentUser,
  commentService,
  onClose,
  onToggleLike,
  onToggleSave,
  onCommentAdded,
}: PostModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setComments(commentService.listByPost(post.id));
  }, [commentService, post.id]);

  const isLiked = post.likedBy.includes(currentUser.id);
  const isSaved = post.savedBy.includes(currentUser.id);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;

    commentService.add(post.id, currentUser, trimmed);
    setDraft("");
    setComments(commentService.listByPost(post.id));
    onCommentAdded(post.id);
  };

  return (
    <Modal title="Objava" onClose={onClose}>
      <article className="post-modal">
        <header className="post-modal__header">
          <Avatar initials={post.authorInitials} size="md" />
          <div className="post-modal__author">
            <p className="post-modal__name">{post.authorName}</p>
            <p className="post-modal__headline">{post.authorHeadline}</p>
            <p className="post-modal__time">{formatRelativeTime(post.createdAt)}</p>
          </div>
        </header>

        <p className="post-modal__content">{post.content}</p>

        <div className="post-modal__actions">
          <button
            type="button"
            className={isLiked ? "post-modal__action post-modal__action--liked" : "post-modal__action"}
            aria-pressed={isLiked}
            onClick={() => onToggleLike(post.id)}
          >
            <LikeIcon filled={isLiked} />
            Sviđa mi se{post.likedBy.length > 0 ? ` (${post.likedBy.length})` : ""}
          </button>
          <button
            type="button"
            className={isSaved ? "post-modal__action post-modal__action--saved" : "post-modal__action"}
            aria-pressed={isSaved}
            onClick={() => onToggleSave(post.id)}
          >
            <BookmarkIcon filled={isSaved} />
            {isSaved ? "Sačuvano" : "Sačuvaj"}
          </button>
        </div>

        <section className="post-modal__comments">
          <h3 className="post-modal__comments-title">
            {comments.length} {pluralizeSr(comments.length, "komentar", "komentara", "komentara")}
          </h3>

          {comments.length === 0 ? (
            <p className="post-modal__comments-empty">Budite prvi koji će komentarisati.</p>
          ) : (
            <ul className="post-modal__comments-list">
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </ul>
          )}
        </section>

        <form className="post-modal__form" onSubmit={handleSubmit}>
          <Avatar initials={currentUser.avatarInitials} size="sm" />
          <input
            className="post-modal__input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Napišite komentar…"
            aria-label="Napišite komentar"
          />
          <Button type="submit" size="small" disabled={!draft.trim()}>
            Pošalji
          </Button>
        </form>
      </article>
    </Modal>
  );
}
