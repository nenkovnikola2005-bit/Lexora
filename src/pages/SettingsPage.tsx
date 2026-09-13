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
import { pluralizeSr } from "../utils/pluralizeSr";
import "./SettingsPage.scss";

const DEFAULT_SETTINGS: AccountSettings = {
  profileVisibility: "public",
  searchVisible: true,
  connectionsVisibility: "onlyMe",
  anonymousBrowsing: false,
  connectionRequestNotifications: true,
  postReactionNotifications: true,
  messageNotifications: true,
  skillEndorsementNotifications: false,
  weeklyDigest: "monday",
  twoFactorEnabled: false,
};

const VISIBILITY_OPTIONS = [
  { value: "public", label: "Svi na Lexori" },
  { value: "connections", label: "Samo veze" },
  { value: "private", label: "Samo ja" },
];

const CONNECTIONS_VISIBILITY_OPTIONS = [
  { value: "onlyMe", label: "Samo ja" },
  { value: "level1", label: "Veze 1. nivoa" },
];

const WEEKLY_DIGEST_OPTIONS = [
  { value: "off", label: "Isključeno" },
  { value: "monday", label: "Ponedeljkom" },
  { value: "friday", label: "Petkom" },
];

function formatPasswordAge(iso: string | undefined): string {
  const changed = iso ? new Date(iso) : null;
  if (!changed || Number.isNaN(changed.getTime())) {
    return "Nema podataka o poslednjoj izmeni.";
  }
  const now = new Date();
  const months = (now.getFullYear() - changed.getFullYear()) * 12 + (now.getMonth() - changed.getMonth());
  if (months <= 0) return "Nedavno promenjena.";
  return `Poslednja izmena pre ${months} ${pluralizeSr(months, "mesec", "meseca", "meseci")}.`;
}

interface SettingsRowProps {
  title: string;
  description: string;
  control: ReactNode;
  titleColor?: "default" | "danger";
}

// Red opcije podešavanja: naslov + opis levo, kontrola (switch/select/dugme) desno.
function SettingsRow({ title, description, control, titleColor = "default" }: SettingsRowProps) {
  return (
    <div className="settings-page__row">
      <div className="settings-page__row-text">
        <p
          className={
            titleColor === "danger"
              ? "settings-page__row-title settings-page__row-title--danger"
              : "settings-page__row-title"
          }
        >
          {title}
        </p>
        <p className="settings-page__row-description">{description}</p>
      </div>
      <div className="settings-page__row-control">{control}</div>
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <input
      type="checkbox"
      className="settings-page__switch"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      aria-label={label}
    />
  );
}

