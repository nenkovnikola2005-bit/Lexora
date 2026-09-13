import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { FormField } from "../components/ui/FormField";
import { ShieldIcon } from "../components/ui/icons/ShieldIcon";
import { useAuth } from "../context/AuthContext";
import "./LoginPage.scss";

const DEMO_EMAIL = "ana.kovacevic@advokat.rs";
const DEMO_PASSWORD = "lexora123";

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [licenseNotice, setLicenseNotice] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Već prijavljenog korisnika odmah vraća na početnu.
  useEffect(() => {
    if (user) {
      navigate("/feed", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/feed", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Došlo je do greške pri prijavi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-page__brand">
        <span className="login-page__ukras login-page__ukras--1" aria-hidden="true" />
        <span className="login-page__ukras login-page__ukras--2" aria-hidden="true" />

        <div className="login-page__brand-content">
          <div className="login-page__logo">
            <span className="login-page__logo-mark">L</span>
            <span className="login-page__logo-word">Lexora</span>
          </div>

          <div className="login-page__headline">
            <p className="login-page__title">Mreža u kojoj se pravnici zapravo poznaju.</p>
            <p className="login-page__subtitle">
              Pratite kolege iz svoje oblasti, delite tumačenja i nalazite saradnike za
              predmete koje ne vodite sami.
            </p>
          </div>

          <div className="login-page__stats">
            <div className="login-page__stat">
              <span className="login-page__stat-number">4.200+</span>
              <span className="login-page__stat-label">pravnika u mreži</span>
            </div>
            <div className="login-page__stat">
              <span className="login-page__stat-number">38</span>
              <span className="login-page__stat-label">oblasti prava</span>
            </div>
            <div className="login-page__stat">
              <span className="login-page__stat-number">12.500</span>
              <span className="login-page__stat-label">objava mesečno</span>
            </div>
          </div>

          <div className="login-page__testimonial">
            <p className="login-page__testimonial-text">
              „Objavila sam pitanje o starateljstvu u petak. Do ponedeljka sam imala
              četiri odgovora od kolega koje ranije nisam poznavala."
            </p>
            <div className="login-page__testimonial-author">
              <span className="login-page__testimonial-avatar">AK</span>
              <div className="login-page__testimonial-meta">
                <span className="login-page__testimonial-name">Ana Kovačević</span>
                <span className="login-page__testimonial-role">
                  Advokat, porodično pravo · Niš
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="login-page__panel">
        <form className="login-page__form" onSubmit={handleSubmit}>
          <h1 className="login-page__heading">Prijavite se</h1>
          <p className="login-page__subtext">Nastavite tamo gde ste stali u svojoj mreži.</p>

          <div className="login-page__fields">
            <FormField
              id="login-email"
              label="E-mail adresa"
              variant="email"
              value={email}
              onChange={setEmail}
              placeholder="ime.prezime@advokat.rs"
              required
            />
            <FormField
              id="login-password"
              label="Lozinka"
              variant="password"
              value={password}
              onChange={setPassword}
              required
            />
          </div>

          <div className="login-page__options">
            <label className="login-page__remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              Ostani prijavljen
            </label>
            <a href="#" className="login-page__forgot" onClick={(event) => event.preventDefault()}>
              Zaboravljena lozinka?
            </a>
          </div>

          {error && (
            <p className="login-page__error" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="login-page__submit-btn" disabled={submitting}>
            {submitting ? "Prijavljivanje..." : "Prijavi se"}
          </Button>

          <div className="login-page__divider">
            <span>ili</span>
          </div>

          <Button
            type="button"
            variant="outline"
            className="login-page__license-btn"
            onClick={() => setLicenseNotice(true)}
          >
            <ShieldIcon />
            Prijava advokatskom licencom
          </Button>
          {licenseNotice && (
            <p className="login-page__license-notice" role="status">
              Prijava advokatskom licencom još uvek nije dostupna.
            </p>
          )}

          <p className="login-page__signup">
            Niste na Lexori? <Link to="/register">Otvorite nalog</Link>
          </p>

          <p className="login-page__demo-note">
            Demo nalog: {DEMO_EMAIL} / {DEMO_PASSWORD}
          </p>
        </form>
      </div>
    </div>
  );
}
