import type { ReactNode } from "react";
import { Avatar } from "../ui/Avatar";
import "./ProfileHeader.scss";

export interface ProfileHeaderProps {
  avatarInitials: string;
  name: string;
  headline: string;
  meta?: ReactNode;
  actions: ReactNode;
}

// Zajedničko zaglavlje profila — traka, avatar, ime i headline.
// Slot za akcije se razlikuje po kontekstu: "Uredi profil" na sopstvenom
// profilu, "Poveži se"/"Pošalji poruku" na profilu pravnika iz mreže.
export function ProfileHeader({ avatarInitials, name, headline, meta, actions }: ProfileHeaderProps) {
  return (
    <header className="profile-header">
      <div className="profile-header__cover" />
      <div className="profile-header__body">
        <div className="profile-header__avatar-wrap">
          <Avatar initials={avatarInitials} size="lg" />
        </div>
        <div className="profile-header__info">
          <h1 className="profile-header__name">{name}</h1>
          <p className="profile-header__headline">{headline}</p>
          {meta && <div className="profile-header__meta">{meta}</div>}
        </div>
        <div className="profile-header__actions">{actions}</div>
      </div>
    </header>
  );
}
