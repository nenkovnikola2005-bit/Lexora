import { seedPosts } from "../data/seedPosts";
import type { Poll, Post, PostDocument, PostSort } from "../models/Post";
import { sortPosts } from "../models/Post";
import type { User } from "../models/User";
import { StorageService } from "./StorageService";

const POSTS_KEY = "lexora_posts";

export interface PostExtras {
  document?: PostDocument;
  poll?: Poll;
}

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

  create(author: User, content: string, extras?: PostExtras): Post {
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
      document: extras?.document,
      poll: extras?.poll,
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

  incrementCommentsCount(postId: string): void {
    const posts = this.storage.get() ?? [];
    const index = posts.findIndex((post) => post.id === postId);
    if (index === -1) return;
    posts[index] = { ...posts[index], commentsCount: posts[index].commentsCount + 1 };
    this.storage.set(posts);
  }

  getById(postId: string): Post | null {
    const posts = this.storage.get() ?? [];
    return posts.find((post) => post.id === postId) ?? null;
  }

  // Glasanje za opciju ankete. Klik na opciju za koju je korisnik već glasao
  // poništava glas; klik na drugu opciju prebacuje glas na nju.
  votePoll(postId: string, optionId: string, userId: string): void {
    const posts = this.storage.get() ?? [];
    const index = posts.findIndex((post) => post.id === postId);
    if (index === -1 || !posts[index].poll) return;

    const currentPoll = posts[index].poll!;
    const previousChoice = currentPoll.options.find((option) => option.votes.includes(userId));
    const options = currentPoll.options.map((option) => ({
      ...option,
      votes: option.votes.filter((id) => id !== userId),
    }));

    if (!previousChoice || previousChoice.id !== optionId) {
      const target = options.find((option) => option.id === optionId);
      if (target) target.votes = [...target.votes, userId];
    }

    posts[index] = { ...posts[index], poll: { ...currentPoll, options } };
    this.storage.set(posts);
  }
}
