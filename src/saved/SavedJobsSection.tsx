import { useState, type JSX } from "react";
import type { Job, JobApplication } from "../jobs/JobsSection";
import "./SavedJobsSection.css";

interface SavedJobsSectionProps {
  jobs: Job[];
  savedIds: string[];
  applications: JobApplication[];
  onToggleSave: (id: string) => void;
  onApply: (job: Job) => void;
}

export default function SavedJobsSection({
  jobs,
  savedIds,
  applications,
  onToggleSave,
  onApply,
}: SavedJobsSectionProps): JSX.Element {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const savedJobs = jobs.filter((job) => savedIds.includes(job.id));

  const getApplication = (jobId: string) =>
    applications.find((app) => app.jobId === jobId);

  return (
    <section className="saved-jobs-page">
      <div className="saved-jobs-header">
        <div>
          <span className="saved-jobs-kicker">MY COLLECTION</span>
          <h2>Saved Jobs</h2>
          <p>
            Review the opportunities you've marked as interesting. View details or apply when you are ready.
          </p>
        </div>
        <div className="saved-jobs-total">
          <strong>{savedJobs.length}</strong>
          <span>saved jobs</span>
        </div>
      </div>

      {savedJobs.length === 0 ? (
        <div className="saved-jobs-empty">
          <div className="saved-jobs-empty-icon">♡</div>
          <h3>No saved jobs yet</h3>
          <p>Explore recommended jobs or use the search tab to find and save opportunities.</p>
        </div>
      ) : (
        <div className="saved-jobs-grid">
          {savedJobs.map((job) => {
            const application = getApplication(job.id);

            return (
              <article className="saved-job-card" key={job.id}>
                <div className="saved-job-card-top">
                  <div className="saved-job-company-logo">
                    {job.company.slice(0, 2).toUpperCase()}
                  </div>

                  <button
                    type="button"
                    className="saved-job-unsave"
                    onClick={() => onToggleSave(job.id)}
                    aria-label={`Unsave ${job.title}`}
                  >
                    ♥
                  </button>
                </div>

                <span className="saved-job-type">{job.type}</span>
                <h3>{job.title}</h3>
                <strong className="saved-job-company">{job.company}</strong>

                <div className="saved-job-meta">
                  <span>⌖ {job.location}</span>
                  <span>◈ {job.salary}</span>
                </div>

                <p className="saved-job-short-description">{job.description}</p>

                {application && (
                  <span className={`saved-job-status ${application.status}`}>
                    Application: {application.status}
                  </span>
                )}

                <button
                  type="button"
                  className="saved-job-view-button"
                  onClick={() => setSelectedJob(job)}
                >
                  {application ? "View application" : "View proposition"}
                  <span>→</span>
                </button>
              </article>
            );
          })}
        </div>
      )}

      {/* JOB PROPOSITION DETAIL MODAL */}
      {selectedJob && (
        <div
          className="job-modal-backdrop"
          onMouseDown={(event) => {
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
                {selectedJob.requirements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="job-proposition">
              <h3>Main responsibilities</h3>
              <ul>
                {selectedJob.responsibilities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
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
                        This application is already recorded in My Applications.
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
                onClick={() => {
                  onToggleSave(selectedJob.id);
                  setSelectedJob(null);
                }}
              >
                Remove from saved
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
