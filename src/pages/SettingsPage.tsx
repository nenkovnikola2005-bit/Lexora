import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { SettingsMenu } from "../components/settings/SettingsMenu";
import { useAuth } from "../context/AuthContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { AccountSettings } from "../models/Settings";
import "./SettingsPage.scss";

const DEFAULT_SETTINGS: AccountSettings = {
  profileVisibility: "public",
  emailNotifications: true,
  messageNotifications: true,
  newsletterNotifications: false,
};

const VISIBILITY_OPTIONS: {
  value: AccountSettings["profileVisibility"];
  label: string;
  description: string;
}[] = [
  { value: "public", label: "Javno", description: "Profil je vidljiv svim korisnicima Lexore." },
  {
    value: "connections",
    label: "Samo veze",
    description: "Profil vide samo vaše potvrđene veze.",
  },
  { value: "private", label: "Privatno", description: "Profil je vidljiv samo vama." },
];

export function SettingsPage() {
  const { section } = useParams<{ section: string }>();
  const { user } = useAuth();

  const [settings, setSettings] = useLocalStorage<AccountSettings>(
    `lexora_settings_${user?.id ?? "guest"}`,
    DEFAULT_SETTINGS,
  );

  if (!user) {
    return null;
  }

  const updateSettings = (patch: Partial<AccountSettings>) => {
    setSettings((current) => ({ ...current, ...patch }));
  };

  let panel: ReactNode;

  if (section === "profil") {
    panel = (
      <section className="settings-page__panel">
        <h2>Profil i vidljivost</h2>
        <p className="settings-page__panel-description">
          Odaberite ko može da vidi vaš profil na Lexori.
        </p>
        <div
          className="settings-page__radio-group"
          role="radiogroup"
          aria-label="Vidljivost profila"
        >
          {VISIBILITY_OPTIONS.map((option) => (
            <label key={option.value} className="settings-page__radio">
              <input
                type="radio"
                name="profileVisibility"
                checked={settings.profileVisibility === option.value}
                onChange={() => updateSettings({ profileVisibility: option.value })}
              />
              <span>
                <span className="settings-page__radio-label">{option.label}</span>
                <span className="settings-page__radio-description">{option.description}</span>
              </span>
            </label>
          ))}
        </div>
      </section>
    );
  } else if (section === "obavestenja") {
    panel = (
      <section className="settings-page__panel">
        <h2>Obaveštenja</h2>
        <div className="settings-page__toggle-list">
          <label className="settings-page__toggle">
            <span>Email obaveštenja</span>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(event) =>
                updateSettings({ emailNotifications: event.target.checked })
              }
            />
          </label>
          <label className="settings-page__toggle">
            <span>Obaveštenja o porukama</span>
            <input
              type="checkbox"
              checked={settings.messageNotifications}
              onChange={(event) =>
                updateSettings({ messageNotifications: event.target.checked })
              }
            />
          </label>
          <label className="settings-page__toggle">
            <span>Newsletter</span>
            <input
              type="checkbox"
              checked={settings.newsletterNotifications}
              onChange={(event) =>
                updateSettings({ newsletterNotifications: event.target.checked })
              }
            />
          </label>
        </div>
      </section>
    );
  } else {
    panel = (
      <div className="settings-page__not-found">
        <p>Ova sekcija podešavanja još nije dostupna.</p>
        <Link to="/settings/profil">Nazad na podešavanja</Link>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <aside className="settings-page__menu">
        <SettingsMenu />
      </aside>
      <div className="settings-page__content">{panel}</div>
    </div>
  );
}
