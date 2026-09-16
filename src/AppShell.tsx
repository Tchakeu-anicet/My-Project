import {
  useState,
  useEffect,
  useMemo,
  type JSX,
} from "react";

import type { UserAccount } from "./types";
import "./AppShell.css";

// Shared Data and Store Utility Imports
import { JOBS_DATABASE } from "./data/jobsData";
import { getApplications, createApplication } from "./data/applicationsStore";

// Section Component Imports
import DashboardSection from "./dashboard/DashboardSection";
import JobsSection from "./jobs/JobsSection";
import SavedJobsSection from "./saved/SavedJobsSection";
import ApplicationsSection from "./applications/ApplicationsSection";
import MessagesSection from "./messages/MessagesSection";
import ProfileSection from "./profile/ProfileSection";
import RecruiterProfileSection from "./recruiter/RecruiterProfileSection";
import PostJobSection from "./post-job/PostJobSection";
import CandidatesSection from "./candidates/CandidatesSection";
import SettingsSection from "./settings/SettingsSection";
import AdminDashboard from "./admin/AdminDashboard";
import PremiumSubscriptionModal from "./payments/PremiumSubscriptionModal";
import AIChatbot from "./chatbot/AIChatbot";

type AppSection =
  | "dashboard"
  | "jobs"
  | "saved"
  | "applications"
  | "messages"
  | "profile"
  | "settings"
  | "post-job"
  | "candidates"
  | "admin-control";

interface AppShellProps {
  user: UserAccount;
  onUserUpdate?: (user: UserAccount) => void;
  onLogout: () => void;
}

interface NavigationItem {
  id: AppSection;
  label: string;
  icon: string;
}

const pageInformation: Record<
  AppSection,
  {
    eyebrow: string;
    title: string;
    description: string;
  }
> = {
  dashboard: {
    eyebrow: "DASHBOARD",
    title: "Overview",
    description: "Welcome to your JobFind workspace.",
  },
  jobs: {
    eyebrow: "JOB SEARCH",
    title: "Find your next opportunity",
    description: "Explore jobs that match your skills, experience and career goals.",
  },
  saved: {
    eyebrow: "SAVED OPPORTUNITIES",
    title: "Opportunities you've saved",
    description: "Keep track of jobs you want to apply to or revisit later.",
  },
  applications: {
    eyebrow: "APPLICATIONS",
    title: "Track your activity",
    description: "Manage applications, status changes, and communication with other members.",
  },
  messages: {
    eyebrow: "ALERTS & NOTIFICATIONS",
    title: "Your notifications",
    description: "Stay updated on recent events, feedback, and decisions.",
  },
  profile: {
    eyebrow: "USER PROFILE",
    title: "Your professional workspace details",
    description: "Keep your professional details complete and accurate.",
  },
  settings: {
    eyebrow: "ACCOUNT SETTINGS",
    title: "Preferences & security",
    description: "Customize notifications, localization, appearance, and credentials.",
  },
  "post-job": {
    eyebrow: "PUBLISH OPPORTUNITIES",
    title: "Post a Job",
    description: "Create new job postings to attract qualified workers and seekers.",
  },
  candidates: {
    eyebrow: "TALENT ACQUISITION",
    title: "Find Candidates",
    description: "Browse seeker profiles and discover talent matching your needs.",
  },
  "admin-control": {
    eyebrow: "ADMINISTRATION",
    title: "System Control & Moderation",
    description: "Platform analytics, user moderation, job oversight, and reports.",
  },
};

