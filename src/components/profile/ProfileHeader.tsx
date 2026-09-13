import type { ReactNode } from "react";
import { Avatar } from "../ui/Avatar";
import "./ProfileHeader.scss";

export interface ProfileHeaderProps {
  avatarInitials: string;
  name: string;
  headline: string;
  verifiedBadge?: boolean;
  meta?: ReactNode;
  actions: ReactNode;
  banner?: ReactNode;
}

// Zajedničko zaglavlje profila — traka, avatar, ime i headline.
// Slot za akcije se razlikuje po kontekstu: "Uredi profil" na sopstvenom
// profilu, "Poveži se"/"Pošalji poruku" na profilu pravnika iz mreže.
export function ProfileHeader({
  avatarInitials,
  name,
  headline,
  verifiedBadge,
  meta,
  actions,
  banner,
}: ProfileHeaderProps) {
  return (
    <header className="profile-header">
      <div className="profile-header__cover">
        <span className="profile-header__cover-ukras" aria-hidden="true" />
      </div>
      <div className="profile-header__body">
        <div className="profile-header__avatar-wrap">
          <Avatar initials={avatarInitials} size="xl" />
        </div>
        <div className="profile-header__info">
          <div className="profile-header__name-row">
            <h1 className="profile-header__name">{name}</h1>
            {verifiedBadge && (
              <span className="profile-header__verified">Verifikovana licenca</span>
            )}
          </div>
          <p className="profile-header__headline">{headline}</p>
          {meta && <div className="profile-header__meta">{meta}</div>}
        </div>
        <div className="profile-header__actions">{actions}</div>
      </div>
      {banner && <div className="profile-header__banner">{banner}</div>}
    </header>
  );
}
