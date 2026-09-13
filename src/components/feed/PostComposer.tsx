import { useState } from "react";
import type { FormEvent } from "react";
import { Avatar } from "../ui/Avatar";
import { DocumentPostIcon } from "../ui/icons/DocumentPostIcon";
import { EventIcon } from "../ui/icons/EventIcon";
import { ImagePostIcon } from "../ui/icons/ImagePostIcon";
import { PollIcon } from "../ui/icons/PollIcon";
import type { User } from "../../models/User";
import { PostService } from "../../services/PostService";
import "./PostComposer.scss";

export interface PostComposerProps {
  user: User;
  postService: PostService;
  onPostCreated: () => void;
}

const INERT_TYPES = [
  { label: "Dokument", icon: <DocumentPostIcon /> },
  { label: "Anketa", icon: <PollIcon /> },
  { label: "Događaj", icon: <EventIcon /> },
];

// Polje za kreiranje nove objave na feed-u.
export function PostComposer({ user, postService, onPostCreated }: PostComposerProps) {
  const [content, setContent] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;

    postService.create(user, trimmed);
    setContent("");
    onPostCreated();
  };

  return (
    <form className="post-composer" onSubmit={handleSubmit}>
      <div className="post-composer__row">
        <Avatar initials={user.avatarInitials} size="md" />
        <textarea
          className="post-composer__input"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Podelite mišljenje o presudi, pitanje ili iskustvo iz prakse…"
          aria-label="Podelite mišljenje o presudi, pitanje ili iskustvo iz prakse…"
          rows={1}
        />
      </div>

      <div className="post-composer__types">
        <button
          type="submit"
          className="post-composer__type post-composer__type--active"
          disabled={!content.trim()}
        >
          <ImagePostIcon />
          Objava
        </button>
        {INERT_TYPES.map((type) => (
          <button
            type="button"
            key={type.label}
            className="post-composer__type"
            onClick={() => setNotice(type.label)}
          >
            {type.icon}
            {type.label}
          </button>
        ))}
      </div>

      {notice && (
        <p className="post-composer__notice" role="status">
          Objave tipa „{notice}” još uvek nisu dostupne.
        </p>
      )}
    </form>
  );
}
