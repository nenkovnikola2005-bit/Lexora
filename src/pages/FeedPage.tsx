import { useEffect, useMemo, useState } from "react";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { PostCard } from "../components/feed/PostCard";
import { PostComposer } from "../components/feed/PostComposer";
import { useAuth } from "../context/AuthContext";
import { NetworkService } from "../services/NetworkService";
import { PostService } from "../services/PostService";
import type { Post, PostSort } from "../models/Post";
import { fullName } from "../models/User";
import "./FeedPage.scss";

const LEGAL_NEWS = [
  {
    id: "news-1",
    title: "Izmene Zakona o parničnom postupku stupaju na snagu 1. oktobra",
    source: "Tanjug",
  },
  {
    id: "news-2",
    title: "Komora advokata Srbije najavila portal za elektronsko podnošenje",
    source: "Advokatska komora Srbije",
  },
  {
    id: "news-3",
    title: "Novi pravilnik o elektronskom dostavljanju sudskih pismena",
    source: "Blic Biznis",
  },
];

export function FeedPage() {
  const { user } = useAuth();
  const postService = useMemo(() => new PostService(), []);
  const networkService = useMemo(() => new NetworkService(), []);

  const [posts, setPosts] = useState<Post[]>([]);
  const [sort, setSort] = useState<PostSort>("novo");
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  useEffect(() => {
    postService.seedIfEmpty();
    networkService.seedIfEmpty();
    setPosts(postService.list(sort));
  }, [postService, networkService, sort]);

  if (!user) {
    return null;
  }

  const refreshPosts = () => setPosts(postService.list(sort));

  const handleToggleLike = (postId: string) => {
    postService.toggleLike(postId, user.id);
    refreshPosts();
  };

  const handleToggleSave = (postId: string) => {
    postService.toggleSave(postId, user.id);
    refreshPosts();
  };

  const visiblePosts = showSavedOnly
    ? posts.filter((post) => post.savedBy.includes(user.id))
    : posts;

  const myPostsCount = postService.byAuthor(user.id).length;
  const connectionsCount = networkService.connectedCount();

  return (
    <div className="feed-page">
      <aside className="feed-page__column feed-page__column--left">
        <div className="feed-page__card feed-page__profile-card">
          <Avatar initials={user.avatarInitials} size="lg" />
          <p className="feed-page__profile-name">{fullName(user)}</p>
          <p className="feed-page__profile-headline">{user.headline}</p>
          <dl className="feed-page__profile-stats">
            <div className="feed-page__profile-stat">
              <dt>Veze</dt>
              <dd>{connectionsCount}</dd>
            </div>
            <div className="feed-page__profile-stat">
              <dt>Objave</dt>
              <dd>{myPostsCount}</dd>
            </div>
          </dl>
        </div>

        <button
          type="button"
          className={
            showSavedOnly
              ? "feed-page__card feed-page__sidebar-link feed-page__sidebar-link--active"
              : "feed-page__card feed-page__sidebar-link"
          }
          onClick={() => setShowSavedOnly((value) => !value)}
        >
          Sačuvane objave
        </button>

        <div className="feed-page__card feed-page__placeholder-card">
          <p className="feed-page__card-title">Moje grupe</p>
          <p className="feed-page__card-text">Uskoro dostupno.</p>
        </div>
      </aside>

      <section className="feed-page__column feed-page__column--center">
        <PostComposer user={user} postService={postService} onPostCreated={refreshPosts} />

        <div className="feed-page__toolbar">
          {showSavedOnly ? (
            <>
              <p className="feed-page__toolbar-title">Sačuvane objave</p>
              <button
                type="button"
                className="feed-page__toolbar-reset"
                onClick={() => setShowSavedOnly(false)}
              >
                Nazad na sve objave
              </button>
            </>
          ) : (
            <div className="feed-page__sort-toggle" role="radiogroup" aria-label="Sortiranje objava">
              <button
                type="button"
                className={
                  sort === "novo"
                    ? "feed-page__sort-btn feed-page__sort-btn--active"
                    : "feed-page__sort-btn"
                }
                aria-pressed={sort === "novo"}
                onClick={() => setSort("novo")}
              >
                Najnovije
              </button>
              <button
                type="button"
                className={
                  sort === "popularno"
                    ? "feed-page__sort-btn feed-page__sort-btn--active"
                    : "feed-page__sort-btn"
                }
                aria-pressed={sort === "popularno"}
                onClick={() => setSort("popularno")}
              >
                Najpopularnije
              </button>
            </div>
          )}
        </div>

        {visiblePosts.length === 0 ? (
          <p className="feed-page__empty">
            {showSavedOnly
              ? "Još uvek niste sačuvali nijednu objavu."
              : "Trenutno nema objava."}
          </p>
        ) : (
          <div className="feed-page__posts">
            {visiblePosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={user.id}
                onToggleLike={handleToggleLike}
                onToggleSave={handleToggleSave}
              />
            ))}
          </div>
        )}
      </section>

      <aside className="feed-page__column feed-page__column--right">
        <div className="feed-page__card feed-page__news-card">
          <p className="feed-page__card-title">Pravne vesti</p>
          <ul className="feed-page__news-list">
            {LEGAL_NEWS.map((item) => (
              <li key={item.id} className="feed-page__news-item">
                <p className="feed-page__news-item-title">{item.title}</p>
                <p className="feed-page__news-item-source">{item.source}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="feed-page__card feed-page__pro-card">
          <p className="feed-page__card-title">Lexora Pro</p>
          <p className="feed-page__card-text">
            Izdvojte se u pretrazi, vidite ko je posetio vaš profil i otključajte napredne
            filtere mreže.
          </p>
          <Button variant="secondary" size="small">
            Nadogradi na Pro
          </Button>
        </div>
      </aside>
    </div>
  );
}
