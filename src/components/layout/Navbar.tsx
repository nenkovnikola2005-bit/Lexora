import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Avatar } from "../ui/Avatar";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import "./Navbar.scss";

const NAV_LINKS = [
  { to: "/feed", label: "Početna" },
  { to: "/network", label: "Mreža" },
  { to: "/messages", label: "Poruke" },
  { to: "/profile", label: "Profil" },
  { to: "/settings", label: "Podešavanja" },
];

// Glavna navigacija za prijavljene korisnike.
export function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Zatvara padajući meni pri svakoj promeni rute.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="navbar">
      <NavLink to="/feed" className="navbar__brand">
        Lexora
      </NavLink>

      <nav className="navbar__links" aria-label="Glavna navigacija">
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              isActive ? "navbar__link navbar__link--active" : "navbar__link"
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="navbar__actions">
        <button
          type="button"
          className="navbar__theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Uključi svetlu temu" : "Uključi tamnu temu"}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        {user && (
          <div className="navbar__user">
            <button
              type="button"
              className="navbar__avatar-button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-haspopup="true"
            >
              <Avatar initials={user.avatarInitials} size="sm" />
            </button>

            {menuOpen && (
              <div className="navbar__menu">
                <p className="navbar__menu-name">{user.firstName} {user.lastName}</p>
                <button type="button" className="navbar__menu-item" onClick={handleLogout}>
                  Odjava
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
