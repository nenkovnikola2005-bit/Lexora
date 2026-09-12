import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { FormField } from "../components/ui/FormField";
import { CITIES, PRACTICE_AREAS } from "../data/constants";
import { useAuth } from "../context/AuthContext";
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
        barNumber: role === "advokat" ? barNumber : undefined,
        practiceArea: role === "advokat" ? practiceArea : undefined,
        city: role === "advokat" ? city : undefined,
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
      <div className="register-page__panel">
        <form className="register-page__form" onSubmit={handleSubmit}>
          <h1 className="register-page__heading">Registracija</h1>
          <p className="register-page__subtext">
            Već imate nalog? <Link to="/login">Prijavite se</Link>
          </p>

          <div className="register-page__role-toggle" role="radiogroup" aria-label="Uloga">
            <button
              type="button"
              className={
                role === "advokat"
                  ? "register-page__role-btn register-page__role-btn--active"
                  : "register-page__role-btn"
              }
              aria-pressed={role === "advokat"}
              onClick={() => setRole("advokat")}
            >
              Advokat
            </button>
            <button
              type="button"
              className={
                role === "klijent"
                  ? "register-page__role-btn register-page__role-btn--active"
                  : "register-page__role-btn"
              }
              aria-pressed={role === "klijent"}
              onClick={() => setRole("klijent")}
            >
              Klijent
            </button>
          </div>

          <div className="register-page__row">
            <FormField id="register-first-name" label="Ime" value={firstName} onChange={setFirstName} required />
            <FormField id="register-last-name" label="Prezime" value={lastName} onChange={setLastName} required />
          </div>

          <FormField
            id="register-email"
            label="Email"
            variant="email"
            value={email}
            onChange={setEmail}
            placeholder="ime@primer.rs"
            required
          />

          {role === "advokat" && (
            <>
              <FormField
                id="register-bar-number"
                label="Broj u imeniku komore"
                value={barNumber}
                onChange={setBarNumber}
                placeholder="AK-2024-0001"
                required
              />
              <div className="register-page__row">
                <FormField
                  id="register-practice-area"
                  label="Oblast prava"
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
            </>
          )}

          <FormField
            id="register-password"
            label="Lozinka"
            variant="password"
            value={password}
            onChange={setPassword}
            required
          />

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

          <FormField
            id="register-confirm-password"
            label="Potvrda lozinke"
            variant="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            required
          />

          <label className="register-page__consent">
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(event) => setConsentChecked(event.target.checked)}
            />
            <span>
              Prihvatam <a href="#">Uslove korišćenja</a>, <a href="#">Politiku privatnosti</a>{" "}
              i <a href="#">Kodeks profesionalnog ponašanja</a>.
            </span>
          </label>

          {role === "advokat" && (
            <p className="register-page__license-note">
              Vaš profil će biti vidljiv bez oznake „Verifikovana licenca” dok Lexora ne proveri
              broj u imeniku komore.
            </p>
          )}

          {error && <p className="register-page__error">{error}</p>}

          <Button type="submit" disabled={submitting}>
            {submitting ? "Kreiranje naloga..." : "Registruj se"}
          </Button>
        </form>
      </div>
    </div>
  );
}
