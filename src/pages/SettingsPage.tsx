import { useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { SettingsMenu } from "../components/settings/SettingsMenu";
import { Button } from "../components/ui/Button";
import { FormField } from "../components/ui/FormField";
import { useAuth } from "../context/AuthContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { AuthService } from "../services/AuthService";
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const authService = useMemo(() => new AuthService(), []);

  const [settings, setSettings] = useLocalStorage<AccountSettings>(
    `lexora_settings_${user?.id ?? "guest"}`,
    DEFAULT_SETTINGS,
  );

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (!user) {
    return null;
  }

  const updateSettings = (patch: Partial<AccountSettings>) => {
    setSettings((current) => ({ ...current, ...patch }));
  };

  const handleChangePassword = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    setPasswordSubmitting(true);
    try {
      await authService.changePassword(user.id, currentPassword, newPassword);
      setPasswordSuccess("Lozinka je uspešno promenjena.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Došlo je do greške.");
    } finally {
      setPasswordSubmitting(false);
    }
  };

  // Izvoz podataka korisnika kao JSON fajl (Blob + privremeni <a> klik).
  const handleExportData = () => {
    const accounts = JSON.parse(localStorage.getItem("lexora_accounts") ?? "[]") as Array<
      Record<string, unknown>
    >;
    const account = accounts.find((item) => item.id === user.id);
    const exportPayload = {
      user: account ? { ...account, passwordHash: undefined } : user,
      settings,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lexora-podaci-${user.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = () => {
    localStorage.clear();
    logout();
    navigate("/login", { replace: true });
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
  } else if (section === "nalog") {
    panel = (
      <section className="settings-page__panel">
        <h2>Nalog i prijava</h2>
        <p className="settings-page__account-email">
          Prijavljeni ste kao <strong>{user.email}</strong>
        </p>

        <form className="settings-page__password-form" onSubmit={handleChangePassword}>
          <FormField
            id="current-password"
            label="Trenutna lozinka"
            variant="password"
            value={currentPassword}
            onChange={setCurrentPassword}
            required
          />
          <FormField
            id="new-password"
            label="Nova lozinka"
            variant="password"
            value={newPassword}
            onChange={setNewPassword}
            required
          />
          {passwordError && (
            <p className="settings-page__form-error" role="alert">
              {passwordError}
            </p>
          )}
          {passwordSuccess && (
            <p className="settings-page__form-success" role="status">
              {passwordSuccess}
            </p>
          )}
          <Button
            type="submit"
            disabled={passwordSubmitting || !currentPassword || !newPassword}
          >
            {passwordSubmitting ? "Menjanje..." : "Promeni lozinku"}
          </Button>
        </form>
      </section>
    );
  } else if (section === "podaci") {
    panel = (
      <section className="settings-page__panel">
        <h2>Podaci i nalog</h2>
        <p className="settings-page__panel-description">
          Preuzmite kopiju svojih podataka sa Lexore u JSON formatu.
        </p>
        <Button variant="secondary" onClick={handleExportData}>
          Preuzmi moje podatke
        </Button>

        <div className="settings-page__danger-zone">
          <h3>Opasna zona</h3>
          <p className="settings-page__panel-description">
            Brisanje naloga je trajno i briše sve podatke sačuvane na ovom uređaju.
          </p>
          {!confirmingDelete ? (
            <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
              Obriši nalog
            </Button>
          ) : (
            <div className="settings-page__danger-confirm">
              <p>Da li ste sigurni? Ova radnja je nepovratna.</p>
              <div className="settings-page__danger-actions">
                <Button variant="danger" onClick={handleDeleteAccount}>
                  Da, obriši nalog
                </Button>
                <Button variant="outline" onClick={() => setConfirmingDelete(false)}>
                  Otkaži
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  } else {
    panel = (
      <div className="settings-page__not-found">
        <p>Ova sekcija podešavanja ne postoji.</p>
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
