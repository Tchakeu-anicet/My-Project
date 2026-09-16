import {
  useEffect,
  useState,
  type JSX,
} from "react";

function applyThemeLanguageFromStorage(userId: string | undefined): void {
  if (!userId) {
    document.documentElement.lang = "en";
    document.documentElement.dataset.theme = "light";
    document.body.dataset.theme = "light";
    document.documentElement.style.colorScheme = "light";
    document.body.classList.remove("theme-light", "theme-dark");
    document.body.classList.add("theme-light");
    return;
  }

  try {
    const raw = localStorage.getItem(`jf_settings_${userId}`);
    if (!raw) {
      document.documentElement.lang = "en";
      document.documentElement.dataset.theme = "light";
      document.body.dataset.theme = "light";
      document.documentElement.style.colorScheme = "light";
      document.body.classList.remove("theme-light", "theme-dark");
      document.body.classList.add("theme-light");
      return;
    }

    const parsed = JSON.parse(raw) as {
      theme?: "light" | "dark" | "system";
      language?: "English" | "French";
    };

    const theme = parsed.theme ?? "system";
    const resolvedTheme =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme;

    document.documentElement.lang = parsed.language === "French" ? "fr" : "en";
    document.documentElement.dataset.theme = resolvedTheme;
    document.body.dataset.theme = resolvedTheme;
    document.documentElement.style.colorScheme = resolvedTheme;
    document.body.classList.remove("theme-light", "theme-dark");
    document.body.classList.add(
      resolvedTheme === "dark" ? "theme-dark" : "theme-light",
    );
  } catch {
    document.documentElement.lang = "en";
    document.documentElement.dataset.theme = "light";
    document.body.dataset.theme = "light";
    document.documentElement.style.colorScheme = "light";
    document.body.classList.remove("theme-light", "theme-dark");
    document.body.classList.add("theme-light");
  }
}

import Header from "./Header";
import Footer from "./Footer";

import LandingPage from "./LandingPage";
import AboutPage from "./Aboutpage";
import ContactPage from "./Contactpage";
import FAQPage from "./FAQPage";

import RoleGate from "./RoleGate";
import AppShell from "./AppShell";
import OnboardingQuestionnaire from "./OnboardingQuestionnaire";
import AIChatbot from "./chatbot/AIChatbot";

import type { UserAccount } from "./types";

import {
  getCurrentUser,
  logoutUser,
} from "./authStorage";

export type Page =
  | "home"
  | "about"
  | "contact"
  | "faq";

export default function App(): JSX.Element {
  const [
    currentPage,
    setCurrentPage,
  ] = useState<Page>("home");

  const [
    currentUser,
    setCurrentUser,
  ] = useState<UserAccount | null>(
    () => getCurrentUser()
  );

  const [
    authOpen,
    setAuthOpen,
  ] = useState(false);

  const [guestChatbotOpen, setGuestChatbotOpen] = useState(false);

  const [
    authStep,
    setAuthStep,
  ] = useState<
    "login" | "register"
  >("login");

  const goHome = (): void => {
    setCurrentPage("home");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const goAbout = (): void => {
    setCurrentPage("about");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const goContact = (): void => {
    setCurrentPage("contact");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const goFAQ = (): void => {
    setCurrentPage("faq");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const refreshUser =
      (): void => {
        setCurrentUser(
          getCurrentUser()
        );
      };

    const refreshAppearance = (): void => {
      applyThemeLanguageFromStorage(currentUser?.id);
    };

    window.addEventListener(
      "jf-auth-updated",
      refreshUser
    );

    window.addEventListener(
      "jf-settings-updated",
      refreshAppearance
    );

    refreshAppearance();

    return () => {
      window.removeEventListener(
        "jf-auth-updated",
        refreshUser
      );
      window.removeEventListener(
        "jf-settings-updated",
        refreshAppearance
      );
    };
  }, [currentUser?.id]);

  const openLogin = (): void => {
    setAuthStep("login");
    setAuthOpen(true);
  };

  const openRegister = (): void => {
    setAuthStep("register");
    setAuthOpen(true);
  };

  const handleAuthSuccess = (
    user: UserAccount
  ): void => {
    setCurrentUser(user);
    setAuthOpen(false);
  };

  const handleLogout = (): void => {
    logoutUser();

    setCurrentUser(null);

    setCurrentPage("home");
  };

  const handleBrowseJobs =
    (): void => {
      openLogin();
    };

  /*
   * ==========================================================
   * AUTHENTICATED USER
   * ==========================================================
   */

  if (currentUser) {
    /*
     * New user:
     * questionnaire first.
     */
    if (
      !currentUser.onboardingCompleted
    ) {
      return (
        <OnboardingQuestionnaire
          user={currentUser}
          onComplete={(
            updatedUser
          ) => {
            setCurrentUser(
              updatedUser
            );
          }}
        />
      );
    }

    /*
     * Completed user:
     *
     * role === "seeker"
     * -> Job Seeker AppShell
     *
     * role === "recruiter"
     * -> Recruiter AppShell
     */
    return (
      <AppShell
        user={currentUser}
        onUserUpdate={(
          updatedUser
        ) => {
          setCurrentUser(
            updatedUser
          );
        }}
        onLogout={
          handleLogout
        }
      />
    );
  }

  /*
   * ==========================================================
   * GUEST WEBSITE
   * ==========================================================
   */

  const renderPage =
    (): JSX.Element => {
      switch (
        currentPage
      ) {
        case "about":
          return <AboutPage />;

        case "contact":
          return <ContactPage />;

        case "faq":
          return <FAQPage />;

        case "home":
        default:
          /*
           * DO NOT MODIFY LANDING PAGE.
           */
          return (
            <LandingPage
              onBrowseJobs={
                handleBrowseJobs
              }
              onOpenGate={() =>
                openLogin()
              }
              onGetStarted={() =>
                openRegister()
              }
            />
          );
      }
    };

  return (
    <div className="app">

      <Header
        onLoginClick={
          openLogin
        }
        onSignUpClick={
          openRegister
        }
        onLogoClick={
          goHome
        }
        onFaqClick={
          goFAQ
        }
        onAboutClick={
          goAbout
        }
        onContactClick={
          goContact
        }
        isAuthenticated={
          false
        }
        onDashboardClick={() => {}}
        onLogout={
          handleLogout
        }
      />

      <div className="app-content">
        {renderPage()}
      </div>

      <Footer />

      <RoleGate
        open={authOpen}
        onClose={() =>
          setAuthOpen(false)
        }
        initialStep={
          authStep
        }
        onAuthSuccess={
          handleAuthSuccess
        }
      />

      {/* Floating AI Chatbot trigger for Visitors */}
      <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 9999 }}>
        {!guestChatbotOpen ? (
          <button
            onClick={() => setGuestChatbotOpen(true)}
            style={{
              background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
              color: "#ffffff",
              border: "none",
              borderRadius: "30px",
              padding: "12px 20px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            🤖 Chat with AI Assistant
          </button>
        ) : (
          <AIChatbot
            isOpen={guestChatbotOpen}
            onClose={() => setGuestChatbotOpen(false)}
            userRole="visitor"
            userName="Guest Visitor"
          />
        )}
      </div>
    </div>
  );
}