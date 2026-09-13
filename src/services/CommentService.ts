import { seedComments } from "../data/seedComments";
import type { Comment } from "../models/Comment";
import type { User } from "../models/User";
import { StorageService } from "./StorageService";

const COMMENTS_KEY = "lexora_comments";

export class CommentService {
  private storage: StorageService<Comment[]>;

  constructor() {
    this.storage = new StorageService<Comment[]>(COMMENTS_KEY);
  }

  seedIfEmpty(): void {
    const existing = this.storage.get();
    if (!existing || existing.length === 0) {
      this.storage.set(seedComments);
    }
  }

  listByPost(postId: string): Comment[] {
    const comments = this.storage.get() ?? [];
    return comments
      .filter((comment) => comment.postId === postId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  add(postId: string, author: User, content: string): Comment {
    const comments = this.storage.get() ?? [];
    const comment: Comment = {
      id: crypto.randomUUID(),
      postId,
      authorId: author.id,
      authorName: `${author.firstName} ${author.lastName}`,
      authorInitials: author.avatarInitials,
      content,
      createdAt: new Date().toISOString(),
    };
    comments.push(comment);
    this.storage.set(comments);
    return comment;
  }
}
