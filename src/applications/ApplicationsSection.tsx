import { useEffect, useState, type JSX } from "react";
import type { UserRole } from "../types";
import type { JobApplication } from "../jobs/JobsSection";

import {
  getApplications,
  updateApplicationStatus,
} from "../data/applicationsStore";

import "./ApplicationsSection.css";

interface ApplicationsSectionProps {
  role: UserRole;
}

interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "success" | "rejected" | "info";
  createdAt: string;
  read: boolean;
}

const NOTIFICATION_KEY = "jf_notifications";

function addNotification(
  notification: Omit<AppNotification, "id" | "createdAt" | "read">
): void {
  const current: AppNotification[] = JSON.parse(
    localStorage.getItem(NOTIFICATION_KEY) || "[]"
  );

  const next: AppNotification = {
    ...notification,
    id: `notification-${Date.now()}`,
    createdAt: new Date().toISOString(),
    read: false,
  };

  localStorage.setItem(
    NOTIFICATION_KEY,
    JSON.stringify([next, ...current])
  );

  window.dispatchEvent(new Event("jf-notifications-updated"));
}

export default function ApplicationsSection({
  role,
}: ApplicationsSectionProps): JSX.Element {
  const recruiter = role === "recruiter";

  const [applications, setApplications] = useState<JobApplication[]>(
    () => getApplications()
  );

  const loadApplications = (): void => {
    setApplications(getApplications());
  };

  useEffect(() => {
    loadApplications();

    const refresh = (): void => loadApplications();

    window.addEventListener("jf-applications-updated", refresh);

    return () => {
      window.removeEventListener("jf-applications-updated", refresh);
    };
  }, []);

  const changeStatus = (
    applicationId: string,
    status: string
  ): void => {
    const updated = updateApplicationStatus(applicationId, status as any);

    if (!updated) {
      return;
    }

    addNotification({
      title: `Application Status Updated: ${status.replace("_", " ")}`,
      message: `Your application for ${updated.jobTitle} at ${updated.company} has been updated to status: ${status}.`,
      type: status === "validated" || status === "ACCEPTED" ? "success" : "info",
    });

    loadApplications();
    window.dispatchEvent(new Event("jf-applications-updated"));
  };

  const handleWithdraw = (applicationId: string): void => {
    if (window.confirm("Are you sure you want to withdraw this application?")) {
      changeStatus(applicationId, "WITHDRAWN");
    }
  };

  if (!recruiter) {
    return (
      <section className="applications-page">
        <div className="applications-header">
          <span>MY ACTIVITY</span>
          <h2>My Applications</h2>
          <p>
            Track every job application you have submitted and its current
            status (PENDING, IN_REVIEW, INTERVIEW, ACCEPTED, REJECTED, WITHDRAWN).
          </p>
        </div>

        {applications.length === 0 ? (
          <div className="applications-empty">
            <strong>No applications yet.</strong>
            <p>
              When you apply for a job, it will appear here with a PENDING
              status.
            </p>
          </div>
        ) : (
          <div className="applications-list">
            {applications.map((application) => (
              <article className="application-card" key={application.id}>
                <div className="application-company-logo">
                  {application.company.slice(0, 2).toUpperCase()}
                </div>

                <div className="application-information">
                  <h3>{application.jobTitle}</h3>
                  <p>{application.company}</p>
                  <span>
                    {application.location} · {application.salary}
                  </span>
                  <small>
                    Applied on{" "}
                    {new Date(application.appliedAt).toLocaleDateString()}
                  </small>
                </div>

                <div className={`application-status ${application.status.toLowerCase()}`}>
                  {application.status.toUpperCase()}
                </div>

                {application.status !== "WITHDRAWN" && application.status !== "REJECTED" && (
                  <button
                    type="button"
                    className="application-reject"
                    style={{ marginLeft: "12px", background: "#f1f5f9", color: "#64748b", border: "1px solid #cbd5e1" }}
                    onClick={() => handleWithdraw(application.id)}
                  >
                    Withdraw
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="applications-page">
      <div className="applications-header">
        <div>
          <span>RECRUITMENT</span>
          <h2>Manage Applications</h2>
          <p>
            Review job seeker applications and update their status (IN_REVIEW, INTERVIEW, ACCEPTED, REJECTED).
          </p>
        </div>

        <div className="application-total">
          {applications.length}
          <span>Total applications</span>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="applications-empty">
          <div className="applications-empty-icon">▤</div>
          <strong>No applications yet</strong>
          <p>
            Applications from job seekers will appear here when they apply.
          </p>
        </div>
      ) : (
        <div className="applications-list">
          {applications.map((application) => (
            <article
              className="recruiter-application-card"
              key={application.id}
            >
              <div className="applicant-avatar">JS</div>

              <div className="application-information">
                <span className="application-label">JOB SEEKER</span>
                <h3>{application.jobTitle}</h3>
                <p>{application.company}</p>
                <small>
                  Applied{" "}
                  {new Date(application.appliedAt).toLocaleDateString()}
                </small>
              </div>

              <div className={`application-status ${application.status.toLowerCase()}`}>
                {application.status.toUpperCase()}
              </div>

              <div className="application-actions" style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="application-validate"
                  onClick={() => changeStatus(application.id, "IN_REVIEW")}
                >
                  In Review
                </button>
                <button
                  type="button"
                  className="application-validate"
                  style={{ background: "#9333ea" }}
                  onClick={() => changeStatus(application.id, "INTERVIEW")}
                >
                  Interview
                </button>
                <button
                  type="button"
                  className="application-validate"
                  onClick={() => changeStatus(application.id, "ACCEPTED")}
                >
                  Accept
                </button>
                <button
                  type="button"
                  className="application-reject"
                  onClick={() => changeStatus(application.id, "REJECTED")}
                >
                  Reject
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}