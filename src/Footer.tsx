import { useState, type FormEvent, type JSX } from "react";
import "./Footer.css";

const LANGUAGES = ["English", "Français"];

const COLUMNS: { title: string; links: string[] }[] = [
  {
    title: "About Us",
    links: ["Company Info", "Security & Trust Center", "Help & Support", "Careers", "Editorial Guidelines"],
  },
  {
    title: "For Employers",
    links: ["Post a Job", "Answer Requests", "Employer Resources", "Advertising Opportunities"],
  },
  {
    title: "Job Seeker",
    links: ["View Jobs", "Apply", "Track Applications"],
  },
  {
    title: "Legal",
    links: ["Terms of Use", "Privacy Policy", "Cookie Policy"],
  },
];

// Simple, generic line-icon glyphs (not brand logos) rendered inline.
const SOCIALS: { label: string; path: JSX.Element }[] = [
  {
    label: "Facebook",
    path: <path d="M14 9h3V6h-3c-2 0-3 1-3 3v2H9v3h2v6h3v-6h3l1-3h-4v-1c0-1 0-1 1-1z" />,
  },
  {
    label: "Instagram",
    path: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="4" />
        <circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="16.4" cy="7.6" r="0.9" />
      </>
    ),
  },
  {
    label: "TikTok",
    path: <path d="M15 4v9.5a2.5 2.5 0 1 1-2.5-2.5c.2 0 .3 0 .5.03V8.9a5.1 5.1 0 1 0 4.9 5.1V9.2c.8.6 1.8 1 3 1V7.3c-1.7 0-3.1-1.2-3.4-2.9-.03-.13-.05-.27-.05-.4H15z" />,
  },
  {
    label: "X",
    path: <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />,
  },
  {
    label: "LinkedIn",
    path: (
      <>
        <rect x="5" y="9" width="3" height="9" />
        <circle cx="6.5" cy="6" r="1.6" />
        <path d="M11 9h3v1.4c.6-1 1.6-1.6 3-1.6 2.2 0 3.5 1.4 3.5 4.2V18h-3v-4.5c0-1.1-.4-1.9-1.5-1.9-1 0-1.6.7-1.9 1.4-.1.2-.1.5-.1.8V18h-3z" />
      </>
    ),
  },
  {
    label: "YouTube",
    path: (
      <>
        <rect x="3" y="6.5" width="18" height="11" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 9.5l5 3-5 3z" />
      </>
    ),
  },
];

export default function Footer(): JSX.Element {
  const [openColumns, setOpenColumns] = useState<boolean[]>(COLUMNS.map(() => true));
  const [activeLang, setActiveLang] = useState("English");
  const [cookiePanelOpen, setCookiePanelOpen] = useState(false);
  const [cookiePrefs, setCookiePrefs] = useState({
    essential: true,
    analytics: true,
    marketing: false,
  });
  const [saved, setSaved] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const toggleColumn = (index: number) => {
    setOpenColumns((prev) => prev.map((v, i) => (i === index ? !v : v)));
  };

  const toggleCookie = (key: keyof typeof cookiePrefs) => {
    if (key === "essential") return;
    setCookiePrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (email.trim() === "") return;
    setSubscribed(true);
  };

  return (
    <footer className="jf-footer">
      <div className="jf-footer-accent" />

      <div className="jf-footer-top">
        <div className="jf-newsletter">
          <div>
            <h3>Stay in the loop</h3>
            <p>New jobs and career tips, straight to your inbox.</p>
          </div>
          <form className="jf-newsletter-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setSubscribed(false);
              }}
            />
            <button type="submit">{subscribed ? "Subscribed ✓" : "Subscribe"}</button>
          </form>
        </div>
      </div>

      <div className="jf-footer-inner">
        <div className="jf-footer-brand-col">
          <div className="jf-footer-brand">
            <span>
              <span className="jf-footer-brand-logo">job</span>
              <span className="jf-footer-brand-change">find</span>
            </span>
          </div>
          <p className="jf-footer-tagline">
            jobfind is the best of all time job seekers and candidates for
            recruiters. Find the job of your life with us.
          </p>
        </div>

        {COLUMNS.map((col, i) => (
          <div className="jf-footer-col" key={col.title}>
            <button
              className="jf-footer-col-title"
              onClick={() => toggleColumn(i)}
              aria-expanded={openColumns[i]}
            >
              {col.title}
              <span className={`jf-chevron ${openColumns[i] ? "jf-chevron-open" : ""}`}>▾</span>
            </button>
            {openColumns[i] && (
              <ul className="jf-footer-links">
                {col.links.map((link) =>
                  link === "Cookie Policy" ? (
                    <li key={link}>
                      <button
                        className="jf-footer-link jf-link-btn-inline"
                        onClick={() => setCookiePanelOpen((v) => !v)}
                      >
                        Cookie settings
                      </button>
                    </li>
                  ) : (
                    <li key={link}>
                      <a href="#" className="jf-footer-link">
                        {link}
                      </a>
                    </li>
                  )
                )}
              </ul>
            )}
          </div>
        ))}

        <div className="jf-footer-col">
          <h4 className="jf-footer-col-title jf-footer-col-title-static">Social media</h4>
          <div className="jf-social-row">
            {SOCIALS.map((s) => (
              <a href="#" key={s.label} className="jf-social-icon" aria-label={s.label}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  {s.path}
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>

      {cookiePanelOpen && (
        <div className="jf-cookie-panel">
          <h4>Cookie preferences</h4>
          <label className="jf-cookie-row">
            <span>Essential (always on)</span>
            <input type="checkbox" checked readOnly />
          </label>
          <label className="jf-cookie-row">
            <span>Analytics</span>
            <input type="checkbox" checked={cookiePrefs.analytics} onChange={() => toggleCookie("analytics")} />
          </label>
          <label className="jf-cookie-row">
            <span>Marketing</span>
            <input type="checkbox" checked={cookiePrefs.marketing} onChange={() => toggleCookie("marketing")} />
          </label>
          <div className="jf-cookie-actions">
            <button className="jf-cookie-save" onClick={() => setSaved(true)} type="button">
              Save preferences
            </button>
            {saved && <span className="jf-cookie-saved">Saved ✓</span>}
          </div>
        </div>
      )}

      <div className="jf-footer-langs">
        <span className="jf-footer-langs-label">Available in:</span>
        {LANGUAGES.map((lang) => (
          <button
            key={lang}
            className={`jf-lang-btn ${activeLang === lang ? "jf-lang-active" : ""}`}
            onClick={() => setActiveLang(lang)}
            type="button"
          >
            {lang}
          </button>
        ))}
      </div>

      <div className="jf-footer-bottom">
        <div className="jf-footer-brand">
          <span>
            <span className="jf-footer-brand-logo">job</span>
            <span className="jf-footer-brand-change">find</span>
          </span>
        </div>
        <p className="jf-copyright">Copyright JobFinder © 2026 — All rights reserved</p>
        <button
          className="jf-back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
        >
          ↑ Top
        </button>
      </div>
    </footer>
  );
}