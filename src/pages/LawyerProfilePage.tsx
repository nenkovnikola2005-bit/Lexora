import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PostCard } from "../components/feed/PostCard";
import { PostModal } from "../components/feed/PostModal";
import { SendPostModal } from "../components/feed/SendPostModal";
import { SuggestionCard } from "../components/feed/SuggestionCard";
import { ProfileHeader } from "../components/profile/ProfileHeader";
import { SkillEndorsement } from "../components/profile/SkillEndorsement";
import { Button } from "../components/ui/Button";
import { BriefcaseIcon } from "../components/ui/icons/BriefcaseIcon";
import { useAuth } from "../context/AuthContext";
import { CommentService } from "../services/CommentService";
import { MessageService } from "../services/MessageService";
import { NetworkService } from "../services/NetworkService";
import { PostService } from "../services/PostService";
import { SkillEndorsementService } from "../services/SkillEndorsementService";
import type { ConnectionLevel, ConnectionStatus, LawyerProfile } from "../models/Lawyer";
import type { Post } from "../models/Post";
import { pluralizeSr } from "../utils/pluralizeSr";
import "./LawyerProfilePage.scss";

const LEVEL_LABEL: Record<ConnectionLevel, string> = {
  1: "1. nivo",
  2: "2. nivo",
  3: "3. nivo",
};

const STATUS_LABEL: Record<ConnectionStatus, string> = {
  none: "Poveži se",
  "pending-outgoing": "Zahtev poslat",
  "pending-incoming": "Prihvati pozivnicu",
  connected: "Povezani",
};

const SIMILAR_PROFILES_LIMIT = 3;

