import { useMemo, useState, type JSX } from "react";
import "./JobSearchApp.css";

type Job = {
  id: number;
  company: string;
  role: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Hybrid";
  category: string;
  salary: string;
  logo: string;
};

const JOBS: Job[] = [
  { id: 1, company: "TechNova", role: "Frontend Developer", location: "Yaoundé", type: "Full-time", category: "IT & Networking", salary: "350k – 550k XAF", logo: "TN" },
  { id: 2, company: "Digital Hub", role: "UI/UX Designer", location: "Douala", type: "Hybrid", category: "Design", salary: "300k – 500k XAF", logo: "DH" },
  { id: 3, company: "CamTech", role: "Software Engineer", location: "Yaoundé", type: "Full-time", category: "Engineering", salary: "450k – 700k XAF", logo: "CT" },
  { id: 4, company: "MarketPro", role: "Sales Manager", location: "Douala", type: "Full-time", category: "Sales & Marketing", salary: "300k – 600k XAF", logo: "MP" },
  { id: 5, company: "PeopleFirst", role: "HR Specialist", location: "Bafoussam", type: "Part-time", category: "Human Resources", salary: "250k – 400k XAF", logo: "PF" },
  { id: 6, company: "DataWorks", role: "Data Analyst", location: "Remote", type: "Contract", category: "Data Science", salary: "400k – 650k XAF", logo: "DW" },
];

const CATEGORIES = ["All", "IT & Networking", "Engineering", "Sales & Marketing", "Human Resources", "Customer Service", "Accounting", "Data Science", "Design"];

export default function JobSearchApp(): JSX.Element {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("All");
  const [saved, setSaved] = useState<number[]>([]);

  const filteredJobs = useMemo(() => {
    const key = keyword.trim().toLowerCase();
    const loc = location.trim().toLowerCase();

    return JOBS.filter((job) => {
      const matchesKeyword =
        !key ||
        `${job.role} ${job.company} ${job.category}`.toLowerCase().includes(key);
      const matchesLocation =
        !loc || job.location.toLowerCase().includes(loc);
      const matchesCategory =
        category === "All" || job.category === category;

      return matchesKeyword && matchesLocation && matchesCategory;
    });
  }, [keyword, location, category]);

  const toggleSaved = (id: number) => {
    setSaved((current) =>
      current.includes(id)
        ? current.filter((jobId) => jobId !== id)
        : [...current, id],
    );
  };

  return (
    <main className="job-search-page">
      <section className="job-search-hero">
        <div className="job-search-inner">
          <span className="job-search-kicker">EXPLORE OPPORTUNITIES</span>
          <h1>Find a job that fits <span>your future.</span></h1>
          <p>Search current JobFind opportunities by role, location or category.</p>

          <form
            className="job-search-form"
            onSubmit={(event) => event.preventDefault()}
          >
            <label>
              <span>⌕</span>
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Job title, keyword or company"
              />
            </label>

            <label>
              <span>⌖</span>
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Location"
              />
            </label>

            <button type="submit">Search jobs →</button>
          </form>
        </div>
      </section>

      <section className="job-results-section">
        <div className="job-search-inner">
          <div className="job-results-layout">
            <aside className="job-filter-panel">
              <div className="job-filter-header">
                <span>FILTERS</span>
                {(keyword || location || category !== "All") && (
                  <button
                    type="button"
                    onClick={() => {
                      setKeyword("");
                      setLocation("");
                      setCategory("All");
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>

              <h3>Category</h3>
              <div className="job-category-filter">
                {CATEGORIES.map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={category === item ? "active" : ""}
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </aside>

            <div className="job-results">
              <div className="job-results-header">
                <div>
                  <span className="job-results-kicker">LATEST LISTINGS</span>
                  <h2>{filteredJobs.length} opportunities</h2>
                </div>
                <span className="saved-count">{saved.length} saved</span>
              </div>

              {filteredJobs.length ? (
                <div className="job-results-list">
                  {filteredJobs.map((job) => (
                    <article className="job-result-card" key={job.id}>
                      <div className="job-result-logo">{job.logo}</div>

                      <div className="job-result-main">
                        <div className="job-result-company">{job.company}</div>
                        <h3>{job.role}</h3>
                        <div className="job-result-meta">
                          <span>⌖ {job.location}</span>
                          <span>◷ {job.type}</span>
                          <span>◈ {job.salary}</span>
                        </div>
                        <span className="job-result-category">{job.category}</span>
                      </div>

                      <div className="job-result-actions">
                        <button
                          type="button"
                          className={`save-job ${saved.includes(job.id) ? "saved" : ""}`}
                          onClick={() => toggleSaved(job.id)}
                          aria-label={saved.includes(job.id) ? "Unsave job" : "Save job"}
                        >
                          {saved.includes(job.id) ? "♥" : "♡"}
                        </button>
                        <button type="button" className="view-job-button">
                          View opportunity →
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="job-empty-state">
                  <div>⌕</div>
                  <h3>No matching opportunities</h3>
                  <p>Try a different keyword, location or category.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}