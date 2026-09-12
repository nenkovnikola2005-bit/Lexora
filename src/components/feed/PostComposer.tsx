import { useState } from "react";
import type { FormEvent } from "react";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import type { User } from "../../models/User";
import { PostService } from "../../services/PostService";
import "./PostComposer.scss";

export interface PostComposerProps {
  user: User;
  postService: PostService;
  onPostCreated: () => void;
}

// Polje za kreiranje nove objave na feed-u.
export function PostComposer({ user, postService, onPostCreated }: PostComposerProps) {
  const [content, setContent] = useState("");

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
      <Avatar initials={user.avatarInitials} size="md" />
      <div className="post-composer__body">
        <textarea
          className="post-composer__input"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="O čemu razmišljate, kolega?"
          rows={3}
        />
        <div className="post-composer__actions">
          <Button type="submit" size="small" disabled={!content.trim()}>
            Objavi
          </Button>
        </div>
      </div>
    </form>
  );
}