// Profil pravnika iz mreže: pregled biografije, iskustva i akcije povezivanja.
export function LawyerProfilePage() {
  const { lawyerId } = useParams<{ lawyerId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const networkService = useMemo(() => new NetworkService(), []);
  const messageService = useMemo(() => new MessageService(), []);
  const postService = useMemo(() => new PostService(), []);
  const commentService = useMemo(() => new CommentService(), []);
  const skillEndorsementService = useMemo(() => new SkillEndorsementService(), []);

  const [lawyer, setLawyer] = useState<LawyerProfile | null | undefined>(undefined);
  const [status, setStatus] = useState<ConnectionStatus>("none");
  const [posts, setPosts] = useState<Post[]>([]);
  const [similarProfiles, setSimilarProfiles] = useState<LawyerProfile[]>([]);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [sendPostId, setSendPostId] = useState<string | null>(null);
  const [followNotice, setFollowNotice] = useState(false);
  const [endorsementsTick, setEndorsementsTick] = useState(0);

  const refreshSimilarProfiles = (current: LawyerProfile) => {
    if (!currentUser) return;
    const matches = networkService
      .getDirectory(undefined, currentUser.id)
      .filter(
        (candidate) =>
          candidate.id !== current.id &&
          candidate.practiceArea === current.practiceArea &&
          networkService.getConnectionStatus(candidate.id, currentUser.id) !== "connected",
      );
    setSimilarProfiles(matches.slice(0, SIMILAR_PROFILES_LIMIT));
  };

  useEffect(() => {
    if (!lawyerId || !currentUser) return;
    networkService.seedIfEmpty(currentUser.id);
    postService.seedIfEmpty();
    commentService.seedIfEmpty();
    messageService.seedIfEmpty();
    skillEndorsementService.seedIfEmpty();

    const found = networkService.getById(lawyerId);
    setLawyer(found);
    setStatus(networkService.getConnectionStatus(lawyerId, currentUser.id));
    setPosts(postService.byAuthor(lawyerId));
    if (found) refreshSimilarProfiles(found);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    lawyerId,
    networkService,
    postService,
    commentService,
    messageService,
    skillEndorsementService,
    currentUser?.id,
  ]);

  if (lawyer === undefined) {
    return null;
  }

  if (lawyer === null) {
    return (
      <div className="lawyer-profile-page__not-found">
        <p>Ovaj pravnik ne postoji ili je uklonjen sa mreže.</p>
        <Link to="/network">Nazad na Mrežu</Link>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  const refreshPosts = () => setPosts(postService.byAuthor(lawyer.id));

  const isActionable = status === "none" || status === "pending-incoming";

  const handleConnectAction = () => {
    if (status === "none") {
      networkService.sendRequest(lawyer.id, currentUser.id);
    } else if (status === "pending-incoming") {
      networkService.accept(lawyer.id, currentUser.id);
    } else {
      return;
    }
    setStatus(networkService.getConnectionStatus(lawyer.id, currentUser.id));
    refreshSimilarProfiles(lawyer);
  };

  const handleMessage = () => {
    const conversation = messageService.startConversation(lawyer);
    navigate(`/messages/${conversation.id}`);
  };

  const handleToggleLike = (postId: string) => {
    postService.toggleLike(postId, currentUser.id);
    refreshPosts();
  };

  const handleToggleSave = (postId: string) => {
    postService.toggleSave(postId, currentUser.id);
    refreshPosts();
  };

  const handleCommentAdded = (postId: string) => {
    postService.incrementCommentsCount(postId);
    refreshPosts();
  };

  const handleVotePoll = (postId: string, optionId: string) => {
    postService.votePoll(postId, optionId, currentUser.id);
    refreshPosts();
  };

  const handleConnectFromCard = (targetLawyerId: string) => {
    networkService.sendRequest(targetLawyerId, currentUser.id);
    if (targetLawyerId === lawyer.id) {
      setStatus(networkService.getConnectionStatus(lawyer.id, currentUser.id));
    }
    refreshSimilarProfiles(lawyer);
    refreshPosts();
  };

  const handleToggleEndorse = (skill: string) => {
    skillEndorsementService.toggleEndorse(lawyer.id, skill, currentUser.id);
    setEndorsementsTick((tick) => tick + 1);
  };

  const activePost = activePostId ? posts.find((post) => post.id === activePostId) ?? null : null;
  const sendPost = sendPostId ? posts.find((post) => post.id === sendPostId) ?? null : null;

  return (
    <div className="lawyer-profile-page">
      <div className="lawyer-profile-page__main">
        <ProfileHeader
          avatarInitials={lawyer.avatarInitials}
          name={`${lawyer.firstName} ${lawyer.lastName}`}
          headline={lawyer.headline}
          verifiedBadge={lawyer.licenseVerified}
          meta={
            <>
              <span>{lawyer.city}</span>
              <span>·</span>
              <span className="lawyer-profile-page__level">{LEVEL_LABEL[lawyer.connectionLevel]}</span>
            </>
          }
          actions={
            <>
              <Button
                variant={isActionable ? "primary" : "outline"}
                disabled={!isActionable}
                onClick={handleConnectAction}
              >
                {STATUS_LABEL[status]}
              </Button>
              <Button variant="secondary" onClick={handleMessage}>
                Poruka
              </Button>
            </>
          }
          banner={
            lawyer.openToCollaboration?.enabled ? (
              <div className="lawyer-profile-page__collab-banner">
                <div className="lawyer-profile-page__collab-text">
                  <p className="lawyer-profile-page__collab-title">Otvoren/a za saradnju</p>
                  <p className="lawyer-profile-page__collab-note">{lawyer.openToCollaboration.note}</p>
                </div>
                <button
                  type="button"
                  className="lawyer-profile-page__section-action"
                  onClick={() => setFollowNotice(true)}
                >
                  Prati
                </button>
              </div>
            ) : undefined
          }
        />

        <section className="lawyer-profile-page__section">
          <div className="lawyer-profile-page__section-header">
            <h2>O meni</h2>
            <button
              type="button"
              className="lawyer-profile-page__section-action"
              onClick={() => setFollowNotice(true)}
            >
              Prati
            </button>
          </div>
          <p>{lawyer.about}</p>
          {followNotice && (
            <p className="lawyer-profile-page__notice" role="status">
              Praćenje profila bez povezivanja još uvek nije dostupno.
            </p>
          )}
        </section>

        <section className="lawyer-profile-page__section">
          <h2>Aktivnost</h2>
          {posts.length === 0 ? (
            <p className="lawyer-profile-page__empty">
              {lawyer.firstName} još uvek nema objava na feed-u.
            </p>
          ) : (
            <div className="lawyer-profile-page__posts">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={currentUser.id}
                  networkService={networkService}
                  onToggleLike={handleToggleLike}
                  onToggleSave={handleToggleSave}
                  onConnect={handleConnectFromCard}
                  onOpenPost={setActivePostId}
                  onVotePoll={handleVotePoll}
                  onSendPost={setSendPostId}
                />
              ))}
            </div>
          )}
        </section>

        <section className="lawyer-profile-page__section">
          <h2>Iskustvo</h2>
          <ul className="lawyer-profile-page__timeline">
            {lawyer.experience.map((item) => (
              <li key={`${item.organization}-${item.period}`} className="lawyer-profile-page__timeline-row">
                <span className="lawyer-profile-page__timeline-icon">
                  <BriefcaseIcon />
                </span>
                <div>
                  <p className="lawyer-profile-page__timeline-role">{item.role}</p>
                  <p className="lawyer-profile-page__timeline-org">{item.organization}</p>
                  <p className="lawyer-profile-page__timeline-period">{item.period}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="lawyer-profile-page__section">
          <h2>Obrazovanje i licence</h2>
          <ul className="lawyer-profile-page__credentials">
            {lawyer.education.map((item) => (
              <li key={`${item.school}-${item.period}`} className="lawyer-profile-page__credential">
                <div>
                  <p className="lawyer-profile-page__timeline-role">{item.degree}</p>
                  <p className="lawyer-profile-page__timeline-org">
                    {item.school} · {item.period}
                  </p>
                </div>
                {item.verified && (
                  <span className="lawyer-profile-page__verified-tag">Verifikovano</span>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="lawyer-profile-page__section">
          <h2>Veštine i potvrde</h2>
          <div className="lawyer-profile-page__endorsements" key={endorsementsTick}>
            {lawyer.skills.map((skill) => {
              const endorsers = skillEndorsementService.getEndorsers(lawyer.id, skill);
              const hasEndorsed = endorsers.includes(currentUser.id);
              const count = endorsers.length;
              const summary =
                count === 0
                  ? "Još uvek nema potvrda."
                  : hasEndorsed
                    ? `Potvrdilo ${count} ${pluralizeSr(count, "kolega", "kolege", "kolega")}, među njima Vi`
                    : `Potvrdilo ${count} ${pluralizeSr(count, "kolega", "kolege", "kolega")}`;
              return (
                <SkillEndorsement
                  key={skill}
                  skill={skill}
                  summary={summary}
                  hasEndorsed={hasEndorsed}
                  onToggle={() => handleToggleEndorse(skill)}
                />
              );
            })}
          </div>
        </section>

        {lawyer.recommendations && lawyer.recommendations.length > 0 && (
          <section className="lawyer-profile-page__section">
            <h2>Preporuke</h2>
            <ul className="lawyer-profile-page__recommendations">
              {lawyer.recommendations.map((recommendation) => (
                <li key={recommendation.id} className="lawyer-profile-page__recommendation">
                  <span className="lawyer-profile-page__recommendation-avatar">
                    {recommendation.authorInitials}
                  </span>
                  <div>
                    <p className="lawyer-profile-page__timeline-role">{recommendation.authorName}</p>
                    <p className="lawyer-profile-page__timeline-org">{recommendation.authorHeadline}</p>
                    <p className="lawyer-profile-page__recommendation-text">
                      „{recommendation.text}”
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <aside className="lawyer-profile-page__sidebar">
        {lawyer.mutualConnections > 0 && (
          <div className="lawyer-profile-page__card">
            <p className="lawyer-profile-page__card-title">Zajedničko</p>
            <p className="lawyer-profile-page__mutual-count">
              {lawyer.mutualConnections}{" "}
              {pluralizeSr(lawyer.mutualConnections, "zajednička veza", "zajedničke veze", "zajedničkih veza")}
            </p>
          </div>
        )}

        {similarProfiles.length > 0 && (
          <div className="lawyer-profile-page__card">
            <p className="lawyer-profile-page__card-title">Slični profili</p>
            <div className="lawyer-profile-page__similar-list">
              {similarProfiles.map((candidate) => (
                <SuggestionCard key={candidate.id} lawyer={candidate} onConnect={handleConnectFromCard} />
              ))}
            </div>
          </div>
        )}
      </aside>

      {activePost && (
        <PostModal
          post={activePost}
          currentUser={currentUser}
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
          currentUser={currentUser}
          networkService={networkService}
          messageService={messageService}
          onClose={() => setSendPostId(null)}
        />
      )}
    </div>
  );
}
