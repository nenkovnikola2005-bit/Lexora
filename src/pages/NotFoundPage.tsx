import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
      <h1>Stranica nije pronađena</h1>
      <p>Stranica koju tražite ne postoji ili je premeštena.</p>
      <Link to="/feed">Nazad na početnu</Link>
    </div>
  );
}
