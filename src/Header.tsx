import { useState, type JSX } from "react";
import "./Header.css";

const NAV_LINKS = ["Home", "About Us", "Contact Us", "FAQs"] as const;

interface HeaderProps {
  onLoginClick: () => void;
  onSignUpClick: () => void;
  onLogoClick: () => void;
  onFaqClick: () => void;
  onAboutClick: () => void;
  onContactClick: () => void;
  isAuthenticated: boolean;
  onDashboardClick: () => void;
  onLogout: () => void;
}

export default function Header({
  onLoginClick,
  onSignUpClick,
  onLogoClick,
  onFaqClick,
  onAboutClick,
  onContactClick,
  isAuthenticated,
  onDashboardClick,
  onLogout,
}: HeaderProps): JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleNavigation = (link: string): void => {
    setMenuOpen(false);

    switch (link) {
      case "Home":
        onLogoClick();
        break;

      case "About Us":
        onAboutClick();
        break;

      case "Contact Us":
        onContactClick();
        break;

      case "FAQs":
        onFaqClick();
        break;

      default:
        break;
    }
  };

  return (
    <header className="jf-header">
      <div className="jf-header-inner">

        {/* LOGO */}
        <div className="jf-left-group">
          <button
            type="button"
            className="jf-logo jf-logo-btn"
            aria-label="Go to JobFind home"
          >
            <span className="logo-job">Job</span>
            <span className="logo-find">find</span>
          </button>

          {/* NAVIGATION */}
          <nav
            className={`jf-nav ${menuOpen ? "jf-nav-open" : ""}`}
            aria-label="Main navigation"
          >
            {NAV_LINKS.map((link) => (
              <button
                type="button"
                key={link}
                className="jf-nav-link"
                onClick={() => handleNavigation(link)}
              >
                {link}
              </button>
            ))}
          </nav>
        </div>

        {/* RIGHT SIDE */}
        <div className="jf-header-actions">

          {/* SEARCH */}
          <div className="jf-search-wrap">
            <button
              type="button"
              className="jf-icon-btn"
              aria-label="Search"
              onClick={() => setSearchOpen((value) => !value)}
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <line
                  x1="21"
                  y1="21"
                  x2="16.65"
                  y2="16.65"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {searchOpen && (
              <input
                type="text"
                className="jf-search-input"
                placeholder="Search jobs, companies..."
                autoFocus
                onBlur={() => setSearchOpen(false)}
              />
            )}
          </div>

          {/* AUTHENTICATED USER */}
          {isAuthenticated ? (
            <div className="jf-profile-wrap">
              <button
                type="button"
                className="jf-icon-btn"
                aria-label="Account"
                onClick={() => setProfileOpen((value) => !value)}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="8"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M4 20c0-4 4-6 8-6s8 2 8 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              {profileOpen && (
                <div className="jf-dropdown">
                  <button
                    type="button"
                    className="jf-dropdown-btn"
                    onClick={() => {
                      setProfileOpen(false);
                      onDashboardClick();
                    }}
                  >
                    Dashboard
                  </button>

                  <button
                    type="button"
                    className="jf-dropdown-btn"
                    onClick={() => {
                      setProfileOpen(false);
                      onLogout();
                    }}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="jf-auth-links">
              <button
                type="button"
                className="jf-login-link"
                onClick={onLoginClick}
              >
                Login
              </button>

              <button
                type="button"
                className="jf-signup-btn"
                onClick={onSignUpClick}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* MOBILE MENU */}
          <button
            type="button"
            className="jf-icon-btn jf-menu-btn"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <svg viewBox="0 0 24 24" width="23" height="23" fill="none">
              <path
                d="M3 6h18M3 12h18M3 18h18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}