import { useMemo, useState, type JSX } from "react";
import "./JobsSection.css";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  category: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  salary: string;
  appliedAt: string;
  status: "pending" | "validated" | "rejected" | "PENDING" | "IN_REVIEW" | "INTERVIEW" | "ACCEPTED" | "REJECTED" | "WITHDRAWN" | string;
}

interface JobsSectionProps {
  jobs: Job[];
  applications: JobApplication[];
  savedIds: string[];
  onApply: (job: Job) => void;
  onToggleSave: (jobId: string) => void;
  onBack?: () => void;
}

export default function JobsSection({
  jobs,
  applications,
  savedIds,
  onApply,
  onToggleSave,
  onBack
}: JobsSectionProps): JSX.Element {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(jobs.map(job => job.category)))],
    [jobs]
  );

  const filteredJobs = jobs.filter(job => {
    const text = `${job.title} ${job.company} ${job.location} ${job.category}`.toLowerCase();
    return (
      text.includes(search.toLowerCase()) &&
      (category === "All" || job.category === category)
    );
  });

  const getApplication = (jobId: string) =>
    applications.find(application => application.jobId === jobId);

  return (
    <section className="jobs-page">
      <div className="jobs-heading">
        <div>
          <span className="jobs-kicker">OPPORTUNITIES</span>
          <h2>Find your next opportunity.</h2>
          <p>
            Read the complete job proposition, check what the employer is
            asking for, then apply when you are ready.
          </p>
        </div>

        {onBack && (
          <button type="button" className="jobs-back" onClick={onBack}>
            ← Dashboard
          </button>
        )}
      </div>

      <div className="jobs-toolbar">
        <label className="jobs-search">
          <span>⌕</span>
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search title, company or location..."
          />
        </label>

        <select
          value={category}
          onChange={event => setCategory(event.target.value)}
          aria-label="Filter by category"
        >
          {categories.map(item => <option key={item}>{item}</option>)}
        </select>
      </div>

      <div className="jobs-grid">
        {filteredJobs.map(job => {
          const application = getApplication(job.id);

          return (
            <article className="job-card" key={job.id}>
              <div className="job-card-top">
                <div className="job-company-logo">
                  {job.company.slice(0, 2).toUpperCase()}
                </div>

                <button
                  type="button"
                  className={`job-save ${savedIds.includes(job.id) ? "saved" : ""}`}
                  onClick={() => onToggleSave(job.id)}
                  aria-label={`Save ${job.title}`}
                >
                  {savedIds.includes(job.id) ? "♥" : "♡"}
                </button>
              </div>

              <span className="job-type">{job.type}</span>
              <h3>{job.title}</h3>
              <strong className="job-company">{job.company}</strong>

              <div className="job-meta">
                <span>⌖ {job.location}</span>
                <span>◈ {job.salary}</span>
              </div>

              <p className="job-short-description">{job.description}</p>

              {application && (
                <span className={`job-status ${application.status}`}>
                  Application: {application.status}
                </span>
              )}

              <button
                type="button"
                className="job-view-button"
                onClick={() => setSelectedJob(job)}
              >
                {application ? "View application" : "View proposition"}
                <span>→</span>
              </button>
            </article>
          );
        })}
      </div>

      {filteredJobs.length === 0 && (
        <div className="jobs-empty">
          <strong>No jobs found</strong>
          <p>Try another keyword or category.</p>
        </div>
      )}

      {selectedJob && (
        <div
          className="job-modal-backdrop"
          onMouseDown={event => {
            if (event.currentTarget === event.target) setSelectedJob(null);
          }}
        >
          <div className="job-modal" role="dialog" aria-modal="true">
            <button
              type="button"
              className="job-modal-close"
              onClick={() => setSelectedJob(null)}
              aria-label="Close"
            >
              ×
            </button>

            <span className="jobs-kicker">{selectedJob.category}</span>
            <h2>{selectedJob.title}</h2>
            <div className="job-modal-company">
              {selectedJob.company} · {selectedJob.location} · {selectedJob.type}
            </div>

            <div className="job-modal-salary">{selectedJob.salary}</div>

            <div className="job-proposition">
              <h3>What the employer is proposing</h3>
              <p>{selectedJob.description}</p>
            </div>

            <div className="job-proposition">
              <h3>What they are asking for</h3>
              <ul>
                {selectedJob.requirements.map(item => <li key={item}>{item}</li>)}
              </ul>
            </div>

            <div className="job-proposition">
              <h3>Main responsibilities</h3>
              <ul>
                {selectedJob.responsibilities.map(item => <li key={item}>{item}</li>)}
              </ul>
            </div>

            <div className="job-modal-actions">
              {(() => {
                const application = getApplication(selectedJob.id);

                if (application) {
                  return (
                    <div className={`already-applied ${application.status}`}>
                      <strong>Application {application.status}</strong>
                      <span>
                        This application is already recorded in My Applications
                        and on your dashboard.
                      </span>
                    </div>
                  );
                }

                return (
                  <button
                    type="button"
                    className="job-apply-button"
                    onClick={() => {
                      onApply(selectedJob);
                      setSelectedJob(null);
                    }}
                  >
                    Apply for this job →
                  </button>
                );
              })()}

              <button
                type="button"
                className="job-secondary-button"
                onClick={() => onToggleSave(selectedJob.id)}
              >
                {savedIds.includes(selectedJob.id) ? "Remove from saved" : "Save job"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
