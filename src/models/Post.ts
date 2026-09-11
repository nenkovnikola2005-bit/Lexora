export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorHeadline: string;
  authorInitials: string;
  content: string;
  createdAt: string;
  likedBy: string[];
  savedBy: string[];
  commentsCount: number;
}

export type PostSort = "novo" | "popularno";

export function sortPosts(posts: Post[], sort: PostSort): Post[] {
  const copy = [...posts];
  if (sort === "popularno") {
    return copy.sort((a, b) => {
      const scoreA = a.likedBy.length + a.commentsCount;
      const scoreB = b.likedBy.length + b.commentsCount;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
  return copy.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
