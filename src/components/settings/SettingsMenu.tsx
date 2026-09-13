import { NavLink, useParams } from "react-router-dom";
import { BellIcon } from "../ui/icons/BellIcon";
import { EyeIcon } from "../ui/icons/EyeIcon";
import { LockIcon } from "../ui/icons/LockIcon";
import { UserIcon } from "../ui/icons/UserIcon";
import "./SettingsMenu.scss";

const SECTIONS = [
  { slug: "nalog", label: "Nalog i prijava", icon: <UserIcon /> },
  { slug: "profil", label: "Profil i vidljivost", icon: <EyeIcon /> },
  { slug: "obavestenja", label: "Obaveštenja", icon: <BellIcon /> },
  { slug: "podaci", label: "Podaci i nalog", icon: <LockIcon /> },
];

// Bočni meni podešavanja — aktivna sekcija se očitava iz URL parametra.
export function SettingsMenu() {
  const { section } = useParams<{ section: string }>();

  return (
    <nav className="settings-menu" aria-label="Podešavanja">
      {SECTIONS.map((item) => (
        <NavLink
          key={item.slug}
          to={`/settings/${item.slug}`}
          className={
            section === item.slug
              ? "settings-menu__item settings-menu__item--active"
              : "settings-menu__item"
          }
        >
          <span className="settings-menu__icon">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