export default function AppShell({
  user,
  onUserUpdate,
  onLogout,
}: AppShellProps): JSX.Element {
  const [activeSection, setActiveSection] = useState<AppSection>(
    user.role === "admin" ? "admin-control" : "dashboard"
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);

  // States synchronized with Local Storage
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("jf_saved_jobs");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [applications, setApplications] = useState(() => getApplications());

  const [postedJobs, setPostedJobs] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("jf_posted_jobs");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sync state changes with updates from child sections or external storage operations
  useEffect(() => {
    const handleAppsUpdate = () => {
      setApplications(getApplications());
    };
    const handleSavedJobsUpdate = () => {
      try {
        const stored = localStorage.getItem("jf_saved_jobs");
        setSavedJobIds(stored ? JSON.parse(stored) : []);
      } catch {
        setSavedJobIds([]);
      }
    };
    const handlePostedJobsUpdate = () => {
      try {
        const stored = localStorage.getItem("jf_posted_jobs");
        setPostedJobs(stored ? JSON.parse(stored) : []);
      } catch {
        setPostedJobs([]);
      }
    };
    const handleOpenPremiumModal = () => {
      setPremiumModalOpen(true);
    };

    window.addEventListener("jf-applications-updated", handleAppsUpdate);
    window.addEventListener("jf-saved-jobs-updated", handleSavedJobsUpdate);
    window.addEventListener("jf-open-premium-modal", handleOpenPremiumModal);
    window.addEventListener("storage", () => {
      handleAppsUpdate();
      handleSavedJobsUpdate();
      handlePostedJobsUpdate();
    });

    return () => {
      window.removeEventListener("jf-applications-updated", handleAppsUpdate);
      window.removeEventListener("jf-saved-jobs-updated", handleSavedJobsUpdate);
      window.removeEventListener("jf-open-premium-modal", handleOpenPremiumModal);
    };
  }, []);

  const navigate = (section: AppSection): void => {
    setActiveSection(section);
    setSidebarOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleLogout = (): void => {
    setSidebarOpen(false);
    onLogout();
  };

  const handleApply = (job: any): void => {
    const app = createApplication({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
    });

    if (app) {
      window.dispatchEvent(new Event("jf-applications-updated"));
      alert("Application submitted successfully!");
    } else {
      alert("You have already applied for this position.");
    }
  };

  const handleToggleSave = (jobId: string): void => {
    const nextSaved = savedJobIds.includes(jobId)
      ? savedJobIds.filter((id) => id !== jobId)
      : [...savedJobIds, jobId];
    
    setSavedJobIds(nextSaved);
    localStorage.setItem("jf_saved_jobs", JSON.stringify(nextSaved));
    window.dispatchEvent(new Event("jf-saved-jobs-updated"));
  };

  const handlePostJob = (newJob: any): void => {
    const profileCategory =
      user.recruiterProfile.workerCategories?.[0]?.name ||
      user.recruiterProfile.industry ||
      user.recruiterProfile.recruitmentPurpose ||
      "General Services";

    const nextJob = {
      ...newJob,
      category: newJob.category || profileCategory,
      id: `posted-${Date.now()}`,
      applicants: 0,
      recruiterName: user.fullName,
      recruiterType: user.recruiterProfile.recruiterType === "company" ? "company" : "individual"
    };

    const nextPosted = [nextJob, ...postedJobs];
    setPostedJobs(nextPosted);
    localStorage.setItem("jf_posted_jobs", JSON.stringify(nextPosted));
    
    alert("Job published successfully!");
  };

  const handleDeletePostedJob = (jobId: string): void => {
    const nextPosted = postedJobs.filter((job) => job.id !== jobId);
    setPostedJobs(nextPosted);
    localStorage.setItem("jf_posted_jobs", JSON.stringify(nextPosted));
  };

  const handleUpdatePostedJob = (jobId: string, updates: Partial<any>): void => {
    const nextPosted = postedJobs.map((job) =>
      job.id === jobId ? { ...job, ...updates } : job
    );
    setPostedJobs(nextPosted);
    localStorage.setItem("jf_posted_jobs", JSON.stringify(nextPosted));
  };

  const currentPage = pageInformation[activeSection] || pageInformation["dashboard"];

  const discoverableJobs = useMemo(() => {
    const seekerKeywords = [
      ...(user.seekerProfile.jobCategories ?? []).map((item) => item.name.toLowerCase()),
      ...(user.seekerProfile.customJobCategories ?? []).map((item) => item.toLowerCase()),
      ...(user.seekerProfile.workTypes ?? []).map((item) => item.toLowerCase()),
    ];

    if (user.role !== "seeker" || seekerKeywords.length === 0) {
      return JOBS_DATABASE;
    }

    return [...JOBS_DATABASE].sort((a, b) => {
      const aText = `${a.title} ${a.company} ${a.category} ${a.description} ${a.location}`.toLowerCase();
      const bText = `${b.title} ${b.company} ${b.category} ${b.description} ${b.location}`.toLowerCase();
      const aMatches = seekerKeywords.filter((keyword) => aText.includes(keyword)).length;
      const bMatches = seekerKeywords.filter((keyword) => bText.includes(keyword)).length;
      return bMatches - aMatches;
    });
  }, [user]);

  // Dynamic Navigation Items based on User Role
  const navigationItems: NavigationItem[] = user.role === "admin"
    ? [
        { id: "admin-control", label: "Admin Control", icon: "📊" },
        { id: "messages", label: "Notifications & System", icon: "✉" },
        { id: "settings", label: "Settings", icon: "⚙" },
      ]
    : user.role === "recruiter"
    ? [
        { id: "dashboard", label: "Dashboard", icon: "⌂" },
        { id: "post-job", label: "Post a Job", icon: "➕" },
        { id: "applications", label: "Manage Applications", icon: "📋" },
        { id: "candidates", label: "Find Candidates", icon: "👥" },
        { id: "messages", label: "Messages", icon: "✉" },
        { id: "profile", label: "My Profile", icon: "◎" },
        { id: "settings", label: "Settings", icon: "⚙" },
      ]
    : [
        { id: "dashboard", label: "Dashboard", icon: "⌂" },
        { id: "jobs", label: "Find Jobs", icon: "⌕" },
        { id: "saved", label: "Saved Jobs", icon: "♡" },
        { id: "applications", label: "Applications", icon: "📋" },
        { id: "messages", label: "Messages", icon: "✉" },
        { id: "profile", label: "My Profile", icon: "◎" },
        { id: "settings", label: "Settings", icon: "⚙" },
      ];

  const renderMainContent = (): JSX.Element => {
    switch (activeSection) {
      case "admin-control":
        return <AdminDashboard currentUser={user} />;

      case "jobs":
        return (
          <JobsSection
            jobs={discoverableJobs}
            applications={applications}
            savedIds={savedJobIds}
            onApply={handleApply}
            onToggleSave={handleToggleSave}
          />
        );

      case "saved":
        return (
          <SavedJobsSection
            jobs={JOBS_DATABASE}
            savedIds={savedJobIds}
            applications={applications}
            onToggleSave={handleToggleSave}
            onApply={handleApply}
          />
        );

      case "applications":
        return <ApplicationsSection role={user.role} />;

      case "messages":
        return <MessagesSection user={user} />;

      case "profile":
        if (user.role === "recruiter") {
          return (
            <RecruiterProfileSection
              user={user}
              onUserUpdated={onUserUpdate ?? (() => {})}
            />
          );
        }
        return (
          <ProfileSection
            user={user}
            onUserUpdated={onUserUpdate ?? (() => {})}
          />
        );

      case "post-job":
        return (
          <PostJobSection
            jobs={postedJobs}
            onPost={handlePostJob}
            onDeleteJob={handleDeletePostedJob}
            onUpdateJob={handleUpdatePostedJob}
            recruiterName={user.fullName}
            recruiterType={user.recruiterProfile.recruiterType === "company" ? "company" : "individual"}
          />
        );

      case "candidates":
        return <CandidatesSection />;

      case "settings":
        return (
          <SettingsSection
            user={user}
            onUserUpdated={onUserUpdate}
          />
        );

      case "dashboard":
      default:
        return (
          <DashboardSection
            user={user}
            onNavigate={navigate}
          />
        );
    }
  };

  return (
    <div className="jf-app-shell">
      {/* MOBILE OVERLAY */}
      <div
        className={sidebarOpen ? "jf-overlay open" : "jf-overlay"}
        onClick={() => setSidebarOpen(false)}
      />

      {/* SIDEBAR */}
      <aside className={sidebarOpen ? "jf-sidebar open" : "jf-sidebar"}>
        {/* BRAND */}
        <div className="jf-brand">
          <button
            type="button"
            className="jf-brand-button"
            onClick={() => navigate("dashboard")}
          >
            <span className="jf-brand-mark">J</span>
            <span className="jf-brand-name">
              <strong>job</strong>
              <b>find</b>
              <strong>.</strong>
            </span>
          </button>
        </div>

        {/* USER ROLE */}
        <div className="jf-role">
          <span className="jf-role-dot">●</span>
          <span>{user.role === "recruiter" ? "Recruiter" : "Job Seeker"}</span>
        </div>

        {/* NAVIGATION */}
        <nav className="jf-sidebar-nav">
          {navigationItems.map((item) => (
            <SidebarButton
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeSection === item.id}
              onClick={() => navigate(item.id)}
            />
          ))}
        </nav>

        {/* SIDEBAR FOOTER */}
        <div className="jf-sidebar-footer">
          <button
            type="button"
            className="jf-logout"
            onClick={handleLogout}
          >
            <span>↪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="jf-main">
        {/* TOPBAR */}
        <header className="jf-topbar">
          <div className="jf-top-left">
            <button
              type="button"
              className="jf-mobile-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Open navigation"
              aria-expanded={sidebarOpen}
            >
              ☰
            </button>

            <div className="jf-page-title">
              <span>{currentPage.eyebrow}</span>
              <h1>{currentPage.title}</h1>
            </div>
          </div>

          <div className="jf-top-actions">
            <button
              type="button"
              className="jf-ai-chatbot-btn"
              onClick={() => setChatbotOpen(true)}
              title="Launch AI Career Assistant"
            >
              🤖 AI Bot
            </button>

            {user.role !== "admin" && (
              <button
                type="button"
                className={`jf-premium-btn ${user.isPremium ? "is-active" : ""}`}
                onClick={() => setPremiumModalOpen(true)}
              >
                {user.isPremium ? "⭐ Premium Active" : "⭐ Go Premium"}
              </button>
            )}

            <button
              type="button"
              className="jf-notification-button"
              aria-label="Notifications"
              onClick={() => navigate("messages")}
            >
              ✉
              <span className="jf-notification-dot" />
            </button>

            <div className="jf-user">
              <div className="jf-user-avatar">
                {getInitials(user.fullName)}
              </div>

              <div className="jf-user-info">
                <strong>{user.fullName}</strong>
                <span>{user.role === "admin" ? "System Admin" : user.role === "recruiter" ? "Recruiter" : "Job Seeker"}</span>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="jf-content">
          {activeSection !== "dashboard" &&
            activeSection !== "settings" && (
              <div className="jf-content-intro">
                <div>
                  <span>{currentPage.eyebrow}</span>
                  <h2>{currentPage.title}</h2>
                  <p>{currentPage.description}</p>
                </div>
              </div>
            )}

          {renderMainContent()}
        </main>
      </div>

      {/* PREMIUM SUBSCRIPTION MODAL */}
      <PremiumSubscriptionModal
        isOpen={premiumModalOpen}
        onClose={() => setPremiumModalOpen(false)}
        user={user}
        onSuccess={(updatedUser) => {
          if (onUserUpdate) onUserUpdate(updatedUser);
        }}
      />

      {/* AI CHATBOT WIDGET */}
      <AIChatbot
        isOpen={chatbotOpen}
        onClose={() => setChatbotOpen(false)}
        userRole={user.role}
        userName={user.fullName}
      />
    </div>
  );
}

/* =========================================================
   SIDEBAR BUTTON
========================================================= */

interface SidebarButtonProps {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}

function SidebarButton({
  icon,
  label,
  active,
  onClick,
}: SidebarButtonProps): JSX.Element {
  return (
    <button
      type="button"
      className={active ? "jf-nav-btn active" : "jf-nav-btn"}
      onClick={onClick}
    >
      <span className="jf-nav-icon">{icon}</span>
      <span className="jf-nav-label">{label}</span>
      {active && <span className="jf-nav-indicator">›</span>}
    </button>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "JF";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}