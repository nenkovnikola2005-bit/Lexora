import { seedPosts } from "../data/seedPosts";
import type { Post, PostSort } from "../models/Post";
import { sortPosts } from "../models/Post";
import type { User } from "../models/User";
import { StorageService } from "./StorageService";

const POSTS_KEY = "lexora_posts";

export class PostService {
  private storage: StorageService<Post[]>;

  constructor() {
    this.storage = new StorageService<Post[]>(POSTS_KEY);
  }

  seedIfEmpty(): void {
    const existing = this.storage.get();
    if (!existing || existing.length === 0) {
      this.storage.set(seedPosts);
    }
  }

  list(sort: PostSort = "novo"): Post[] {
    const posts = this.storage.get() ?? [];
    return sortPosts(posts, sort);
  }

  byAuthor(authorId: string): Post[] {
    const posts = this.storage.get() ?? [];
    return posts.filter((post) => post.authorId === authorId);
  }

  create(author: User, content: string): Post {
    const posts = this.storage.get() ?? [];
    const post: Post = {
      id: crypto.randomUUID(),
      authorId: author.id,
      authorName: `${author.firstName} ${author.lastName}`,
      authorHeadline: author.headline,
      authorInitials: author.avatarInitials,
      content,
      createdAt: new Date().toISOString(),
      likedBy: [],
      savedBy: [],
      commentsCount: 0,
    };
    posts.unshift(post);
    this.storage.set(posts);
    return post;
  }

  toggleLike(postId: string, userId: string): void {
    const posts = this.storage.get() ?? [];
    const index = posts.findIndex((post) => post.id === postId);
    if (index === -1) return;
    const post = posts[index];
    const isLiked = post.likedBy.includes(userId);
    post.likedBy = isLiked
      ? post.likedBy.filter((id) => id !== userId)
      : [...post.likedBy, userId];
    posts[index] = post;
    this.storage.set(posts);
  }

  toggleSave(postId: string, userId: string): void {
    const posts = this.storage.get() ?? [];
    const index = posts.findIndex((post) => post.id === postId);
    if (index === -1) return;
    const post = posts[index];
    const isSaved = post.savedBy.includes(userId);
    post.savedBy = isSaved
      ? post.savedBy.filter((id) => id !== userId)
      : [...post.savedBy, userId];
    posts[index] = post;
    this.storage.set(posts);
  }
}
