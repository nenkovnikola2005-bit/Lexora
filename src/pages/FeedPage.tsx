import { useEffect, useMemo, useState } from "react";
import { Avatar } from "../components/ui/Avatar";
import { BookmarkIcon } from "../components/ui/icons/BookmarkIcon";
import { GroupItem } from "../components/feed/GroupItem";
import { PostCard } from "../components/feed/PostCard";
import { PostComposer } from "../components/feed/PostComposer";
import { PostModal } from "../components/feed/PostModal";
import { SendPostModal } from "../components/feed/SendPostModal";
import { SuggestionCard } from "../components/feed/SuggestionCard";
import { useAuth } from "../context/AuthContext";
import { CommentService } from "../services/CommentService";
import type { GroupWithMembership } from "../services/GroupService";
import { GroupService } from "../services/GroupService";
import { MessageService } from "../services/MessageService";
import { NetworkService } from "../services/NetworkService";
import { PostService } from "../services/PostService";
import type { LawyerProfile } from "../models/Lawyer";
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

const SUGGESTIONS_LIMIT = 3;

export function FeedPage() {
  const { user } = useAuth();
  const postService = useMemo(() => new PostService(), []);
  const networkService = useMemo(() => new NetworkService(), []);
  const commentService = useMemo(() => new CommentService(), []);
  const messageService = useMemo(() => new MessageService(), []);
  const groupService = useMemo(() => new GroupService(), []);

  const [posts, setPosts] = useState<Post[]>([]);
  const [sort, setSort] = useState<PostSort>("novo");
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [suggestions, setSuggestions] = useState<LawyerProfile[]>([]);
  const [groups, setGroups] = useState<GroupWithMembership[]>([]);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [sendPostId, setSendPostId] = useState<string | null>(null);

  const refreshSuggestions = () => {
    if (!user) return;
    const notConnected = networkService
      .getDirectory(undefined, user.id)
      .filter((lawyer) => networkService.getConnectionStatus(lawyer.id, user.id) === "none");
    setSuggestions(notConnected.slice(0, SUGGESTIONS_LIMIT));
  };

  const refreshGroups = () => setGroups(groupService.list());

  useEffect(() => {
    postService.seedIfEmpty();
    networkService.seedIfEmpty(user?.id);
    commentService.seedIfEmpty();
    messageService.seedIfEmpty();
    groupService.seedIfEmpty();
    setPosts(postService.list(sort));
    refreshSuggestions();
    refreshGroups();
  }, [postService, networkService, commentService, messageService, groupService, sort, user?.id]);

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

  const handleConnect = (lawyerId: string) => {
    networkService.sendRequest(lawyerId, user.id);
    refreshPosts();
    refreshSuggestions();
  };

  const handleCommentAdded = (postId: string) => {
    postService.incrementCommentsCount(postId);
    refreshPosts();
  };

  const handleVotePoll = (postId: string, optionId: string) => {
    postService.votePoll(postId, optionId, user.id);
    refreshPosts();
  };

  const handleToggleJoinGroup = (groupId: string) => {
    groupService.toggleJoin(groupId);
    refreshGroups();
  };

  const visiblePosts = showSavedOnly
    ? posts.filter((post) => post.savedBy.includes(user.id))
    : posts;

  const myPostsCount = postService.byAuthor(user.id).length;
  const connectionsCount = networkService.connectedCount(user.id);
  const activePost = activePostId ? posts.find((post) => post.id === activePostId) ?? null : null;
  const sendPost = sendPostId ? posts.find((post) => post.id === sendPostId) ?? null : null;

  return (
    <div className="feed-page">
      <aside className="feed-page__column feed-page__column--left">
        <div className="feed-page__identity-card">
          <div className="feed-page__identity-cover" />
          <div className="feed-page__identity-avatar">
            <Avatar initials={user.avatarInitials} size="lg" />
          </div>
          <div className="feed-page__identity-body">
            <p className="feed-page__identity-name">{fullName(user)}</p>
            <p className="feed-page__identity-headline">{user.headline}</p>
          </div>
          <dl className="feed-page__identity-stats">
            <div className="feed-page__identity-stat">
              <dt>Veze</dt>
              <dd>{connectionsCount}</dd>
            </div>
            <div className="feed-page__identity-stat">
              <dt>Objave</dt>
              <dd>{myPostsCount}</dd>
            </div>
          </dl>
          <button
            type="button"
            className={
              showSavedOnly
                ? "feed-page__identity-saved feed-page__identity-saved--active"
                : "feed-page__identity-saved"
            }
            onClick={() => setShowSavedOnly((value) => !value)}
          >
            <BookmarkIcon filled={showSavedOnly} />
            Sačuvane objave
          </button>
        </div>

        <div className="feed-page__card feed-page__groups-card">
          <h2 className="feed-page__card-title">Moje grupe</h2>
          <div className="feed-page__groups-list">
            {groups.map((group) => (
              <GroupItem key={group.id} group={group} onToggleJoin={handleToggleJoinGroup} />
            ))}
          </div>
        </div>
      </aside>

      <section className="feed-page__column feed-page__column--center">
        <PostComposer user={user} postService={postService} onPostCreated={refreshPosts} />

        <div className="feed-page__toolbar">
          {showSavedOnly ? (
            <>
              <h2 className="feed-page__toolbar-title">Sačuvane objave</h2>
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
                role="radio"
                className={
                  sort === "novo"
                    ? "feed-page__sort-btn feed-page__sort-btn--active"
                    : "feed-page__sort-btn"
                }
                aria-checked={sort === "novo"}
                onClick={() => setSort("novo")}
              >
                Najnovije
              </button>
              <button
                type="button"
                role="radio"
                className={
                  sort === "popularno"
                    ? "feed-page__sort-btn feed-page__sort-btn--active"
                    : "feed-page__sort-btn"
                }
                aria-checked={sort === "popularno"}
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
                networkService={networkService}
                onToggleLike={handleToggleLike}
                onToggleSave={handleToggleSave}
                onConnect={handleConnect}
                onOpenPost={setActivePostId}
                onVotePoll={handleVotePoll}
                onSendPost={setSendPostId}
              />
            ))}
          </div>
        )}
      </section>

      <aside className="feed-page__column feed-page__column--right">
        <div className="feed-page__card feed-page__news-card">
          <h2 className="feed-page__card-title">Pravne vesti</h2>
          <ul className="feed-page__news-list">
            {LEGAL_NEWS.map((item) => (
              <li key={item.id} className="feed-page__news-item">
                <span className="feed-page__news-dot" aria-hidden="true" />
                <div>
                  <p className="feed-page__news-item-title">{item.title}</p>
                  <p className="feed-page__news-item-source">{item.source}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {suggestions.length > 0 && (
          <div className="feed-page__card feed-page__suggestions-card">
            <h2 className="feed-page__card-title">Možda poznajete</h2>
            <div className="feed-page__suggestions-list">
              {suggestions.map((lawyer) => (
                <SuggestionCard key={lawyer.id} lawyer={lawyer} onConnect={handleConnect} />
              ))}
            </div>
          </div>
        )}
      </aside>

      {activePost && (
        <PostModal
          post={activePost}
          currentUser={user}
          commentService={commentService}
          onClose={() => setActivePostId(null)}
          onToggleLike={handleToggleLike}
          onToggleSave={handleToggleSave}
          onCommentAdded={handleCommentAdded}
          onVotePoll={handleVotePoll}
        />
      )}

      {sendPost && (
        <SendPostModal
          post={sendPost}
          currentUser={user}
          networkService={networkService}
          messageService={messageService}
          onClose={() => setSendPostId(null)}
        />
      )}
    </div>
  );
}
