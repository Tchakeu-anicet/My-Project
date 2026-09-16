import {
  useState,
  type FormEvent,
  type JSX,
} from "react";

import "./PostJobSection.css";

export interface PostedJob {
  id: string;
  title: string;
  applicants: number;
  location: string;
  employmentType: string;
  description: string;
  requirements?: string[];
  recruiterName?: string;
  recruiterType?: "company" | "individual";
}

export interface NewPostedJob {
  title: string;
  location: string;
  category: string;
  employmentType: string;
  description: string;
  requirements?: string[];
}

interface PostJobSectionProps {
  jobs: PostedJob[];

  onPost: (job: NewPostedJob) => void;
  onDeleteJob?: (jobId: string) => void;
  onUpdateJob?: (jobId: string, updates: Partial<PostedJob>) => void;

  recruiterName?: string;

  recruiterType?: "company" | "individual";
}

export default function PostJobSection({
  jobs,
  onPost,
  onDeleteJob,
  onUpdateJob,
  recruiterType,
}: PostJobSectionProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<"post" | "manage">("post");
  const [title, setTitle] = useState("");

  const [location, setLocation] =
    useState("");

  const [category, setCategory] = useState(
    "General Services"
  );

  const [
    employmentType,
    setEmploymentType,
  ] = useState("Full-time");

  const [description, setDescription] =
    useState("");

  const [requirements, setRequirements] =
    useState("");

  const [error, setError] =
    useState("");

  const handleStatusAction = (job: PostedJob, action: "update" | "delete") => {
    if (action === "delete") {
      onDeleteJob?.(job.id);
      return;
    }

    const nextStatus = job.applicants > 0 ? "Reviewing applications" : "Open for applications";
    onUpdateJob?.(job.id, { employmentType: job.employmentType, description: job.description, location: job.location, title: job.title, applicants: job.applicants, requirements: job.requirements, recruiterName: job.recruiterName, recruiterType: job.recruiterType, });
    window.alert(`${job.title} status updated: ${nextStatus}`);
  };

  const submit = (
    event: FormEvent<HTMLFormElement>
  ): void => {
    event.preventDefault();

    setError("");

    const cleanTitle = title.trim();
    const cleanLocation = location.trim();
    const cleanCategory = category.trim();
    const cleanDescription =
      description.trim();

    const cleanRequirements = requirements
      .split(/\n|,|;/)
      .map((item) => item.trim())
      .filter(Boolean);

    if (cleanTitle.length < 2) {
      setError(
        "Enter a valid job title."
      );
      return;
    }

    if (cleanLocation.length < 2) {
      setError(
        "Enter the job location."
      );
      return;
    }

    if (cleanCategory.length < 2) {
      setError(
        "Choose a category for this job."
      );
      return;
    }

    if (cleanDescription.length < 20) {
      setError(
        "Describe the work in at least 20 characters."
      );
      return;
    }

    onPost({
      title: cleanTitle,
      location: cleanLocation,
      category: cleanCategory,
      employmentType,
      description: cleanDescription,
      requirements:
        cleanRequirements.length > 0
          ? cleanRequirements
          : undefined,
    });

    setTitle("");
    setLocation("");
    setCategory("General Services");
    setEmploymentType("Full-time");
    setDescription("");
    setRequirements("");
  };

  return (
    <section className="jf-section jf-post-section">
      <div className="jf-section-title">
        <span className="jf-eyebrow">
          {recruiterType === "individual"
            ? "INDEPENDENT RECRUITER"
            : "RECRUITER"}
        </span>

        <h2>Post a Job</h2>

        <p>
          Describe the worker you are
          looking for and start receiving
          applications.
        </p>
      </div>

      <div className="jf-post-tabs">
        <button
          type="button"
          className={`jf-post-tab ${activeTab === "post" ? "active" : ""}`}
          onClick={() => setActiveTab("post")}
        >
          Post a Job
        </button>
        <button
          type="button"
          className={`jf-post-tab ${activeTab === "manage" ? "active" : ""}`}
          onClick={() => setActiveTab("manage")}
        >
          Manage Jobs Posted
        </button>
      </div>

      <div
        className={`jf-post-layout ${activeTab === "post" ? "jf-post-layout-single" : ""}`}
      >
        {activeTab === "post" && (
          <form
            className="jf-post-form"
            onSubmit={submit}
            noValidate
          >
            {error && (
              <div className="jf-post-error">
                {error}
              </div>
            )}

            <div className="jf-post-form-hero">
              <span className="jf-post-pill">
                Hiring details
              </span>
              <h3>Tell applicants what you need</h3>
            </div>

            <div className="jf-post-form-grid">
              <label>
                Job title

                <input
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="e.g. Frontend Developer"
                  required
                />
              </label>

              <label>
                Location

                <input
                  type="text"
                  value={location}
                  onChange={(event) =>
                    setLocation(
                      event.target.value
                    )
                  }
                  placeholder="Damas, Yaounde..."
                  required
                />
              </label>
            </div>

            <label>
              Job category

              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
              >
                <option value="General Services">General Services</option>
                <option value="Technology & IT">Technology & IT</option>
                <option value="Design & Creative">Design & Creative</option>
                <option value="Finance & Accounting">Finance & Accounting</option>
                <option value="Marketing & Sales">Marketing & Sales</option>
                <option value="Customer Support">Customer Support</option>
                <option value="Construction & Trades">Construction & Trades</option>
                <option value="Education & Training">Education & Training</option>
                <option value="Healthcare & Care">Healthcare & Care</option>
                <option value="Hospitality & Events">Hospitality & Events</option>
                <option value="Transportation & Driving">Transportation & Driving</option>
              </select>
            </label>

            <label>
              Employment type

              <select
                value={employmentType}
                onChange={(event) =>
                  setEmploymentType(
                    event.target.value
                  )
                }
              >
                <option value="Full-time">
                  Full-time
                </option>

                <option value="Part-time">
                  Part-time
                </option>

                <option value="Contract">
                  Contract
                </option>

                <option value="Temporary">
                  Temporary
                </option>

                <option value="Remote">
                  Remote
                </option>
              </select>
            </label>

            <label>
              Describe the work

              <textarea
                rows={7}
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                placeholder="Describe the work, responsibilities, tasks, working hours and expectations..."
                required
              />
            </label>

            <label>
              Work requirements (optional)

              <textarea
                rows={4}
                value={requirements}
                onChange={(event) =>
                  setRequirements(event.target.value)
                }
                placeholder="Add optional requirements like: 2+ years experience, must know Excel, fluent in English, valid driving licence, able to work weekends..."
              />
            </label>

            <button
              type="submit"
              className="jf-primary-btn"
            >
              Publish Job →
            </button>
          </form>
        )}

        {activeTab === "manage" && (
          <div className="jf-posted">
            <div className="jf-posted-header">
              <div>
                <span className="jf-post-pill small">Manage</span>
                <h3>Manage Jobs Posted</h3>
              </div>
              <span className="jf-posted-count">{jobs.length} active</span>
            </div>

            {jobs.length === 0 ? (
              <div className="jf-no-posts">
                <p>You haven't posted any jobs yet.</p>
              </div>
            ) : (
              <div className="jf-posted-list">
                {jobs.map((job) => (
                  <article className="jf-posted-row" key={job.id}>
                    <div className="jf-posted-row-main">
                      <div className="jf-posted-row-header">
                        <strong>{job.title}</strong>
                        <span className={`jf-post-status ${job.applicants > 0 ? "review" : "open"}`}>
                          {job.applicants > 0 ? "Reviewing" : "Open"}
                        </span>
                      </div>

                      <small>{job.location}</small>
                      <small>{job.employmentType}</small>

                      {Array.isArray(job.requirements) && job.requirements.length > 0 && (
                        <div className="jf-posted-requirements">
                          {job.requirements.map((item) => (
                            <span key={item}>{item}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="jf-posted-actions">
                      <span>{job.applicants} applicants</span>
                      <div className="jf-posted-action-buttons">
                        <button
                          type="button"
                          className="jf-post-update-btn"
                          onClick={() => handleStatusAction(job, "update")}
                        >
                          Update
                        </button>
                        <button
                          type="button"
                          className="jf-post-delete-btn"
                          onClick={() => handleStatusAction(job, "delete")}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}