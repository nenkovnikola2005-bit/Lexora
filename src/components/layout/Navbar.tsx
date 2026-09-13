import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Avatar } from "../ui/Avatar";
import { ChatIcon } from "../ui/icons/ChatIcon";
import { HomeIcon } from "../ui/icons/HomeIcon";
import { NetworkIcon } from "../ui/icons/NetworkIcon";
import { SearchIcon } from "../ui/icons/SearchIcon";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { MessageService } from "../../services/MessageService";
import { NetworkService } from "../../services/NetworkService";
import "./Navbar.scss";

interface NavTab {
  key: string;
  to: string;
  label: string;
  icon: ReactNode;
  badge?: number;
}

// Glavna navigacija za prijavljene korisnike, prema Figma "Navbar" komponenti.
export function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const networkService = useMemo(() => new NetworkService(), []);
  const messageService = useMemo(() => new MessageService(), []);

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  // Osvežava brojače na pozivnice i nepročitane poruke pri svakoj promeni rute.
  useEffect(() => {
    if (user) {
      setPendingCount(networkService.getPendingIncoming(user.id).length);
    }
    setUnreadCount(messageService.unreadCount());
    setMenuOpen(false);
  }, [location.pathname, networkService, messageService, user]);

  const tabs: NavTab[] = [
    { key: "pocetna", to: "/feed", label: "Početna", icon: <HomeIcon /> },
    {
      key: "mreza",
      to: "/network",
      label: "Mreža",
      icon: <NetworkIcon />,
      badge: pendingCount,
    },
    {
      key: "poruke",
      to: "/messages",
      label: "Poruke",
      icon: <ChatIcon />,
      badge: unreadCount,
    },
  ];

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault();
    const query = searchValue.trim();
    if (!query) return;
    navigate(`/network?q=${encodeURIComponent(query)}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  if (!user) return null;

  return (
    <header className="navbar">
      <NavLink to="/feed" className="navbar__logo" aria-label="Lexora — Početna">
        L
      </NavLink>

      <form className="navbar__search" onSubmit={handleSearchSubmit} role="search">
        <SearchIcon />
        <input
          type="text"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Pretraži pravnike, oblasti, objave…"
          aria-label="Pretraga"
        />
      </form>

      <div className="navbar__spacer" />

      <nav className="navbar__tabs" aria-label="Glavna navigacija">
        {tabs.map((tab) => (
          <NavLink
            key={tab.key}
            to={tab.to}
            className={({ isActive }) =>
              isActive ? "navbar__tab navbar__tab--active" : "navbar__tab"
            }
          >
            <span className="navbar__tab-icon-wrap">
              {tab.icon}
              {Boolean(tab.badge) && <span className="navbar__badge">{tab.badge}</span>}
            </span>
            {tab.label}
          </NavLink>
        ))}

        <div className="navbar__user">
          <button
            type="button"
            className="navbar__tab navbar__tab--user"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-haspopup="true"
          >
            <Avatar initials={user.avatarInitials} size="sm" />
            Ja ▾
          </button>

          {menuOpen && (
            <div className="navbar__menu">
              <p className="navbar__menu-name">
                {user.firstName} {user.lastName}
              </p>
              <NavLink to="/profile" className="navbar__menu-item">
                Profil
              </NavLink>
              <NavLink to="/settings" className="navbar__menu-item">
                Podešavanja
              </NavLink>
              <button type="button" className="navbar__menu-item" onClick={toggleTheme}>
                {theme === "dark" ? "Uključi svetlu temu" : "Uključi tamnu temu"}
              </button>
              <button
                type="button"
                className="navbar__menu-item navbar__menu-item--danger"
                onClick={handleLogout}
              >
                Odjava
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
