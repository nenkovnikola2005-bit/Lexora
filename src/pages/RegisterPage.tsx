import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { FormField } from "../components/ui/FormField";
import { CITIES, PRACTICE_AREAS } from "../data/constants";
import { useAuth } from "../context/AuthContext";
import { ROLE_LABELS } from "../models/User";
import type { UserRole } from "../models/User";
import "./RegisterPage.scss";

type PasswordStrengthLevel = 0 | 1 | 2 | 3;

const STRENGTH_LABELS: Record<PasswordStrengthLevel, string> = {
  0: "",
  1: "Slaba lozinka",
  2: "Srednje jaka lozinka",
  3: "Jaka lozinka",
};

// Sopstvena logika ocenjivanja: kombinuje raznovrsnost karaktera i dužinu.
function calculatePasswordStrength(password: string): PasswordStrengthLevel {
  if (password.length === 0) return 0;

  let varietyScore = 0;
  if (/[a-z]/.test(password)) varietyScore += 1;
  if (/[A-Z]/.test(password)) varietyScore += 1;
  if (/[0-9]/.test(password)) varietyScore += 1;
  if (/[^A-Za-z0-9]/.test(password)) varietyScore += 1;

  const lengthScore = password.length >= 12 ? 2 : password.length >= 8 ? 1 : 0;
  const total = varietyScore + lengthScore;

  if (total <= 2) return 1;
  if (total <= 4) return 2;
  return 3;
}

const ROLE_OPTIONS: UserRole[] = ["advokat", "advokatski-pripravnik", "pravni-savetnik"];

const REGISTRATION_STEPS = [
  {
    title: "Verifikovana licenca",
    description: "Oznaka koju kolege odmah vide pored vašeg imena.",
  },
  {
    title: "Mreža po oblastima",
    description: "Predlozi za povezivanje iz vaše specijalizacije i grada.",
  },
  {
    title: "Vidljivost u pretrazi",
    description: "Kolege vas nalaze po veštinama, ne po oglasu.",
  },
];

const PRACTICE_AREA_OPTIONS = [
  { value: "", label: "Izaberite oblast prava" },
  ...PRACTICE_AREAS.map((area) => ({ value: area, label: area })),
];

const CITY_OPTIONS = [
  { value: "", label: "Izaberite grad" },
  ...CITIES.map((city) => ({ value: city, label: city })),
];

