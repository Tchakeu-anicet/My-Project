import { useMemo, useState, type JSX } from "react";
import "./CandidatesSection.css";

/* =========================================================
   TYPES
========================================================= */

interface Candidate {
  id: string;
  name: string;
  initials: string;
  jobTitle: string;
  location: string;
  experience: string;
  education: string;
  skills: string[];
  availability: string;
  email: string;
  phone: string;
  bio: string;
}

/* =========================================================
   DEMO CANDIDATES
========================================================= */

const CANDIDATES: Candidate[] = [
  {
    id: "candidate-1",
    name: "Emmanuel Mbarga",
    initials: "EM",
    jobTitle: "Frontend Developer",
    location: "Yaoundé, Cameroon",
    experience: "3 years experience",
    education: "B.Sc. Software Engineering",
    skills: ["React", "TypeScript", "JavaScript", "CSS"],
    availability: "Available",
    email: "emmanuel.mbarga@example.com",
    phone: "+237 6 77 12 34 56",
    bio: "Frontend developer passionate about building modern, responsive and user-friendly web applications.",
  },

  {
    id: "candidate-2",
    name: "Cynthia Njoya",
    initials: "CN",
    jobTitle: "UI/UX Designer",
    location: "Douala, Cameroon",
    experience: "2 years experience",
    education: "B.Sc. Computer Science",
    skills: ["Figma", "UI Design", "UX Research", "Prototyping"],
    availability: "Available",
    email: "cynthia.njoya@example.com",
    phone: "+237 6 88 45 67 89",
    bio: "Creative UI/UX designer focused on creating simple, accessible and engaging digital experiences.",
  },

  {
    id: "candidate-3",
    name: "Patrick Kamdem",
    initials: "PK",
    jobTitle: "Backend Developer",
    location: "Bamenda, Cameroon",
    experience: "4 years experience",
    education: "B.Sc. Computer Engineering",
    skills: ["Node.js", "PHP", "MySQL", "PostgreSQL"],
    availability: "Available",
    email: "patrick.kamdem@example.com",
    phone: "+237 6 99 23 45 67",
    bio: "Backend developer experienced in building APIs, database systems and scalable server-side applications.",
  },

  {
    id: "candidate-4",
    name: "Grace Fomukong",
    initials: "GF",
    jobTitle: "Data Analyst",
    location: "Yaoundé, Cameroon",
    experience: "2 years experience",
    education: "B.Sc. Statistics",
    skills: ["SQL", "Excel", "Python", "Power BI"],
    availability: "Available",
    email: "grace.fomukong@example.com",
    phone: "+237 6 75 34 56 78",
    bio: "Data analyst who enjoys transforming complex data into meaningful business insights.",
  },

  {
    id: "candidate-5",
    name: "Kevin Tchoumi",
    initials: "KT",
    jobTitle: "Software Engineer",
    location: "Douala, Cameroon",
    experience: "5 years experience",
    education: "B.Eng. Software Engineering",
    skills: ["Java", "Spring Boot", "React", "SQL"],
    availability: "Open to opportunities",
    email: "kevin.tchoumi@example.com",
    phone: "+237 6 81 23 45 90",
    bio: "Software engineer with experience developing enterprise applications and REST APIs.",
  },

  {
    id: "candidate-6",
    name: "Brenda Mbi",
    initials: "BM",
    jobTitle: "Mobile App Developer",
    location: "Buea, Cameroon",
    experience: "3 years experience",
    education: "B.Sc. Computer Science",
    skills: ["Flutter", "Dart", "Kotlin", "Firebase"],
    availability: "Available",
    email: "brenda.mbi@example.com",
    phone: "+237 6 78 45 23 11",
    bio: "Mobile developer specialized in creating cross-platform applications for Android and iOS.",
  },

  {
    id: "candidate-7",
    name: "Daniel Ngassa",
    initials: "DN",
    jobTitle: "Full Stack Developer",
    location: "Yaoundé, Cameroon",
    experience: "4 years experience",
    education: "B.Sc. Information Technology",
    skills: ["React", "Node.js", "MongoDB", "TypeScript"],
    availability: "Available",
    email: "daniel.ngassa@example.com",
    phone: "+237 6 92 34 56 71",
    bio: "Full-stack developer capable of building complete web applications from frontend to backend.",
  },

  {
    id: "candidate-8",
    name: "Sophie Ekani",
    initials: "SE",
    jobTitle: "Product Designer",
    location: "Douala, Cameroon",
    experience: "3 years experience",
    education: "B.A. Digital Design",
    skills: ["Figma", "Design Systems", "UX", "Wireframing"],
    availability: "Open to opportunities",
    email: "sophie.ekani@example.com",
    phone: "+237 6 80 45 12 34",
    bio: "Product designer focused on designing elegant and practical digital products.",
  },
];

