import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { FormField } from "../components/ui/FormField";
import { useAuth } from "../context/AuthContext";
import "./LoginPage.scss";

const DEMO_EMAIL = "ana.kovacevic@advokat.rs";
const DEMO_PASSWORD = "lexora123";

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
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
        <p className="login-page__logo">Lexora</p>
        <p className="login-page__tagline">Profesionalna mreža za pravnike</p>
        <blockquote className="login-page__quote">
          „Lexora mi je pomogla da povežem kancelariju sa kolegama iz cele
          zemlje i pronađem klijente kojima je zaista potrebna moja
          specijalizacija.”
        </blockquote>
        <div className="login-page__stat">
          <span className="login-page__stat-number">2.400+</span>
          <span className="login-page__stat-label">verifikovanih pravnika</span>
        </div>
      </div>

      <div className="login-page__panel">
        <form className="login-page__form" onSubmit={handleSubmit}>
          <h1 className="login-page__heading">Prijava</h1>
          <p className="login-page__subtext">
            Nemate nalog? <Link to="/register">Registrujte se</Link>
          </p>

          <FormField
            id="login-email"
            label="Email"
            variant="email"
            value={email}
            onChange={setEmail}
            placeholder="ime@primer.rs"
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

          {error && <p className="login-page__error">{error}</p>}

          <Button type="submit" disabled={submitting}>
            {submitting ? "Prijavljivanje..." : "Prijavi se"}
          </Button>

          <p className="login-page__demo-note">
            Demo nalog: {DEMO_EMAIL} / {DEMO_PASSWORD}
          </p>
        </form>
      </div>
    </div>
  );
}
