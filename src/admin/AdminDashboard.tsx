import { useState, useEffect, type JSX } from "react";
import type { UserAccount, Job, ReportedContent, AccountStatus } from "../types";
import { getAllUsers, updateUserAccountStatus, deleteUserAccount } from "../authStorage";
import { JOBS_DATABASE } from "../data/jobsData";
import { getApplications } from "../data/applicationsStore";
import { getReportedContents, updateReportStatus } from "../data/reportsStore";
import "./AdminDashboard.css";

interface AdminDashboardProps {
  currentUser: UserAccount;
}

type AdminTab = "overview" | "users" | "jobs" | "employers" | "reports";

export default function AdminDashboard({ currentUser }: AdminDashboardProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applicationsCount, setApplicationsCount] = useState<number>(0);
  const [reports, setReports] = useState<ReportedContent[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [jobSearch, setJobSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");

  const refreshData = () => {
    const fetchedUsers = getAllUsers();
    setUsers(fetchedUsers);

    // Read stored jobs + default JOBS_DATABASE
    try {
      const stored = localStorage.getItem("jf_posted_jobs");
      const posted: Job[] = stored ? JSON.parse(stored) : [];
      const combinedJobs: Job[] = [
        ...posted,
        ...JOBS_DATABASE.map((j: any) => ({
          JobID: j.id,
          jobTitle: j.title,
          companyName: j.company,
          location: j.location,
          description: j.description || "",
          salary: parseFloat(j.salary ? j.salary.replace(/[^0-9.]/g, "") : "0") || 50000,
          status: "OPEN" as const,
          createdAt: j.postedAt || new Date().toISOString(),
          employmentType: j.type || "Full-time",
          deadline: "2026-12-31",
          requirements: Array.isArray(j.requirements) ? j.requirements.join(", ") : j.requirements || "Standard Requirements",
          category: j.category || "General",
          featured: Boolean(j.featured),
        })),
      ];
      setJobs(combinedJobs);
    } catch {
      setJobs([]);
    }

    const apps = getApplications();
    setApplicationsCount(apps.length);

    const repList = getReportedContents();
    setReports(repList);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleStatusChange = (userId: string, newStatus: AccountStatus) => {
    const updated = updateUserAccountStatus(userId, newStatus);
    if (updated) {
      setActionSuccessMsg(`User status updated to ${newStatus}`);
      refreshData();
      setTimeout(() => setActionSuccessMsg(""), 3000);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm("Are you sure you want to permanently delete this user account?")) {
      const success = deleteUserAccount(userId);
      if (success) {
        setActionSuccessMsg("User account deleted successfully.");
        refreshData();
        setTimeout(() => setActionSuccessMsg(""), 3000);
      }
    }
  };

  const handleResolveReport = (reportId: string, status: "RESOLVED" | "DISMISSED") => {
    const res = updateReportStatus(reportId, status);
    if (res) {
      setActionSuccessMsg(`Report ${reportId} marked as ${status}`);
      refreshData();
      setTimeout(() => setActionSuccessMsg(""), 3000);
    }
  };

  const handleVerifyEmployer = (userId: string, verified: boolean) => {
    const userToUpdate = users.find((u) => u.id === userId);
    if (userToUpdate && userToUpdate.recruiterProfile) {
      userToUpdate.recruiterProfile.verificationStatus = verified ? "verified" : "rejected";
      // Save back to local storage
      const all = getAllUsers();
      const idx = all.findIndex((u) => u.id === userId);
      if (idx !== -1) {
        all[idx] = userToUpdate;
        localStorage.setItem("jf_users", JSON.stringify(all));
        setActionSuccessMsg(`Employer ${verified ? "Verified" : "Rejected"}`);
        refreshData();
        setTimeout(() => setActionSuccessMsg(""), 3000);
      }
    }
  };

  // Filtered lists
  const filteredUsers = users.filter((u) => {
    const matchesQuery =
      u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.id.toLowerCase().includes(userSearch.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || u.accountStatus === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const employersList = users.filter((u) => u.role === "recruiter");

  const filteredJobs = jobs.filter((j) =>
    j.jobTitle.toLowerCase().includes(jobSearch.toLowerCase()) ||
    (j.companyName && j.companyName.toLowerCase().includes(jobSearch.toLowerCase()))
  );

  return (
    <div className="admin-dashboard-container">
      {/* Top Banner */}
      <div className="admin-header-card">
        <div className="admin-badge">SYSTEM CONTROL CENTER</div>
        <h1>Platform Monitoring & Administration</h1>
        <p>Welcome back, Administrator {currentUser.fullName} ({currentUser.adminProfile?.adminID || "ADM-001"})</p>
      </div>

      {actionSuccessMsg && <div className="admin-toast-success">{actionSuccessMsg}</div>}

      {/* Tabs Bar */}
      <div className="admin-nav-tabs">
        <button
          className={`admin-tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          📊 Activity & Analytics
        </button>
        <button
          className={`admin-tab-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          👥 Manage Users ({users.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === "jobs" ? "active" : ""}`}
          onClick={() => setActiveTab("jobs")}
        >
          💼 Manage Job Offers ({jobs.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === "employers" ? "active" : ""}`}
          onClick={() => setActiveTab("employers")}
        >
          🏢 Manage Employers ({employersList.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === "reports" ? "active" : ""}`}
          onClick={() => setActiveTab("reports")}
        >
          🚩 Reported Content ({reports.filter((r) => r.status === "PENDING").length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="admin-tab-body">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="admin-overview-grid">
            <div className="stat-widget blue">
              <span className="stat-icon">👥</span>
              <div>
                <h3>{users.length}</h3>
                <p>Total Registered Users</p>
              </div>
            </div>
            <div className="stat-widget green">
              <span className="stat-icon">💼</span>
              <div>
                <h3>{jobs.length}</h3>
                <p>Active Job Offers</p>
              </div>
            </div>
            <div className="stat-widget purple">
              <span className="stat-icon">📄</span>
              <div>
                <h3>{applicationsCount}</h3>
                <p>Total Submitted Applications</p>
              </div>
            </div>
            <div className="stat-widget gold">
              <span className="stat-icon">⭐</span>
              <div>
                <h3>{users.filter((u) => u.isPremium).length}</h3>
                <p>Premium Subscribers</p>
              </div>
            </div>

            <div className="admin-activity-card">
              <h3>System Health & Server Metrics</h3>
              <div className="metrics-list">
                <div className="metric-item">
                  <span>Authentication Service:</span>
                  <strong className="status-online">● Operational</strong>
                </div>
                <div className="metric-item">
                  <span>Campay Mobile Money Gateway:</span>
                  <strong className="status-online">● Connected (XAF)</strong>
                </div>
                <div className="metric-item">
                  <span>AI CHATBOT API Service:</span>
                  <strong className="status-online">● Online</strong>
                </div>
                <div className="metric-item">
                  <span>Database Engine (DBMS):</span>
                  <strong className="status-online">● Healthy</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <div className="admin-section">
            <div className="table-controls">
              <input
                type="text"
                placeholder="Search users by name, email or ID..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="ALL">All Account Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="DEACTIVATED">DEACTIVATED</option>
              </select>
            </div>

            <table className="admin-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Premium</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td><code>{u.id}</code></td>
                    <td><strong>{u.fullName}</strong></td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`role-tag ${u.role}`}>{u.role.toUpperCase()}</span>
                    </td>
                    <td>
                      <span className={`status-pill ${u.accountStatus.toLowerCase()}`}>
                        {u.accountStatus}
                      </span>
                    </td>
                    <td>{u.isPremium ? "⭐ Active" : "Free"}</td>
                    <td>
                      {u.accountStatus === "ACTIVE" ? (
                        <button
                          className="action-btn warn"
                          onClick={() => handleStatusChange(u.id, "SUSPENDED")}
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          className="action-btn success"
                          onClick={() => handleStatusChange(u.id, "ACTIVE")}
                        >
                          Activate
                        </button>
                      )}
                      {u.role !== "admin" && (
                        <button className="action-btn danger" onClick={() => handleDeleteUser(u.id)}>
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* JOBS TAB */}
        {activeTab === "jobs" && (
          <div className="admin-section">
            <div className="table-controls">
              <input
                type="text"
                placeholder="Search jobs by title or company..."
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
              />
            </div>

            <table className="admin-table">
              <thead>
                <tr>
                  <th>Job ID</th>
                  <th>Title</th>
                  <th>Company</th>
                  <th>Location</th>
                  <th>Salary</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => (
                  <tr key={job.JobID}>
                    <td><code>{job.JobID}</code></td>
                    <td><strong>{job.jobTitle}</strong></td>
                    <td>{job.companyName || "N/A"}</td>
                    <td>{job.location}</td>
                    <td>{job.salary ? `${job.salary.toLocaleString()} FCFA` : "Negotiable"}</td>
                    <td><span className="status-pill active">{job.status}</span></td>
                    <td>
                      <button className="action-btn primary" onClick={() => alert(`Viewing job details for ${job.jobTitle}`)}>
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* EMPLOYERS TAB */}
        {activeTab === "employers" && (
          <div className="admin-section">
            <h3>Employer & Recruiter Verification Panel</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Company / Name</th>
                  <th>Email</th>
                  <th>Recruiter Type</th>
                  <th>Verification Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employersList.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <strong>{emp.recruiterProfile?.companyName || emp.fullName}</strong>
                    </td>
                    <td>{emp.email}</td>
                    <td>{emp.recruiterProfile?.recruiterType || "Individual"}</td>
                    <td>
                      <span className={`status-pill ${emp.recruiterProfile?.verificationStatus || "pending"}`}>
                        {emp.recruiterProfile?.verificationStatus?.toUpperCase() || "PENDING"}
                      </span>
                    </td>
                    <td>
                      <button className="action-btn success" onClick={() => handleVerifyEmployer(emp.id, true)}>
                        Approve & Verify
                      </button>
                      <button className="action-btn danger" onClick={() => handleVerifyEmployer(emp.id, false)}>
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === "reports" && (
          <div className="admin-section">
            <h3>Reported Content & User Activity Complaints</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Reporter</th>
                  <th>Item Type</th>
                  <th>Target Item</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((rep) => (
                  <tr key={rep.reportId}>
                    <td><code>{rep.reportId}</code></td>
                    <td>{rep.reporterName}</td>
                    <td><span className="role-tag seeker">{rep.itemType.toUpperCase()}</span></td>
                    <td><strong>{rep.itemTitle}</strong></td>
                    <td className="reason-cell">{rep.reason}</td>
                    <td><span className={`status-pill ${rep.status.toLowerCase()}`}>{rep.status}</span></td>
                    <td>
                      {rep.status === "PENDING" ? (
                        <>
                          <button className="action-btn success" onClick={() => handleResolveReport(rep.reportId, "RESOLVED")}>
                            Resolve
                          </button>
                          <button className="action-btn warn" onClick={() => handleResolveReport(rep.reportId, "DISMISSED")}>
                            Dismiss
                          </button>
                        </>
                      ) : (
                        <span>Closed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
