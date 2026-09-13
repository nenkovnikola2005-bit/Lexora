import { useMemo, useState } from "react";
import type { MouseEvent } from "react";
import { Avatar } from "../ui/Avatar";
import { BookmarkIcon } from "../ui/icons/BookmarkIcon";
import { CommentIcon } from "../ui/icons/CommentIcon";
import { GlobeIcon } from "../ui/icons/GlobeIcon";
import { LikeIcon } from "../ui/icons/LikeIcon";
import { SendIcon } from "../ui/icons/SendIcon";
import { ShareIcon } from "../ui/icons/ShareIcon";
import type { ConnectionStatus } from "../../models/Lawyer";
import type { Post } from "../../models/Post";
import type { NetworkService } from "../../services/NetworkService";
import { formatRelativeTime } from "../../utils/formatRelativeTime";
import { pluralizeSr } from "../../utils/pluralizeSr";
import "./PostCard.scss";

export interface PostCardProps {
  post: Post;
  currentUserId: string;
  networkService: NetworkService;
  onToggleLike: (postId: string) => void;
  onToggleSave: (postId: string) => void;
  onConnect: (authorId: string) => void;
  onOpenPost: (postId: string) => void;
}

const LEVEL_LABEL: Record<number, string> = { 1: "1. nivo", 2: "2. nivo", 3: "3. nivo" };

const CONNECT_LABEL: Record<ConnectionStatus, string> = {
  none: "+ Poveži se",
  "pending-outgoing": "Zahtev poslat",
  "pending-incoming": "Čeka odgovor",
  connected: "Povezani ste",
};

const CONTENT_PREVIEW_LIMIT = 260;

function resolveLikerName(
  lawyerId: string,
  currentUserId: string,
  networkService: NetworkService,
): string {
  if (lawyerId === currentUserId) return "Vi";
  const lawyer = networkService.getById(lawyerId);
  return lawyer ? `${lawyer.firstName} ${lawyer.lastName}` : "Nepoznat korisnik";
}

// Prikazuje jednu objavu iz feed-a: autora, sadržaj (skraćen ako je dugačak) i akcije.
export function PostCard({
  post,
  currentUserId,
  networkService,
  onToggleLike,
  onToggleSave,
  onConnect,
  onOpenPost,
}: PostCardProps) {
  const [shareNotice, setShareNotice] = useState<string | null>(null);

  const isLiked = post.likedBy.includes(currentUserId);
  const isSaved = post.savedBy.includes(currentUserId);
  const isOwnPost = post.authorId === currentUserId;

  const author = isOwnPost ? null : networkService.getById(post.authorId);
  const connectionStatus = author ? networkService.getConnectionStatus(post.authorId) : null;

  const isLong = post.content.length > CONTENT_PREVIEW_LIMIT;
  const previewContent = isLong
    ? `${post.content.slice(0, CONTENT_PREVIEW_LIMIT).trimEnd()}…`
    : post.content;

  const likerSummary = useMemo(() => {
    if (post.likedBy.length === 0) return null;
    const [firstId, ...rest] = post.likedBy;
    const firstName = resolveLikerName(firstId, currentUserId, networkService);
    if (rest.length === 0) return firstName;
    return `${firstName} i još ${rest.length} ${pluralizeSr(rest.length, "osoba", "osobe", "osoba")}`;
  }, [post.likedBy, currentUserId, networkService]);

  const handleInertAction = (event: MouseEvent, label: string) => {
    event.stopPropagation();
    setShareNotice(label);
  };

  return (
    <article className="post-card" onClick={() => onOpenPost(post.id)}>
      <header className="post-card__header">
        <Avatar initials={post.authorInitials} size="md" />
        <div className="post-card__author">
          <p className="post-card__name">
            {post.authorName}
            {author && <span className="post-card__level"> · {LEVEL_LABEL[author.connectionLevel]}</span>}
          </p>
          <p className="post-card__headline">{post.authorHeadline}</p>
          <p className="post-card__time">
            {formatRelativeTime(post.createdAt)}
            <span className="post-card__globe">
              <GlobeIcon />
            </span>
          </p>
        </div>
        {author && (
          <button
            type="button"
            className="post-card__connect"
            disabled={connectionStatus !== "none"}
            onClick={(event) => {
              event.stopPropagation();
              onConnect(post.authorId);
            }}
          >
            {CONNECT_LABEL[connectionStatus ?? "none"]}
          </button>
        )}
      </header>

      <p className="post-card__content">{previewContent}</p>

      {likerSummary && (
        <div className="post-card__reactions">
          <span className="post-card__reaction-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <p className="post-card__reaction-summary">{likerSummary}</p>
          <p className="post-card__reaction-count">
            {post.commentsCount} {pluralizeSr(post.commentsCount, "komentar", "komentara", "komentara")}
          </p>
        </div>
      )}

      <footer className="post-card__actions">
        <button
          type="button"
          className={isLiked ? "post-card__action post-card__action--liked" : "post-card__action"}
          aria-pressed={isLiked}
          onClick={(event) => {
            event.stopPropagation();
            onToggleLike(post.id);
          }}
        >
          <LikeIcon filled={isLiked} />
          Sviđa mi se
        </button>

        <button
          type="button"
          className="post-card__action"
          onClick={(event) => {
            event.stopPropagation();
            onOpenPost(post.id);
          }}
        >
          <CommentIcon />
          Komentar
        </button>

        <button type="button" className="post-card__action" onClick={(event) => handleInertAction(event, "Deljenje")}>
          <ShareIcon />
          Podeli
        </button>

        <button
          type="button"
          className={isSaved ? "post-card__action post-card__action--saved" : "post-card__action"}
          aria-pressed={isSaved}
          onClick={(event) => {
            event.stopPropagation();
            onToggleSave(post.id);
          }}
        >
          <BookmarkIcon filled={isSaved} />
          {isSaved ? "Sačuvano" : "Sačuvaj"}
        </button>

        <button type="button" className="post-card__action" onClick={(event) => handleInertAction(event, "Slanje u poruci")}>
          <SendIcon />
          Pošalji
        </button>
      </footer>

      {shareNotice && (
        <p className="post-card__inert-notice" role="status">
          {shareNotice} još uvek nije dostupno.
        </p>
      )}
    </article>
  );
}