/* =========================================================
   CANDIDATES SECTION
========================================================= */

export default function CandidatesSection(): JSX.Element {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedCandidate, setSelectedCandidate] =
    useState<Candidate | null>(null);

  /* =======================================================
     FILTER CANDIDATES
  ======================================================= */

  const filteredCandidates = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return CANDIDATES.filter((candidate) => {
      const matchesSearch =
        !searchValue ||
        candidate.name.toLowerCase().includes(searchValue) ||
        candidate.jobTitle.toLowerCase().includes(searchValue) ||
        candidate.location.toLowerCase().includes(searchValue) ||
        candidate.skills.some((skill) =>
          skill.toLowerCase().includes(searchValue)
        );

      const matchesFilter =
        filter === "All" ||
        candidate.availability === filter;

      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section className="candidates-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="candidates-header">

        <div>
          <span className="candidates-kicker">
            TALENT MANAGEMENT
          </span>

          <h2>Find the right candidate</h2>

          <p>
            Browse job seeker profiles and discover talented
            professionals for your company's job opportunities.
          </p>
        </div>

        <div className="candidates-total">
          <strong>{CANDIDATES.length}</strong>
          <span>Registered candidates</span>
        </div>

      </div>

      {/* =================================================
          SEARCH AND FILTER
      ================================================= */}

      <div className="candidates-toolbar">

        <label className="candidates-search">

          <span>⌕</span>

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search by name, job title, skill..."
            aria-label="Search candidates"
          />

        </label>

        <select
          value={filter}
          onChange={(event) =>
            setFilter(event.target.value)
          }
          aria-label="Filter candidates"
        >
          <option value="All">
            All candidates
          </option>

          <option value="Available">
            Available
          </option>

          <option value="Open to opportunities">
            Open to opportunities
          </option>
        </select>

      </div>

      {/* =================================================
          RESULTS INFORMATION
      ================================================= */}

      <div className="candidates-results">

        <div>
          <strong>
            {filteredCandidates.length}
          </strong>

          <span>
            candidate
            {filteredCandidates.length !== 1
              ? "s"
              : ""}{" "}
            found
          </span>
        </div>

        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
          >
            Clear search
          </button>
        )}

      </div>

      {/* =================================================
          CANDIDATE LIST
      ================================================= */}

      <div className="candidates-list">

        {filteredCandidates.length === 0 ? (

          <div className="candidates-empty">

            <div>⌕</div>

            <h3>
              No candidates found
            </h3>

            <p>
              Try another name, job title or skill.
            </p>

          </div>

        ) : (

          filteredCandidates.map((candidate) => (

            <article
              className="candidate-card"
              key={candidate.id}
            >

              {/* PROFILE */}

              <div className="candidate-profile">

                <div className="candidate-avatar">
                  {candidate.initials}
                </div>

                <div className="candidate-main">

                  <div className="candidate-name-row">

                    <h3>
                      {candidate.name}
                    </h3>

                    <span className="candidate-status">
                      ● {candidate.availability}
                    </span>

                  </div>

                  <strong className="candidate-job">
                    {candidate.jobTitle}
                  </strong>

                  <div className="candidate-meta">

                    <span>
                      ◉ {candidate.location}
                    </span>

                    <span>
                      ◷ {candidate.experience}
                    </span>

                    <span>
                      ▣ {candidate.education}
                    </span>

                  </div>

                </div>

              </div>

              {/* SKILLS */}

              <div className="candidate-skills">

                {candidate.skills.map((skill) => (
                  <span key={skill}>
                    {skill}
                  </span>
                ))}

              </div>

              {/* ACTIONS */}

              <div className="candidate-actions">

                <button
                  type="button"
                  className="candidate-view-button"
                  onClick={() =>
                    setSelectedCandidate(candidate)
                  }
                >
                  View profile
                  <span>→</span>
                </button>

                <button
                  type="button"
                  className="candidate-contact-button"
                  onClick={() => {
                    window.location.href =
                      `mailto:${candidate.email}`;
                  }}
                >
                  Contact
                </button>

              </div>

            </article>

          ))

        )}

      </div>

      {/* =================================================
          PROFILE MODAL
      ================================================= */}

      {selectedCandidate && (

        <div
          className="candidate-modal-overlay"
          onClick={() =>
            setSelectedCandidate(null)
          }
        >

          <div
            className="candidate-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="candidate-modal-header">

              <button
                type="button"
                className="candidate-modal-close"
                onClick={() =>
                  setSelectedCandidate(null)
                }
                aria-label="Close candidate profile"
              >
                ×
              </button>

              <div className="candidate-modal-avatar">
                {selectedCandidate.initials}
              </div>

              <div>

                <span className="candidate-modal-label">
                  JOB SEEKER PROFILE
                </span>

                <h2>
                  {selectedCandidate.name}
                </h2>

                <p>
                  {selectedCandidate.jobTitle}
                </p>

              </div>

            </div>

            {/* MODAL BODY */}

            <div className="candidate-modal-body">

              <div className="candidate-detail">

                <span>
                  LOCATION
                </span>

                <strong>
                  {selectedCandidate.location}
                </strong>

              </div>

              <div className="candidate-detail">

                <span>
                  EXPERIENCE
                </span>

                <strong>
                  {selectedCandidate.experience}
                </strong>

              </div>

              <div className="candidate-detail">

                <span>
                  EDUCATION
                </span>

                <strong>
                  {selectedCandidate.education}
                </strong>

              </div>

              <div className="candidate-detail">

                <span>
                  AVAILABILITY
                </span>

                <strong>
                  {selectedCandidate.availability}
                </strong>

              </div>

              <div className="candidate-about">

                <span>
                  ABOUT
                </span>

                <p>
                  {selectedCandidate.bio}
                </p>

              </div>

              <div className="candidate-modal-skills">

                <span>
                  SKILLS
                </span>

                <div>

                  {selectedCandidate.skills.map(
                    (skill) => (
                      <b key={skill}>
                        {skill}
                      </b>
                    )
                  )}

                </div>

              </div>

              <div className="candidate-contact-info">

                <div>
                  <span>
                    EMAIL
                  </span>

                  <strong>
                    {selectedCandidate.email}
                  </strong>
                </div>

                <div>
                  <span>
                    PHONE
                  </span>

                  <strong>
                    {selectedCandidate.phone}
                  </strong>
                </div>

              </div>

            </div>

            {/* MODAL ACTIONS */}

            <div className="candidate-modal-actions">

              <button
                type="button"
                onClick={() =>
                  setSelectedCandidate(null)
                }
              >
                Close
              </button>

              <button
                type="button"
                className="candidate-modal-contact"
                onClick={() => {
                  window.location.href =
                    `mailto:${selectedCandidate.email}`;
                }}
              >
                Contact candidate →
              </button>

            </div>

          </div>

        </div>

      )}

    </section>
  );
}