export function SettingsPage() {
  const { section } = useParams<{ section: string }>();
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const authService = useMemo(() => new AuthService(), []);

  const [storedSettings, setStoredSettings] = useLocalStorage<AccountSettings>(
    `lexora_settings_${user?.id ?? "guest"}`,
    DEFAULT_SETTINGS,
  );
  const settings: AccountSettings = { ...DEFAULT_SETTINGS, ...storedSettings };

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [accountNotice, setAccountNotice] = useState<string | null>(null);

  if (!user) {
    return null;
  }

  const updateSettings = (patch: Partial<AccountSettings>) => {
    setStoredSettings({ ...settings, ...patch });
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

  const handleToggleCollaboration = (enabled: boolean) => {
    updateUser({
      openToCollaboration: {
        enabled,
        note: user.openToCollaboration?.note ?? "",
      },
    });
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

  if (section === "nalog") {
    panel = (
      <section className="settings-page__panel">
        <h2>Nalog i prijava</h2>
        <p className="settings-page__panel-description">
          Podaci za pristup i verifikacija licence.
        </p>

        <SettingsRow
          title="E-mail adresa"
          description={`${user.email} · potvrđena`}
          control={
            <Button variant="outline" size="small" onClick={() => setAccountNotice("email")}>
              Promeni
            </Button>
          }
        />

        <SettingsRow
          title="Lozinka"
          description={formatPasswordAge(user.passwordChangedAt)}
          control={
            <Button variant="outline" size="small" onClick={() => setShowPasswordForm((v) => !v)}>
              Promeni lozinku
            </Button>
          }
        />

        {showPasswordForm && (
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
              size="small"
              disabled={passwordSubmitting || !currentPassword || !newPassword}
            >
              {passwordSubmitting ? "Menjanje..." : "Sačuvaj novu lozinku"}
            </Button>
          </form>
        )}

        <SettingsRow
          title="Dvofaktorska potvrda"
          description="Dodatni kod pri prijavi sa novog uređaja."
          control={
            <ToggleSwitch
              checked={settings.twoFactorEnabled}
              onChange={(checked) => updateSettings({ twoFactorEnabled: checked })}
              label="Dvofaktorska potvrda"
            />
          }
        />

        <SettingsRow
          title="Broj u imeniku komore"
          description={
            user.barNumber
              ? `${user.barNumber}${user.city ? ` · Advokatska komora ${user.city}` : ""} · ${
                  user.licenseVerified ? "verifikovano" : "na čekanju provere"
                }`
              : "Još uvek niste uneli broj u imeniku komore."
          }
          control={
            <Button variant="outline" size="small" onClick={() => setAccountNotice("document")}>
              Prikaži dokument
            </Button>
          }
        />

        {accountNotice && (
          <p className="settings-page__form-success" role="status">
            {accountNotice === "email"
              ? "Promena email adrese još uvek nije dostupna."
              : "Pregled dokumenta još uvek nije dostupan."}
          </p>
        )}
      </section>
    );
  } else if (section === "profil") {
    panel = (
      <section className="settings-page__panel">
        <h2>Profil i vidljivost</h2>
        <p className="settings-page__panel-description">
          Ko vidi vaš profil i kako se prikazujete u pretrazi i predlozima.
        </p>

        <SettingsRow
          title="Vidljivost profila"
          description="Ko može da otvori vaš pun profil."
          control={
            <FormField
              id="profile-visibility"
              label=""
              variant="select"
              value={settings.profileVisibility}
              onChange={(value) =>
                updateSettings({ profileVisibility: value as AccountSettings["profileVisibility"] })
              }
              options={VISIBILITY_OPTIONS}
            />
          }
        />

        <SettingsRow
          title="Prikazivanje u pretrazi"
          description="Da li se pojavljujete kada kolege pretražuju po oblasti prava i gradu."
          control={
            <ToggleSwitch
              checked={settings.searchVisible}
              onChange={(checked) => updateSettings({ searchVisible: checked })}
              label="Prikazivanje u pretrazi"
            />
          }
        />

        <SettingsRow
          title="Ko vidi vaše veze"
          description="Lista vaših veza je vidljiva samo vama ili i vezama 1. nivoa."
          control={
            <FormField
              id="connections-visibility"
              label=""
              variant="select"
              value={settings.connectionsVisibility}
              onChange={(value) =>
                updateSettings({
                  connectionsVisibility: value as AccountSettings["connectionsVisibility"],
                })
              }
              options={CONNECTIONS_VISIBILITY_OPTIONS}
            />
          }
        />

        <SettingsRow
          title="Anonimni pregled profila"
          description="Kada gledate tuđi profil, ne prikazuje se vaše ime."
          control={
            <ToggleSwitch
              checked={settings.anonymousBrowsing}
              onChange={(checked) => updateSettings({ anonymousBrowsing: checked })}
              label="Anonimni pregled profila"
            />
          }
        />

        <SettingsRow
          title={"Oznaka „Otvoren za saradnju”"}
          description="Prikazuje se na vrhu profila i u predlozima za povezivanje."
          control={
            <ToggleSwitch
              checked={user.openToCollaboration?.enabled ?? false}
              onChange={handleToggleCollaboration}
              label="Oznaka Otvoren za saradnju"
            />
          }
        />
      </section>
    );
  } else if (section === "obavestenja") {
    panel = (
      <section className="settings-page__panel">
        <h2>Obaveštenja</h2>
        <p className="settings-page__panel-description">
          Šta vam stiže na mejl, a šta samo u aplikaciju.
        </p>

        <SettingsRow
          title="Nove pozivnice za povezivanje"
          description="Mejl i obaveštenje u aplikaciji."
          control={
            <ToggleSwitch
              checked={settings.connectionRequestNotifications}
              onChange={(checked) => updateSettings({ connectionRequestNotifications: checked })}
              label="Nove pozivnice za povezivanje"
            />
          }
        />

        <SettingsRow
          title="Reakcije i komentari na moje objave"
          description="Sažetak jednom dnevno umesto svakog pojedinačnog."
          control={
            <ToggleSwitch
              checked={settings.postReactionNotifications}
              onChange={(checked) => updateSettings({ postReactionNotifications: checked })}
              label="Reakcije i komentari na moje objave"
            />
          }
        />

        <SettingsRow
          title="Poruke"
          description="Obaveštenje čim poruka stigne."
          control={
            <ToggleSwitch
              checked={settings.messageNotifications}
              onChange={(checked) => updateSettings({ messageNotifications: checked })}
              label="Poruke"
            />
          }
        />

        <SettingsRow
          title="Potvrde veština od kolega"
          description="Kada vam kolega potvrdi veštinu na profilu."
          control={
            <ToggleSwitch
              checked={settings.skillEndorsementNotifications}
              onChange={(checked) => updateSettings({ skillEndorsementNotifications: checked })}
              label="Potvrde veština od kolega"
            />
          }
        />

        <SettingsRow
          title="Nedeljni pregled mreže"
          description="Šta su vaše veze objavljivale i ko je gledao vaš profil."
          control={
            <FormField
              id="weekly-digest"
              label=""
              variant="select"
              value={settings.weeklyDigest}
              onChange={(value) =>
                updateSettings({ weeklyDigest: value as AccountSettings["weeklyDigest"] })
              }
              options={WEEKLY_DIGEST_OPTIONS}
            />
          }
        />
      </section>
    );
  } else if (section === "podaci") {
    panel = (
      <section className="settings-page__panel">
        <h2>Podaci i nalog</h2>

        <SettingsRow
          title="Preuzimanje podataka"
          description="Arhiva vaših objava, poruka i veza u .json formatu."
          control={
            <Button variant="outline" size="small" onClick={handleExportData}>
              Zatraži arhivu
            </Button>
          }
        />

        <div className="settings-page__danger-zone">
          {!confirmingDelete ? (
            <SettingsRow
              title="Gašenje naloga"
              description="Profil, objave i poruke se trajno brišu sa ovog uređaja."
              titleColor="danger"
              control={
                <Button variant="danger" size="small" onClick={() => setConfirmingDelete(true)}>
                  Ugasi nalog
                </Button>
              }
            />
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
        <Link to="/settings/nalog">Nazad na podešavanja</Link>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-page__header">
        <h1>Podešavanja</h1>
        <p>Upravljajte nalogom, vidljivošću profila i obaveštenjima.</p>
      </div>

      <div className="settings-page__layout">
        <aside className="settings-page__menu">
          <SettingsMenu />
        </aside>
        <div className="settings-page__content">{panel}</div>
      </div>
    </div>
  );
}
