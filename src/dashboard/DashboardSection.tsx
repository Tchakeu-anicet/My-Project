import {
  useMemo,
  useRef,
  useState,
  useEffect,
  type JSX,
} from "react";

import type { UserAccount } from "../types";
import { getApplications, getNotifications } from "../data/applicationsStore";
import { JOBS_DATABASE } from "../data/jobsData";

import "./DashboardSection.css";

type DashboardNavigation =
  | "dashboard"
  | "jobs"
  | "saved"
  | "applications"
  | "profile"
  | "settings"
  | "messages"
  | "candidates"
  | "post-job";

interface DashboardSectionProps {
  user: UserAccount;
  onNavigate: (section: DashboardNavigation) => void;
}

interface PostedJob {
  id: string;
  title: string;
  applicants: number;
  location: string;
  employmentType: string;
  description: string;
}

export default function DashboardSection({
  user,
  onNavigate,
}: DashboardSectionProps): JSX.Element {
  const isRecruiter = user.role === "recruiter";

  // Seeker & Recruiter Data Synchronization from Local Storage
  const [applications, setApplications] = useState(() => getApplications());
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("jf_saved_jobs");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [postedJobs, setPostedJobs] = useState<PostedJob[]>(() => {
    try {
      const stored = localStorage.getItem("jf_posted_jobs");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [notifications, setNotifications] = useState(() => getNotifications());
  const [searchTerm, setSearchTerm] = useState("");

  const resumeInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state with events
  useEffect(() => {
    const handleAppsUpdate = () => {
      setApplications(getApplications());
    };
    const handleNotifsUpdate = () => {
      setNotifications(getNotifications());
    };
    const handlePostedJobsUpdate = () => {
      try {
        const stored = localStorage.getItem("jf_posted_jobs");
        setPostedJobs(stored ? JSON.parse(stored) : []);
      } catch {
        setPostedJobs([]);
      }
    };

    window.addEventListener("jf-applications-updated", handleAppsUpdate);
    window.addEventListener("jf-notifications-updated", handleNotifsUpdate);
    // Custom trigger when recruiter posts a job
    window.addEventListener("storage", handlePostedJobsUpdate);

    return () => {
      window.removeEventListener("jf-applications-updated", handleAppsUpdate);
      window.removeEventListener("jf-notifications-updated", handleNotifsUpdate);
      window.removeEventListener("storage", handlePostedJobsUpdate);
    };
  }, []);

  // Seeker Metrics Calculation
  const profileCompletion = user.seekerProfile.completed ? 100 : 75;
  const matchingJobs = useMemo(() => {
    // Filter matching category
    const userPrefNames = (user.seekerProfile.jobCategories ?? []).map((cat) => cat.name.toLowerCase());
    return JOBS_DATABASE.filter((job) =>
      userPrefNames.some((pref) => job.category.toLowerCase().includes(pref) || job.title.toLowerCase().includes(pref))
    ).length || 5;
  }, [user.seekerProfile.jobCategories]);

  const applicationsSent = applications.length;
  const inReviewOrInterview = applications.filter(
    (app) => app.status === "pending"
  ).length;
  const offersClosed = applications.filter(
    (app) => app.status === "validated" || app.status === "rejected"
  ).length;

  // Recruiter Metrics Calculation
  const activePostingsCount = postedJobs.length;
  const totalApplicantsCount = applications.length;
  const pendingReviewsCount = applications.filter((app) => app.status === "pending").length;
  const processedReviewsCount = applications.filter((app) => app.status === "validated" || app.status === "rejected").length;

  const handleSearch = (): void => {
    onNavigate("jobs");
  };

  const handleUploadResume = (): void => {
    resumeInputRef.current?.click();
  };

  const handleResumeSelected = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = event.target.files?.[0];
    if (!file) return;
    alert(`"${file.name}" uploaded successfully. Profile completeness updated!`);
    event.target.value = "";
  };

  const toggleSavedJob = (jobId: string): void => {
    const nextSaved = savedJobIds.includes(jobId)
      ? savedJobIds.filter((id) => id !== jobId)
      : [...savedJobIds, jobId];
    setSavedJobIds(nextSaved);
    localStorage.setItem("jf_saved_jobs", JSON.stringify(nextSaved));
    window.dispatchEvent(new Event("jf-saved-jobs-updated"));
  };

  const handleWithdraw = (applicationId: string): void => {
    const confirmed = window.confirm("Are you sure you want to withdraw this application?");
    if (!confirmed) return;

    const updated = applications.filter((app) => app.id !== applicationId);
    setApplications(updated);
    localStorage.setItem("jf_applications", JSON.stringify(updated));
    window.dispatchEvent(new Event("jf-applications-updated"));
  };

  // Seeker Welcome Hero Rendering
  const renderSeekerHero = () => (
    <div className="dashboard-hero">
      <div className="dashboard-hero-content">
        <span className="dashboard-eyebrow">JOB SEEKER DASHBOARD</span>
        <h1>Welcome back, {getFirstName(user.fullName)}.</h1>
        <p>
          Discover opportunities, manage your applications and keep your career moving forward.
        </p>

        <div className="dashboard-hero-actions">
          <button type="button" className="dashboard-primary-btn" onClick={handleSearch}>
            <span>⌕</span> Search Jobs
          </button>

          <button type="button" className="dashboard-light-btn" onClick={handleUploadResume}>
            <span>⇧</span> Upload Resume
          </button>
        </div>
      </div>

      <div className="dashboard-profile-progress">
        <div className="profile-progress-top">
          <div>
            <span>PROFILE COMPLETENESS</span>
            <strong>{profileCompletion}%</strong>
          </div>
          <div className="profile-progress-circle">{profileCompletion}%</div>
        </div>

        <div className="profile-progress-track">
          <div
            className="profile-progress-fill"
            style={{ width: `${profileCompletion}%` }}
          />
        </div>
        <p>Add your resume and complete your profile to improve employer matches.</p>
        <button type="button" onClick={() => onNavigate("profile")}>
          Complete profile →
        </button>
      </div>
    </div>
  );

  // Recruiter Welcome Hero Rendering
  const renderRecruiterHero = () => {
    const company = user.recruiterProfile.companyName || "Your business";
    return (
      <div className="dashboard-hero recruiter">
        <div className="dashboard-hero-content">
          <span className="dashboard-eyebrow">RECRUITER WORKSPACE</span>
          <h1>Welcome back, {getFirstName(user.fullName)}.</h1>
          <p>
            Manage candidate submissions, publish open positions at <strong>{company}</strong>, and scout top talent.
          </p>

          <div className="dashboard-hero-actions">
            <button type="button" className="dashboard-primary-btn" onClick={() => onNavigate("post-job")}>
              <span>➕</span> Post a Job
            </button>

            <button type="button" className="dashboard-light-btn" onClick={() => onNavigate("candidates")}>
              <span>👥</span> Find Candidates
            </button>
          </div>
        </div>

        <div className="dashboard-profile-progress recruiter-summary">
          <h3>Workplace Details</h3>
          <div className="workplace-meta-item">
            <span>Company Name:</span> <strong>{company}</strong>
          </div>
          <div className="workplace-meta-item">
            <span>Location:</span> <strong>{user.recruiterProfile.companyLocation || user.city || "Not set"}</strong>
          </div>
          <div className="workplace-meta-item">
            <span>Recruiter Type:</span> <strong>{user.recruiterProfile.recruiterType || "Individual"}</strong>
          </div>
          <button type="button" onClick={() => onNavigate("profile")}>
            Edit workplace details →
          </button>
        </div>
      </div>
    );
  };

  // Seeker Metrics Row
  const renderSeekerMetrics = () => (
    <div className="dashboard-metrics">
      <MetricCard
        icon="⌕"
        label="Matching Jobs"
        value={matchingJobs}
        description="Opportunities matching your profile"
        tone="blue"
        onClick={() => onNavigate("jobs")}
      />
      <MetricCard
        icon="✓"
        label="Applications Sent"
        value={applicationsSent}
        description="Applications submitted"
        tone="dark"
        onClick={() => onNavigate("applications")}
      />
      <MetricCard
        icon="◷"
        label="In Review / Interview"
        value={inReviewOrInterview}
        description="Active applications"
        tone="yellow"
        onClick={() => onNavigate("applications")}
      />
      <MetricCard
        icon="◆"
        label="Offers / Closed"
        value={offersClosed}
        description="Completed outcomes"
        tone="green"
        onClick={() => onNavigate("applications")}
      />
    </div>
  );

  // Recruiter Metrics Row
  const renderRecruiterMetrics = () => (
    <div className="dashboard-metrics">
      <MetricCard
        icon="📋"
        label="Active Postings"
        value={activePostingsCount}
        description="Positions currently published"
        tone="blue"
        onClick={() => onNavigate("post-job")}
      />
      <MetricCard
        icon="👥"
        label="Total Candidates"
        value={totalApplicantsCount}
        description="Total candidates applied"
        tone="dark"
        onClick={() => onNavigate("applications")}
      />
      <MetricCard
        icon="◷"
        label="Pending Reviews"
        value={pendingReviewsCount}
        description="Applications awaiting decision"
        tone="yellow"
        onClick={() => onNavigate("applications")}
      />
      <MetricCard
        icon="✓"
        label="Processed Applications"
        value={processedReviewsCount}
        description="Validated or rejected submissions"
        tone="green"
        onClick={() => onNavigate("applications")}
      />
    </div>
  );

  return (
    <section className="dashboard-section">
      <input
        ref={resumeInputRef}
        className="dashboard-hidden-file"
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleResumeSelected}
        style={{ display: "none" }}
      />

      {/* HERO SECTION */}
      {isRecruiter ? renderRecruiterHero() : renderSeekerHero()}

      {/* METRICS ROW */}
      {isRecruiter ? renderRecruiterMetrics() : renderSeekerMetrics()}

      {/* MAIN DASHBOARD GRID */}
      <div className="dashboard-main-grid">
        
        {/* PRIMARY COLUMN */}
        <div className="dashboard-primary-column">
          
          {/* SEEKER VIEW: ACTIVE APPLICATIONS */}
          {!isRecruiter && (
            <section className="dashboard-panel">
              <PanelHeader
                eyebrow="APPLICATIONS"
                title="Active Applications"
                description="Keep track of your latest applications and their progress."
                actionLabel="View all"
                onAction={() => onNavigate("applications")}
              />

              {applications.length === 0 ? (
                <EmptyState
                  icon="📋"
                  title="No active applications"
                  description="Start applying to jobs that match your profile."
                  buttonLabel="Find jobs"
                  onClick={() => onNavigate("jobs")}
                />
              ) : (
                <div className="applications-list">
                  {applications.slice(0, 3).map((app) => (
                    <article className="application-row" key={app.id}>
                      <div className="application-company-logo">
                        {app.company.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="application-main">
                        <h3>{app.jobTitle}</h3>
                        <p>{app.company}</p>
                        <div className="application-meta">
                          <span>⌖ {app.location}</span>
                          <span>◷ {new Date(app.appliedAt).toLocaleDateString()}</span>
                          <span>◈ {app.salary}</span>
                        </div>
                      </div>
                      <div className="application-status-area">
                        <span className={`application-status ${app.status}`}>
                          {app.status}
                        </span>
                      </div>
                      <div className="application-actions">
                        <button
                          type="button"
                          onClick={() => onNavigate("applications")}
                          className="application-view-btn"
                        >
                          View
                        </button>
                        {app.status === "pending" && (
                          <button
                            type="button"
                            onClick={() => handleWithdraw(app.id)}
                            className="application-withdraw-btn"
                          >
                            Withdraw
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* RECRUITER VIEW: RECENT APPLICATIONS RECEIVED */}
          {isRecruiter && (
            <section className="dashboard-panel">
              <PanelHeader
                eyebrow="RECRUITMENT ACTIVITY"
                title="Recent Applicant Submissions"
                description="Review submissions from candidates looking to join your company."
                actionLabel="Manage all"
                onAction={() => onNavigate("applications")}
              />

              {applications.length === 0 ? (
                <EmptyState
                  icon="👥"
                  title="No candidate applications yet"
                  description="Candidates will appear here when they apply to your jobs."
                  buttonLabel="View Candidates list"
                  onClick={() => onNavigate("candidates")}
                />
              ) : (
                <div className="applications-list">
                  {applications.slice(0, 3).map((app) => (
                    <article className="application-row" key={app.id}>
                      <div className="application-company-logo">JS</div>
                      <div className="application-main">
                        <span className="application-kicker">CANDIDATE SUBMISSION</span>
                        <h3>{app.jobTitle}</h3>
                        <p>{app.company} · {app.location}</p>
                        <div className="application-meta">
                          <span>Applied on {new Date(app.appliedAt).toLocaleDateString()}</span>
                          <span>◈ {app.salary}</span>
                        </div>
                      </div>
                      <div className="application-status-area">
                        <span className={`application-status ${app.status}`}>
                          {app.status}
                        </span>
                      </div>
                      <div className="application-actions">
                        <button
                          type="button"
                          onClick={() => onNavigate("applications")}
                          className="application-view-btn"
                        >
                          Process
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* SEEKER VIEW: RECOMMENDED JOBS */}
          {!isRecruiter && (
            <section className="dashboard-panel">
              <PanelHeader
                eyebrow="FOR YOU"
                title="Recommended Jobs"
                description="Opportunities selected based on your profile and preferences."
                actionLabel="Explore all"
                onAction={() => onNavigate("jobs")}
              />

              <div className="dashboard-search-row">
                <div className="dashboard-search-box">
                  <span>⌕</span>
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search recommended jobs..."
                  />
                </div>
                <button type="button" onClick={handleSearch}>
                  Search
                </button>
              </div>

              <div className="recommended-jobs">
                {JOBS_DATABASE.filter(
                  (job) =>
                    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    job.company.toLowerCase().includes(searchTerm.toLowerCase())
                )
                  .slice(0, 3)
                  .map((job) => (
                    <article className="recommended-job-card" key={job.id}>
                      <div className="recommended-job-top">
                        <div className="recommended-company-logo">
                          {job.company.slice(0, 2).toUpperCase()}
                        </div>
                        <button
                          type="button"
                          className={`job-save-btn ${savedJobIds.includes(job.id) ? "saved" : ""}`}
                          onClick={() => toggleSavedJob(job.id)}
                          aria-label="Save job"
                        >
                          {savedJobIds.includes(job.id) ? "♥" : "♡"}
                        </button>
                      </div>
                      <span className="recommended-category">{job.category}</span>
                      <h3>{job.title}</h3>
                      <p className="recommended-company">{job.company}</p>
                      <div className="recommended-meta">
                        <span>⌖ {job.location}</span>
                        <span>◷ {job.type}</span>
                      </div>
                      <div className="recommended-bottom">
                        <strong>{job.salary}</strong>
                        <button type="button" onClick={() => onNavigate("jobs")}>
                          View →
                        </button>
                      </div>
                    </article>
                  ))}
              </div>
            </section>
          )}

          {/* RECRUITER VIEW: POSTED JOBS SUMMARY */}
          {isRecruiter && (
            <section className="dashboard-panel">
              <PanelHeader
                eyebrow="JOB MANAGER"
                title="Your Job Postings"
                description="Overview of the jobs you have published and the interest they generate."
                actionLabel="Create posting"
                onAction={() => onNavigate("post-job")}
              />

              {postedJobs.length === 0 ? (
                <EmptyState
                  icon="📋"
                  title="No jobs published yet"
                  description="Publish your first job position to start receiving applications."
                  buttonLabel="Post a Job"
                  onClick={() => onNavigate("post-job")}
                />
              ) : (
                <div className="recruiter-postings-list" style={{ display: "grid", gap: "12px" }}>
                  {postedJobs.slice(0, 4).map((job) => (
                    <div
                      key={job.id}
                      className="recruiter-job-row"
                      style={{
                        padding: "16px",
                        border: "1px solid var(--jf-border)",
                        borderRadius: "12px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: "var(--jf-white)",
                      }}
                    >
                      <div>
                        <h4 style={{ margin: "0 0 4px", fontSize: "16px" }}>{job.title}</h4>
                        <span style={{ fontSize: "12px", color: "var(--jf-muted)" }}>
                          {job.location} · {job.employmentType}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <span className="recruiter-applicants-count" style={{ fontWeight: 700, fontSize: "14px", color: "var(--jf-blue)" }}>
                          {applications.filter((app) => app.jobTitle.toLowerCase() === job.title.toLowerCase()).length} candidates
                        </span>
                        <button
                          type="button"
                          onClick={() => onNavigate("applications")}
                          style={{
                            border: "0",
                            background: "var(--jf-blue-light)",
                            color: "var(--jf-blue-dark)",
                            padding: "6px 12px",
                            borderRadius: "8px",
                            fontWeight: 700,
                            cursor: "pointer"
                          }}
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

        </div>

        {/* SIDEBAR COLUMN */}
        <aside className="dashboard-right-column">
          
          {/* MESSAGES & NOTIFICATIONS */}
          <section className="dashboard-side-panel">
            <div className="side-panel-header">
              <div>
                <span>COMMUNICATIONS</span>
                <h3>Recent Alerts</h3>
              </div>
              {notifications.filter((n) => !n.read).length > 0 && (
                <span className="unread-count">
                  {notifications.filter((n) => !n.read).length}
                </span>
              )}
            </div>

            <div className="message-list">
              {notifications.slice(0, 3).map((notif) => (
                <button
                  type="button"
                  key={notif.id}
                  className={`message-item ${!notif.read ? "unread" : ""}`}
                  onClick={() => onNavigate("messages")}
                >
                  <div className="message-icon info">🔔</div>
                  <div className="message-content">
                    <div className="message-title-row">
                      <strong>{notif.title}</strong>
                      {!notif.read && <span className="message-dot" />}
                    </div>
                    <p style={{ fontSize: "12px", color: "var(--jf-muted)", margin: "4px 0" }}>
                      {notif.message}
                    </p>
                    <small>{new Date(notif.createdAt).toLocaleDateString()}</small>
                  </div>
                </button>
              ))}
              {notifications.length === 0 && (
                <p style={{ textAlign: "center", color: "var(--jf-muted)", fontSize: "13px", padding: "10px" }}>
                  No recent alerts or messages.
                </p>
              )}
            </div>

            <button
              type="button"
              className="side-panel-link"
              onClick={() => onNavigate("messages")}
            >
              Open notifications →
            </button>
          </section>

          {/* UPCOMING INTERVIEWS / EVENTS */}
          <section className="dashboard-side-panel">
            <div className="side-panel-header">
              <div>
                <span>YOUR SCHEDULE</span>
                <h3>Upcoming Events</h3>
              </div>
            </div>

            <div className="event-list">
              <div className="event-item">
                <div className="event-date">
                  <strong>27</strong>
                  <span>Aug</span>
                </div>
                <div className="event-content">
                  <strong>Technical Chat</strong>
                  <span>CreativeLab</span>
                  <p>10:00 AM • Video interview</p>
                </div>
              </div>
              <div className="event-item">
                <div className="event-date">
                  <strong>29</strong>
                  <span>Aug</span>
                </div>
                <div className="event-content">
                  <strong>Design Check-in</strong>
                  <span>TechNova</span>
                  <p>02:30 PM • Online Meet</p>
                </div>
              </div>
            </div>
          </section>

          {/* QUICK TOOLS */}
          <section className="dashboard-side-panel">
            <div className="side-panel-header">
              <div>
                <span>PRODUCTIVITY</span>
                <h3>Quick Tools</h3>
              </div>
            </div>

            <div className="quick-tools">
              {!isRecruiter ? (
                <>
                  <QuickTool
                    icon="▣"
                    title="Update Resume"
                    description="Keep your CV current"
                    onClick={handleUploadResume}
                  />
                  <QuickTool
                    icon="◆"
                    title="Skill Assessment"
                    description="Showcase your skills"
                    onClick={() => alert("Skill assessments will be available here soon.")}
                  />
                  <QuickTool
                    icon="◎"
                    title="Portfolio"
                    description="Manage your profile"
                    onClick={() => onNavigate("profile")}
                  />
                </>
              ) : (
                <>
                  <QuickTool
                    icon="➕"
                    title="Publish Job"
                    description="Create new opportunities"
                    onClick={() => onNavigate("post-job")}
                  />
                  <QuickTool
                    icon="👥"
                    title="Search Talent"
                    description="Browse registered seekers"
                    onClick={() => onNavigate("candidates")}
                  />
                  <QuickTool
                    icon="⚙"
                    title="Settings"
                    description="Configure your workspace"
                    onClick={() => onNavigate("settings")}
                  />
                </>
              )}
            </div>
          </section>

          {/* PROFILE TIPS */}
          <section className="dashboard-profile-tip">
            <div className="profile-tip-icon">✦</div>
            <div>
              <strong>Improve your profile</strong>
              <p>
                Profiles with complete information and clear work preferences get 2x better matches.
              </p>
              <button type="button" onClick={() => onNavigate("profile")}>
                Improve profile →
              </button>
            </div>
          </section>

        </aside>
      </div>
    </section>
  );
}

/* =========================================================
   METRIC CARD
 ========================================================= */

function MetricCard({
  icon,
  label,
  value,
  description,
  tone,
  onClick,
}: {
  icon: string;
  label: string;
  value: number;
  description: string;
  tone: "blue" | "dark" | "yellow" | "green";
  onClick: () => void;
}): JSX.Element {
  return (
    <button
      type="button"
      className={`dashboard-metric-card ${tone}`}
      onClick={onClick}
      style={{
        border: "1px solid var(--jf-border)",
        background: "var(--jf-white)",
        borderRadius: "18px",
        padding: "18px",
        textAlign: "left",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
      }}
    >
      <div className="metric-top" style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
        <span className="metric-icon" style={{ fontSize: "20px" }}>{icon}</span>
        <span className="metric-arrow" style={{ opacity: 0.5 }}>→</span>
      </div>
      <span className="metric-label" style={{ fontSize: "11px", color: "var(--jf-muted)", fontWeight: 700, textTransform: "uppercase", marginTop: "10px" }}>
        {label}
      </span>
      <strong className="metric-value" style={{ fontSize: "32px", color: "var(--jf-black)", margin: "4px 0", lineHeight: 1 }}>
        {String(value).padStart(2, "0")}
      </strong>
      <span className="metric-description" style={{ fontSize: "11px", color: "var(--jf-muted)" }}>
        {description}
      </span>
    </button>
  );
}

/* =========================================================
   PANEL HEADER
 ========================================================= */

function PanelHeader({
  eyebrow,
  title,
  description,
  actionLabel,
  onAction,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}): JSX.Element {
  return (
    <div className="dashboard-panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "20px", width: "100%" }}>
      <div>
        <span style={{ fontSize: "10px", color: "var(--jf-blue)", fontWeight: 800, letterSpacing: "1.3px", textTransform: "uppercase" }}>{eyebrow}</span>
        <h2 style={{ margin: "4px 0", fontSize: "22px", fontWeight: 800 }}>{title}</h2>
        <p style={{ margin: 0, fontSize: "13px", color: "var(--jf-muted)" }}>{description}</p>
      </div>
      <button
        type="button"
        onClick={onAction}
        style={{
          border: 0,
          background: "transparent",
          color: "var(--jf-blue)",
          cursor: "pointer",
          fontWeight: 700,
          fontSize: "14px",
          padding: 0
        }}
      >
        {actionLabel} →
      </button>
    </div>
  );
}

/* =========================================================
   QUICK TOOL
 ========================================================= */

function QuickTool({
  icon,
  title,
  description,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
}): JSX.Element {
  return (
    <button
      type="button"
      className="quick-tool"
      onClick={onClick}
      style={{
        border: "1px solid var(--jf-border)",
        background: "#fbfcff",
        borderRadius: "12px",
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        textAlign: "left",
        cursor: "pointer",
        width: "100%",
        marginBottom: "8px",
        transition: "border-color 0.2s ease"
      }}
    >
      <span className="quick-tool-icon" style={{
        width: "36px",
        height: "36px",
        borderRadius: "10px",
        background: "var(--jf-blue-light)",
        color: "var(--jf-blue)",
        display: "grid",
        placeItems: "center",
        fontSize: "16px",
        fontWeight: 700
      }}>{icon}</span>
      <span className="quick-tool-text" style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
        <strong style={{ fontSize: "13px", color: "var(--jf-black)" }}>{title}</strong>
        <small style={{ fontSize: "11px", color: "var(--jf-muted)" }}>{description}</small>
      </span>
      <span className="quick-tool-arrow" style={{ color: "var(--jf-blue)" }}>→</span>
    </button>
  );
}

/* =========================================================
   EMPTY STATE
 ========================================================= */

function EmptyState({
  icon,
  title,
  description,
  buttonLabel,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  buttonLabel: string;
  onClick: () => void;
}): JSX.Element {
  return (
    <div className="dashboard-empty-state" style={{
      textAlign: "center",
      padding: "32px 16px",
      border: "1px dashed var(--jf-border)",
      borderRadius: "16px",
      background: "#fafbfc"
    }}>
      <div className="empty-state-icon" style={{
        width: "48px",
        height: "48px",
        borderRadius: "50%",
        background: "var(--jf-blue-light)",
        color: "var(--jf-blue)",
        display: "grid",
        placeItems: "center",
        fontSize: "20px",
        margin: "0 auto 12px"
      }}>{icon}</div>
      <h3 style={{ margin: "0 0 4px", fontSize: "16px" }}>{title}</h3>
      <p style={{ margin: "0 0 16px", fontSize: "13px", color: "var(--jf-muted)" }}>{description}</p>
      <button
        type="button"
        onClick={onClick}
        style={{
          border: 0,
          background: "var(--jf-blue)",
          color: "var(--jf-white)",
          padding: "8px 16px",
          borderRadius: "8px",
          fontWeight: 700,
          cursor: "pointer"
        }}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

/* =========================================================
   HELPERS
 ========================================================= */

function getFirstName(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed) return "there";
  return trimmed.split(/\s+/)[0];
}