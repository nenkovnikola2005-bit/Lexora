import { NavLink, useParams } from "react-router-dom";
import "./SettingsMenu.scss";

const SECTIONS = [
  { slug: "profil", label: "Profil i vidljivost" },
  { slug: "obavestenja", label: "Obaveštenja" },
  { slug: "nalog", label: "Nalog i prijava" },
  { slug: "podaci", label: "Podaci i nalog" },
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
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
