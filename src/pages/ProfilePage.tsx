import { useEffect, useMemo, useState } from "react";
import { PostCard } from "../components/feed/PostCard";
import { ProfileHeader } from "../components/profile/ProfileHeader";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { PostService } from "../services/PostService";
import type { Post } from "../models/Post";
import type { User } from "../models/User";
import { fullName } from "../models/User";
import "./ProfilePage.scss";

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

  if (user.role === "advokat") {
    items.push(
      { label: "Oblast prava", done: Boolean(user.practiceArea) },
      { label: "Broj u imeniku komore", done: Boolean(user.barNumber) },
      { label: "Verifikovana licenca", done: user.licenseVerified },
    );
  }

  const done = items.filter((item) => item.done).length;
  const percent = Math.round((done / items.length) * 100);
  return { percent, items };
}

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const postService = useMemo(() => new PostService(), []);

  const [posts, setPosts] = useState<Post[]>([]);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutDraft, setAboutDraft] = useState("");

  useEffect(() => {
    if (!user) return;
    postService.seedIfEmpty();
    setPosts(postService.byAuthor(user.id));
  }, [user, postService]);

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

  const strength = calculateProfileStrength(user);
  const incompleteItems = strength.items.filter((item) => !item.done);

  return (
    <div className="profile-page">
      <div className="profile-page__main">
        <ProfileHeader
          avatarInitials={user.avatarInitials}
          name={fullName(user)}
          headline={user.headline}
          meta={
            <span className="profile-page__city">
              {user.city ?? "Grad nije naveden"}
            </span>
          }
          actions={
            <Button onClick={handleStartEditing} disabled={isEditingAbout}>
              Uredi profil
            </Button>
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
                  onToggleLike={handleToggleLike}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
          )}
        </section>

        <section className="profile-page__section">
          <h2>Iskustvo</h2>
          <p className="profile-page__empty">Još uvek niste dodali radno iskustvo.</p>
        </section>

        <section className="profile-page__section">
          <h2>Obrazovanje</h2>
          <p className="profile-page__empty">Još uvek niste dodali obrazovanje.</p>
        </section>

        <section className="profile-page__section">
          <h2>Veštine</h2>
          <p className="profile-page__empty">Još uvek niste dodali veštine.</p>
        </section>
      </div>

      <aside className="profile-page__sidebar">
        <div className="profile-page__card">
          <p className="profile-page__card-title">Snaga profila</p>
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
      </aside>
    </div>
  );
}