export function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<UserRole>("advokat");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [barNumber, setBarNumber] = useState("");
  const [practiceArea, setPracticeArea] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const passwordStrength = useMemo(() => calculatePasswordStrength(password), [password]);

  // Već prijavljenog korisnika odmah vraća na početnu.
  useEffect(() => {
    if (user) {
      navigate("/feed", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Lozinke se ne podudaraju.");
      return;
    }
    if (!consentChecked) {
      setError("Morate prihvatiti uslove korišćenja da biste nastavili.");
      return;
    }

    setSubmitting(true);
    try {
      await register({
        firstName,
        lastName,
        email,
        password,
        role,
        barNumber,
        practiceArea,
        city,
      });
      navigate("/feed", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Došlo je do greške pri registraciji.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-page__brand">
        <span className="register-page__ukras register-page__ukras--1" aria-hidden="true" />
        <span className="register-page__ukras register-page__ukras--2" aria-hidden="true" />

        <div className="register-page__brand-content">
          <div className="register-page__logo">
            <span className="register-page__logo-mark">L</span>
            <span className="register-page__logo-word">Lexora</span>
          </div>

          <div className="register-page__headline">
            <p className="register-page__title">Vaš profil je vaša reputacija.</p>
            <p className="register-page__subtitle">
              Registracija traje dva minuta. Licencu proveravamo u imeniku advokatske komore u
              roku od 24 sata.
            </p>
          </div>

          <div className="register-page__steps">
            {REGISTRATION_STEPS.map((step, index) => (
              <div className="register-page__step" key={step.title}>
                <span className="register-page__step-number">{index + 1}</span>
                <div className="register-page__step-text">
                  <p className="register-page__step-title">{step.title}</p>
                  <p className="register-page__step-description">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="register-page__panel">
        <form className="register-page__form" onSubmit={handleSubmit}>
          <h1 className="register-page__heading">Otvorite nalog</h1>
          <p className="register-page__subtext">
            Već ste član? <Link to="/login">Prijavite se</Link>
          </p>

          <p className="register-page__section-label">Registrujem se kao</p>
          <div className="register-page__role-picker" role="radiogroup" aria-label="Uloga">
            {ROLE_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={role === option}
                className={
                  role === option
                    ? "register-page__role-card register-page__role-card--active"
                    : "register-page__role-card"
                }
                onClick={() => setRole(option)}
              >
                <span className="register-page__role-dot" />
                {ROLE_LABELS[option]}
              </button>
            ))}
          </div>

          <div className="register-page__row">
            <FormField id="register-first-name" label="Ime" value={firstName} onChange={setFirstName} required />
            <FormField id="register-last-name" label="Prezime" value={lastName} onChange={setLastName} required />
          </div>

          <div className="register-page__row">
            <FormField
              id="register-email"
              label="E-mail adresa"
              variant="email"
              value={email}
              onChange={setEmail}
              placeholder="ime.prezime@advokat.rs"
              required
            />
            <FormField
              id="register-bar-number"
              label="Broj u imeniku komore"
              value={barNumber}
              onChange={setBarNumber}
              placeholder="AK NI 1284"
              required
            />
          </div>

          <div className="register-page__row">
            <FormField
              id="register-practice-area"
              label="Primarna oblast prava"
              variant="select"
              value={practiceArea}
              onChange={setPracticeArea}
              options={PRACTICE_AREA_OPTIONS}
              required
            />
            <FormField
              id="register-city"
              label="Grad"
              variant="select"
              value={city}
              onChange={setCity}
              options={CITY_OPTIONS}
              required
            />
          </div>

          <div className="register-page__row">
            <FormField
              id="register-password"
              label="Lozinka"
              variant="password"
              value={password}
              onChange={setPassword}
              placeholder="Najmanje 8 karaktera"
              required
            />
            <FormField
              id="register-confirm-password"
              label="Potvrda lozinke"
              variant="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Ponovite lozinku"
              required
            />
          </div>

          {password && (
            <div className="register-page__strength">
              <div className="register-page__strength-bars">
                {[1, 2, 3].map((bar) => (
                  <span
                    key={bar}
                    className={
                      bar <= passwordStrength
                        ? `register-page__strength-bar register-page__strength-bar--level-${passwordStrength}`
                        : "register-page__strength-bar"
                    }
                  />
                ))}
              </div>
              <span className="register-page__strength-label">
                {STRENGTH_LABELS[passwordStrength]}
              </span>
            </div>
          )}

          <label className="register-page__consent">
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(event) => setConsentChecked(event.target.checked)}
            />
            <span>
              Prihvatam{" "}
              <a href="#" onClick={(event) => event.preventDefault()}>
                Uslove korišćenja
              </a>
              , <a href="#" onClick={(event) => event.preventDefault()}>Politiku privatnosti</a>{" "}
              i{" "}
              <a href="#" onClick={(event) => event.preventDefault()}>
                Kodeks profesionalnog ponašanja
              </a>{" "}
              na platformi.
            </span>
          </label>

          {error && (
            <p className="register-page__error" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="register-page__submit-btn" disabled={submitting}>
            {submitting ? "Kreiranje naloga..." : "Kreiraj nalog"}
          </Button>

          <p className="register-page__footnote">
            Šaljemo verifikacioni e-mail. Do provere licence profil je vidljiv bez oznake
            „Verifikovana licenca”.
          </p>
        </form>
      </div>
    </div>
  );
}
