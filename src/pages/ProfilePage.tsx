import { useEffect, useMemo, useState } from "react";
import type { KeyboardEvent } from "react";
import { SuggestionCard } from "../components/feed/SuggestionCard";
import { PostCard } from "../components/feed/PostCard";
import { PostModal } from "../components/feed/PostModal";
import { SendPostModal } from "../components/feed/SendPostModal";
import { ProfileHeader } from "../components/profile/ProfileHeader";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { BriefcaseIcon } from "../components/ui/icons/BriefcaseIcon";
import { useAuth } from "../context/AuthContext";
import { CommentService } from "../services/CommentService";
import { MessageService } from "../services/MessageService";
import { NetworkService } from "../services/NetworkService";
import { PostService } from "../services/PostService";
import type { LawyerProfile } from "../models/Lawyer";
import type { Post } from "../models/Post";
import type { Education, Experience } from "../models/Lawyer";
import type { User } from "../models/User";
import { fullName } from "../models/User";
import { pluralizeSr } from "../utils/pluralizeSr";
import "./ProfilePage.scss";

const SIMILAR_PROFILES_LIMIT = 3;

const EMPTY_EXPERIENCE: Experience = { role: "", organization: "", period: "" };
const EMPTY_EDUCATION: Education = { school: "", degree: "", period: "" };

interface StrengthItem {
  label: string;
  done: boolean;
}

interface ProfileStrength {
  percent: number;
  items: StrengthItem[];
}

// Sopstvena logika: procenat popunjenosti profila na osnovu stvarnih polja korisnika.
function calculateProfileStrength(user: User): ProfileStrength {
  const items: StrengthItem[] = [
    { label: "Ime i prezime", done: Boolean(user.firstName && user.lastName) },
    { label: "Naslov (headline)", done: Boolean(user.headline.trim()) },
    { label: "Opis „O meni”", done: Boolean(user.bio.trim()) },
    { label: "Grad", done: Boolean(user.city) },
  ];

  items.push(
    { label: "Oblast prava", done: Boolean(user.practiceArea) },
    { label: "Broj u imeniku komore", done: Boolean(user.barNumber) },
    { label: "Verifikovana licenca", done: user.licenseVerified },
  );

  const done = items.filter((item) => item.done).length;
  const percent = Math.round((done / items.length) * 100);
  return { percent, items };
}

function strengthLabel(percent: number): { text: string; className: string } {
  if (percent >= 80) return { text: "Visok nivo", className: "profile-page__strength-label--high" };
  if (percent >= 40) return { text: "Srednji nivo", className: "profile-page__strength-label--mid" };
  return { text: "Nizak nivo", className: "profile-page__strength-label--low" };
}

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const postService = useMemo(() => new PostService(), []);
  const networkService = useMemo(() => new NetworkService(), []);
  const commentService = useMemo(() => new CommentService(), []);
  const messageService = useMemo(() => new MessageService(), []);

  const [posts, setPosts] = useState<Post[]>([]);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [sendPostId, setSendPostId] = useState<string | null>(null);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutDraft, setAboutDraft] = useState("");

  const [isEditingExperience, setIsEditingExperience] = useState(false);
  const [experienceDraft, setExperienceDraft] = useState<Experience[]>([]);

  const [isEditingEducation, setIsEditingEducation] = useState(false);
  const [educationDraft, setEducationDraft] = useState<Education[]>([]);

  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [skillsDraft, setSkillsDraft] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const [isEditingCollaboration, setIsEditingCollaboration] = useState(false);
  const [collaborationDraft, setCollaborationDraft] = useState({ enabled: false, note: "" });
  const [recommendationNotice, setRecommendationNotice] = useState(false);

  const [similarProfiles, setSimilarProfiles] = useState<LawyerProfile[]>([]);

  const refreshSimilarProfiles = () => {
    if (!user) return;
    const matches = networkService
      .getDirectory(undefined, user.id)
      .filter(
        (lawyer) =>
          lawyer.practiceArea === user.practiceArea &&
          networkService.getConnectionStatus(lawyer.id, user.id) !== "connected",
      );
    setSimilarProfiles(matches.slice(0, SIMILAR_PROFILES_LIMIT));
  };

  useEffect(() => {
    if (!user) return;
    postService.seedIfEmpty();
    networkService.seedIfEmpty(user.id);
    commentService.seedIfEmpty();
    messageService.seedIfEmpty();
    setPosts(postService.byAuthor(user.id));
    refreshSimilarProfiles();
  }, [user, postService, networkService, commentService, messageService]);

  if (!user) {
    return null;
  }

  const refreshPosts = () => setPosts(postService.byAuthor(user.id));

  const handleToggleLike = (postId: string) => {
    postService.toggleLike(postId, user.id);
    refreshPosts();
  };

  const handleToggleSave = (postId: string) => {
    postService.toggleSave(postId, user.id);
    refreshPosts();
  };

  const handleCommentAdded = (postId: string) => {
    postService.incrementCommentsCount(postId);
    refreshPosts();
  };

  const handleVotePoll = (postId: string, optionId: string) => {
    postService.votePoll(postId, optionId, user.id);
    refreshPosts();
  };

  const handleSendPost = (postId: string) => {
    setSendPostId(postId);
  };

  const activePost = activePostId ? posts.find((post) => post.id === activePostId) ?? null : null;
  const sendPost = sendPostId ? posts.find((post) => post.id === sendPostId) ?? null : null;

  const handleStartEditing = () => {
    setAboutDraft(user.bio);
    setIsEditingAbout(true);
  };

  const handleSaveAbout = () => {
    updateUser({ bio: aboutDraft.trim() });
    setIsEditingAbout(false);
  };

  const handleCancelEditing = () => {
    setIsEditingAbout(false);
  };

  // --- Iskustvo ---

  const handleStartEditingExperience = () => {
    setExperienceDraft(user.experience ?? []);
    setIsEditingExperience(true);
  };

  const handleAddExperienceRow = () => {
    setExperienceDraft((current) => [...current, { ...EMPTY_EXPERIENCE }]);
  };

  const handleExperienceFieldChange = (
    index: number,
    field: keyof Experience,
    value: string,
  ) => {
    setExperienceDraft((current) =>
      current.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const handleRemoveExperienceRow = (index: number) => {
    setExperienceDraft((current) => current.filter((_, i) => i !== index));
  };

  const handleSaveExperience = () => {
    const cleaned = experienceDraft
      .map((item) => ({
        role: item.role.trim(),
        organization: item.organization.trim(),
        period: item.period.trim(),
      }))
      .filter((item) => item.role || item.organization || item.period);
    updateUser({ experience: cleaned });
    setIsEditingExperience(false);
  };

  const handleCancelEditingExperience = () => {
    setIsEditingExperience(false);
  };

  // --- Obrazovanje ---

  const handleStartEditingEducation = () => {
    setEducationDraft(user.education ?? []);
    setIsEditingEducation(true);
  };

  const handleAddEducationRow = () => {
    setEducationDraft((current) => [...current, { ...EMPTY_EDUCATION }]);
  };

  const handleEducationFieldChange = (
    index: number,
    field: keyof Education,
    value: string,
  ) => {
    setEducationDraft((current) =>
      current.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const handleRemoveEducationRow = (index: number) => {
    setEducationDraft((current) => current.filter((_, i) => i !== index));
  };

  const handleSaveEducation = () => {
    const cleaned = educationDraft
      .map((item) => ({
        school: item.school.trim(),
        degree: item.degree.trim(),
        period: item.period.trim(),
      }))
      .filter((item) => item.school || item.degree || item.period);
    updateUser({ education: cleaned });
    setIsEditingEducation(false);
  };

  const handleCancelEditingEducation = () => {
    setIsEditingEducation(false);
  };

  // --- Veštine ---

  const handleStartEditingSkills = () => {
    setSkillsDraft(user.skills ?? []);
    setSkillInput("");
    setIsEditingSkills(true);
  };

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed || skillsDraft.includes(trimmed)) {
      setSkillInput("");
      return;
    }
    setSkillsDraft((current) => [...current, trimmed]);
    setSkillInput("");
  };

  const handleSkillInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddSkill();
    }
  };

  const handleRemoveSkillDraft = (skill: string) => {
    setSkillsDraft((current) => current.filter((item) => item !== skill));
  };

  const handleSaveSkills = () => {
    updateUser({ skills: skillsDraft });
    setIsEditingSkills(false);
  };

  const handleCancelEditingSkills = () => {
    setIsEditingSkills(false);
  };

  // --- Otvorenost za saradnju ---

  const handleStartEditingCollaboration = () => {
    setCollaborationDraft({
      enabled: user.openToCollaboration?.enabled ?? false,
      note: user.openToCollaboration?.note ?? "",
    });
    setIsEditingCollaboration(true);
  };

  const handleSaveCollaboration = () => {
    updateUser({
      openToCollaboration: {
        enabled: collaborationDraft.enabled,
        note: collaborationDraft.note.trim(),
      },
    });
    setIsEditingCollaboration(false);
  };

  const handleCancelEditingCollaboration = () => {
    setIsEditingCollaboration(false);
  };

  const handleConnectSimilar = (lawyerId: string) => {
    networkService.sendRequest(lawyerId, user.id);
    refreshSimilarProfiles();
  };

  const strength = calculateProfileStrength(user);
  const incompleteItems = strength.items.filter((item) => !item.done);
  const strengthMeta = strengthLabel(strength.percent);
  const connectionsCount = networkService.connectedCount(user.id);

  return (
    <div className="profile-page">
      <div className="profile-page__main">
        <ProfileHeader
          avatarInitials={user.avatarInitials}
          name={fullName(user)}
          headline={user.headline}
          verifiedBadge={user.licenseVerified}
          meta={
            <>
              <span>{user.city ?? "Grad nije naveden"}</span>
              <span>·</span>
              <span className="profile-page__connections-count">
                {connectionsCount} {pluralizeSr(connectionsCount, "veza", "veze", "veza")}
              </span>
            </>
          }
          actions={
            <Button onClick={handleStartEditing} disabled={isEditingAbout}>
              Uredi profil
            </Button>
          }
          banner={
            isEditingCollaboration ? (
              <div className="profile-page__collab-edit">
                <label className="profile-page__collab-toggle">
                  <input
                    type="checkbox"
                    checked={collaborationDraft.enabled}
                    onChange={(event) =>
                      setCollaborationDraft((current) => ({
                        ...current,
                        enabled: event.target.checked,
                      }))
                    }
                  />
                  Otvoren/a sam za saradnju
                </label>
                <textarea
                  className="profile-page__about-textarea"
                  value={collaborationDraft.note}
                  onChange={(event) =>
                    setCollaborationDraft((current) => ({ ...current, note: event.target.value }))
                  }
                  rows={2}
                  placeholder="Npr. Zajedničko zastupanje, medijacija, konsultacije za kolege..."
                  aria-label="Opis saradnje"
                />
                <div className="profile-page__about-actions">
                  <Button size="small" onClick={handleSaveCollaboration}>
                    Sačuvaj
                  </Button>
                  <Button size="small" variant="outline" onClick={handleCancelEditingCollaboration}>
                    Otkaži
                  </Button>
                </div>
              </div>
            ) : user.openToCollaboration?.enabled ? (
              <div className="profile-page__collab-banner">
                <div className="profile-page__collab-text">
                  <p className="profile-page__collab-title">Otvorena/otvoren za saradnju</p>
                  <p className="profile-page__collab-note">{user.openToCollaboration.note}</p>
                </div>
                <button
                  type="button"
                  className="profile-page__section-action profile-page__collab-edit-btn"
                  onClick={handleStartEditingCollaboration}
                >
                  Uredi
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="profile-page__collab-empty"
                onClick={handleStartEditingCollaboration}
              >
                + Označite da ste otvoreni za saradnju
              </button>
            )
          }
        />

        <section className="profile-page__section">
          <h2>O meni</h2>
          {isEditingAbout ? (
            <div className="profile-page__about-edit">
              <textarea
                className="profile-page__about-textarea"
                value={aboutDraft}
                onChange={(event) => setAboutDraft(event.target.value)}
                rows={5}
                placeholder="Napišite nešto o sebi i svom radu..."
                aria-label="O meni"
              />
              <div className="profile-page__about-actions">
                <Button size="small" onClick={handleSaveAbout}>
                  Sačuvaj
                </Button>
                <Button size="small" variant="outline" onClick={handleCancelEditing}>
                  Otkaži
                </Button>
              </div>
            </div>
          ) : (
            <p>{user.bio || "Još uvek niste dodali opis profila."}</p>
          )}
        </section>

        <section className="profile-page__section">
          <h2>Aktivnost</h2>
          {posts.length === 0 ? (
            <p className="profile-page__empty">Još uvek nemate objava na feed-u.</p>
          ) : (
            <div className="profile-page__posts">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={user.id}
                  networkService={networkService}
                  onToggleLike={handleToggleLike}
                  onToggleSave={handleToggleSave}
                  onConnect={() => {}}
                  onOpenPost={setActivePostId}
                  onVotePoll={handleVotePoll}
                  onSendPost={handleSendPost}
                />
              ))}
            </div>
          )}
        </section>

        <section className="profile-page__section">
          <div className="profile-page__section-header">
            <h2>Iskustvo</h2>
            {!isEditingExperience && (
              <button
                type="button"
                className="profile-page__section-action"
                onClick={handleStartEditingExperience}
              >
                Uredi
              </button>
            )}
          </div>

          {isEditingExperience ? (
            <div className="profile-page__list-edit">
              {experienceDraft.map((item, index) => (
                <div className="profile-page__list-edit-row" key={index}>
                  <input
                    className="profile-page__list-input"
                    value={item.role}
                    onChange={(event) =>
                      handleExperienceFieldChange(index, "role", event.target.value)
                    }
                    placeholder="Pozicija (npr. Advokat, ortak)"
                    aria-label="Pozicija"
                  />
                  <input
                    className="profile-page__list-input"
                    value={item.organization}
                    onChange={(event) =>
                      handleExperienceFieldChange(index, "organization", event.target.value)
                    }
                    placeholder="Kancelarija / organizacija"
                    aria-label="Organizacija"
                  />
                  <input
                    className="profile-page__list-input profile-page__list-input--period"
                    value={item.period}
                    onChange={(event) =>
                      handleExperienceFieldChange(index, "period", event.target.value)
                    }
                    placeholder="Period (npr. 2018–danas)"
                    aria-label="Period"
                  />
                  <button
                    type="button"
                    className="profile-page__list-remove"
                    onClick={() => handleRemoveExperienceRow(index)}
                    aria-label="Ukloni ovaj unos iskustva"
                  >
                    Ukloni
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="profile-page__section-action"
                onClick={handleAddExperienceRow}
              >
                + Dodaj iskustvo
              </button>

              <div className="profile-page__about-actions">
                <Button size="small" onClick={handleSaveExperience}>
                  Sačuvaj
                </Button>
                <Button size="small" variant="outline" onClick={handleCancelEditingExperience}>
                  Otkaži
                </Button>
              </div>
            </div>
          ) : (user.experience ?? []).length === 0 ? (
            <p className="profile-page__empty">Još uvek niste dodali radno iskustvo.</p>
          ) : (
            <ul className="profile-page__timeline">
              {(user.experience ?? []).map((item, index) => (
                <li key={index} className="profile-page__timeline-row">
                  <span className="profile-page__timeline-icon">
                    <BriefcaseIcon />
                  </span>
                  <div>
                    <p className="profile-page__timeline-role">{item.role}</p>
                    <p className="profile-page__timeline-org">{item.organization}</p>
                    <p className="profile-page__timeline-period">{item.period}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="profile-page__section">
          <div className="profile-page__section-header">
            <h2>Obrazovanje</h2>
            {!isEditingEducation && (
              <button
                type="button"
                className="profile-page__section-action"
                onClick={handleStartEditingEducation}
              >
                Uredi
              </button>
            )}
          </div>

          {isEditingEducation ? (
            <div className="profile-page__list-edit">
              {educationDraft.map((item, index) => (
                <div className="profile-page__list-edit-row" key={index}>
                  <input
                    className="profile-page__list-input"
                    value={item.degree}
                    onChange={(event) =>
                      handleEducationFieldChange(index, "degree", event.target.value)
                    }
                    placeholder="Zvanje (npr. Diplomirani pravnik)"
                    aria-label="Zvanje"
                  />
                  <input
                    className="profile-page__list-input"
                    value={item.school}
                    onChange={(event) =>
                      handleEducationFieldChange(index, "school", event.target.value)
                    }
                    placeholder="Škola / fakultet"
                    aria-label="Škola"
                  />
                  <input
                    className="profile-page__list-input profile-page__list-input--period"
                    value={item.period}
                    onChange={(event) =>
                      handleEducationFieldChange(index, "period", event.target.value)
                    }
                    placeholder="Period (npr. 2009–2013)"
                    aria-label="Period"
                  />
                  <button
                    type="button"
                    className="profile-page__list-remove"
                    onClick={() => handleRemoveEducationRow(index)}
                    aria-label="Ukloni ovaj unos obrazovanja"
                  >
                    Ukloni
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="profile-page__section-action"
                onClick={handleAddEducationRow}
              >
                + Dodaj obrazovanje
              </button>

              <div className="profile-page__about-actions">
                <Button size="small" onClick={handleSaveEducation}>
                  Sačuvaj
                </Button>
                <Button size="small" variant="outline" onClick={handleCancelEditingEducation}>
                  Otkaži
                </Button>
              </div>
            </div>
          ) : (user.education ?? []).length === 0 ? (
            <p className="profile-page__empty">Još uvek niste dodali obrazovanje.</p>
          ) : (
            <ul className="profile-page__timeline">
              {(user.education ?? []).map((item, index) => (
                <li key={index}>
                  <p className="profile-page__timeline-role">{item.degree}</p>
                  <p className="profile-page__timeline-org">{item.school}</p>
                  <p className="profile-page__timeline-period">{item.period}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="profile-page__section">
          <div className="profile-page__section-header">
            <h2>Veštine</h2>
            {!isEditingSkills && (
              <button
                type="button"
                className="profile-page__section-action"
                onClick={handleStartEditingSkills}
              >
                Uredi
              </button>
            )}
          </div>

          {isEditingSkills ? (
            <div className="profile-page__list-edit">
              <div className="profile-page__skill-input-row">
                <input
                  className="profile-page__list-input"
                  value={skillInput}
                  onChange={(event) => setSkillInput(event.target.value)}
                  onKeyDown={handleSkillInputKeyDown}
                  placeholder="Unesite veštinu i pritisnite Enter"
                  aria-label="Nova veština"
                />
                <Button type="button" size="small" variant="outline" onClick={handleAddSkill}>
                  Dodaj
                </Button>
              </div>

              {skillsDraft.length > 0 && (
                <ul className="profile-page__skills">
                  {skillsDraft.map((skill) => (
                    <li key={skill} className="profile-page__skill-chip">
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkillDraft(skill)}
                        aria-label={`Ukloni veštinu ${skill}`}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="profile-page__about-actions">
                <Button size="small" onClick={handleSaveSkills}>
                  Sačuvaj
                </Button>
                <Button size="small" variant="outline" onClick={handleCancelEditingSkills}>
                  Otkaži
                </Button>
              </div>
            </div>
          ) : (user.skills ?? []).length === 0 ? (
            <p className="profile-page__empty">Još uvek niste dodali veštine.</p>
          ) : (
            <ul className="profile-page__skills">
              {(user.skills ?? []).map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          )}
        </section>

        <section className="profile-page__section">
          <div className="profile-page__section-header">
            <h2>Preporuke</h2>
            <button
              type="button"
              className="profile-page__section-action"
              onClick={() => setRecommendationNotice(true)}
            >
              Zatraži preporuku
            </button>
          </div>

          {recommendationNotice && (
            <p className="profile-page__notice" role="status">
              Traženje preporuka još uvek nije dostupno.
            </p>
          )}

          {(user.recommendations ?? []).length === 0 ? (
            <p className="profile-page__empty">Još uvek nemate nijednu preporuku.</p>
          ) : (
            <ul className="profile-page__recommendations">
              {(user.recommendations ?? []).map((recommendation) => (
                <li key={recommendation.id} className="profile-page__recommendation">
                  <Avatar initials={recommendation.authorInitials} size="md" />
                  <div>
                    <p className="profile-page__recommendation-name">{recommendation.authorName}</p>
                    <p className="profile-page__recommendation-headline">
                      {recommendation.authorHeadline}
                    </p>
                    <p className="profile-page__recommendation-text">„{recommendation.text}”</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <aside className="profile-page__sidebar">
        <div className="profile-page__card">
          <p className="profile-page__card-title">Snaga profila</p>
          <p className={`profile-page__strength-label ${strengthMeta.className}`}>
            {strengthMeta.text}
          </p>
          <div className="profile-page__strength-bar">
            <div
              className="profile-page__strength-fill"
              style={{ width: `${strength.percent}%` }}
            />
          </div>
          <p className="profile-page__strength-percent">{strength.percent}% popunjeno</p>

          {incompleteItems.length === 0 ? (
            <p className="profile-page__strength-done">Vaš profil je potpun!</p>
          ) : (
            <ul className="profile-page__strength-list">
              {incompleteItems.map((item) => (
                <li key={item.label}>{item.label}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="profile-page__card">
          <p className="profile-page__card-title">Analitika</p>
          <div className="profile-page__analytics-row">
            <span className="profile-page__analytics-number">24</span>
            <span className="profile-page__analytics-label">Pregledi profila ove nedelje</span>
          </div>
          <div className="profile-page__analytics-row">
            <span className="profile-page__analytics-number">8</span>
            <span className="profile-page__analytics-label">Pojavljivanja u pretrazi</span>
          </div>
        </div>

        {similarProfiles.length > 0 && (
          <div className="profile-page__card">
            <p className="profile-page__card-title">Slični profili</p>
            <div className="profile-page__similar-list">
              {similarProfiles.map((lawyer) => (
                <SuggestionCard key={lawyer.id} lawyer={lawyer} onConnect={handleConnectSimilar} />
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
