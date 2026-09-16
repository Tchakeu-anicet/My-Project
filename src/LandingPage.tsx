import { useMemo, useState, type JSX } from "react";
import "./LandingPage.css";

export type UserRole = "seeker" | "recruiter";

interface LandingPageProps {
  onBrowseJobs: () => void;
  onOpenGate: (role?: UserRole) => void;
  onGetStarted: (role?: UserRole) => void;
}

interface Job {
  id: number;
  company: string;
  title: string;
  location: string;
  type: string;
  category: string;
  salary: string;
  featured?: boolean;
}

const JOBS: Job[] = [
  {
    id: 1,
    company: "TechNova",
    title: "Frontend Developer",
    location: "Remote",
    type: "Full-time",
    category: "Technology",
    salary: "$2,500 - $4,000",
    featured: true,
  },
  {
    id: 2,
    company: "BlueFinance",
    title: "Financial Analyst",
    location: "Douala",
    type: "Full-time",
    category: "Finance",
    salary: "$1,800 - $3,000",
  },
  {
    id: 3,
    company: "CreativeLab",
    title: "UI/UX Designer",
    location: "Yaoundé",
    type: "Contract",
    category: "Design",
    salary: "$1,500 - $2,600",
  },
  {
    id: 4,
    company: "MarketPro",
    title: "Digital Marketing Manager",
    location: "Remote",
    type: "Full-time",
    category: "Marketing",
    salary: "$2,000 - $3,500",
  },
];

const CATEGORIES = [
  {
    icon: "⌘",
    name: "Technology",
    jobs: "120+ jobs",
  },
  {
    icon: "◈",
    name: "Finance",
    jobs: "85+ jobs",
  },
  {
    icon: "✦",
    name: "Design",
    jobs: "70+ jobs",
  },
  {
    icon: "◎",
    name: "Marketing",
    jobs: "95+ jobs",
  },
  {
    icon: "♡",
    name: "Healthcare",
    jobs: "65+ jobs",
  },
  {
    icon: "⚙",
    name: "Engineering",
    jobs: "110+ jobs",
  },
];

const SERVICES = [
  {
    number: "01",
    icon: "⌕",
    title: "Find the right jobs",
    text: "Search and discover opportunities based on your skills, career goals, location, and preferred work arrangement.",
  },
  {
    number: "02",
    icon: "✓",
    title: "Apply with confidence",
    text: "Keep your profile and professional information organized so you can move from discovering an opportunity to applying faster.",
  },
  {
    number: "03",
    icon: "◉",
    title: "Build your professional profile",
    text: "Present your experience, skills, qualifications, and career goals to employers looking for the right candidates.",
  },
  {
    number: "04",
    icon: "▣",
    title: "Manage applications",
    text: "Keep track of your opportunities and stay organized throughout your job-search journey.",
  },
  {
    number: "05",
    icon: "⚡",
    title: "Recruit better",
    text: "Employers can publish opportunities, reach candidates, and make recruitment easier through one platform.",
  },
  {
    number: "06",
    icon: "♢",
    title: "Connect talent with opportunity",
    text: "JobFind creates a bridge between people searching for meaningful work and organizations searching for talent.",
  },
];

const FEATURES = [
  "Simple job discovery",
  "Opportunities across Cameroon",
  "Remote and local positions",
  "Candidate profiles",
  "Employer recruitment tools",
  "Application management",
  "Career opportunities",
  "Job seeker support",
];

const FAQS = [
  {
    question: "Is JobFind free for job seekers?",
    answer:
      "Yes. Browsing and applying for jobs is free for job seekers.",
  },
  {
    question: "Can employers use JobFind?",
    answer:
      "Yes. JobFind is designed for both job seekers and employers. Employers can use the platform to publish opportunities and connect with candidates.",
  },
  {
    question: "Can I search for remote jobs?",
    answer:
      "Yes. JobFind includes remote opportunities as well as opportunities based in cities such as Douala and Yaoundé.",
  },
  {
    question: "How do I get started?",
    answer:
      "Create an account, complete your profile, explore opportunities, and start applying to positions that match your goals.",
  },
];

export default function LandingPage({
  onBrowseJobs,
  onOpenGate: _onOpenGate,
  onGetStarted,
}: LandingPageProps): JSX.Element {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showAllJobs, setShowAllJobs] = useState(false);

  const filteredJobs = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    const place = location.trim().toLowerCase();

    return JOBS.filter((job) => {
      const matchesCategory =
        activeCategory === "All" || job.category === activeCategory;

      const matchesSearch =
        !search ||
        job.title.toLowerCase().includes(search) ||
        job.company.toLowerCase().includes(search) ||
        job.category.toLowerCase().includes(search);

      const matchesLocation =
        !place ||
        job.location.toLowerCase().includes(place) ||
        job.location.toLowerCase() === "remote";

      return matchesCategory && matchesSearch && matchesLocation;
    });
  }, [searchTerm, location, activeCategory]);

  const displayedJobs = showAllJobs
    ? filteredJobs
    : filteredJobs.slice(0, 4);

  const handleSearch = (): void => {
    setShowAllJobs(true);

    const jobsSection = document.getElementById("jobs");

    if (jobsSection) {
      jobsSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const scrollToSection = (id: string): void => {
    const section = document.getElementById(id);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <main className="landing-page">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="landing-hero" id="home">
        <div className="landing-hero-overlay" />
        <div className="landing-hero-glow landing-hero-glow-one" />
        <div className="landing-hero-glow landing-hero-glow-two" />

        <div className="landing-container landing-hero-container">
          <div className="landing-hero-content">
            <span className="landing-hero-badge">
              <span className="landing-live-dot" />
              Opportunities are waiting for you
            </span>

            <h1>
              Find the job
              <span> that finds you.</span>
            </h1>

            <p className="landing-hero-description">
              JobFind connects talented people with meaningful opportunities
              and helps employers find the right people for their teams.
            </p>

            <div className="landing-hero-buttons">
              <button
                type="button"
                className="landing-btn landing-btn-primary"
                onClick={onBrowseJobs}
              >
                Explore Jobs
                <span>→</span>
              </button>

              <button
                type="button"
                className="landing-btn landing-btn-glass"
                onClick={() => onGetStarted("seeker")}
              >
                Get Started
                <span>↗</span>
              </button>
            </div>

            <div className="landing-trust-row">
              <div className="landing-trust-avatars">
                <span>J</span>
                <span>A</span>
                <span>M</span>
                <span>+</span>
              </div>

              <div>
                <strong>Join JobFind</strong>
                <small>and discover your next opportunity</small>
              </div>
            </div>
          </div>

          {/* Search panel */}
          <div className="landing-search-card">
            <div className="landing-search-heading">
              <div>
                <span className="landing-section-label">
                  FIND YOUR OPPORTUNITY
                </span>
                <h2>Search thousands of possibilities.</h2>
              </div>
            </div>

            <div className="landing-search-fields">
              <label className="landing-search-field">
                <span className="landing-search-icon">⌕</span>
                <span>
                  <small>Job title or keyword</small>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="e.g. Frontend Developer"
                  />
                </span>
              </label>

              <label className="landing-search-field">
                <span className="landing-search-icon">⌖</span>
                <span>
                  <small>Location</small>
                  <input
                    type="text"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="Douala, Yaoundé, Remote..."
                  />
                </span>
              </label>

              <button
                type="button"
                className="landing-search-button"
                onClick={handleSearch}
              >
                Search Jobs
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          STATS
      ====================================================== */}

      <section className="landing-stats">
        <div className="landing-container landing-stats-grid">
          <div className="landing-stat">
            <strong>500+</strong>
            <span>Active listings</span>
          </div>

          <div className="landing-stat">
            <strong>200+</strong>
            <span>Companies hiring</span>
          </div>

          <div className="landing-stat">
            <strong>10k+</strong>
            <span>Job seekers</span>
          </div>

          <div className="landing-stat">
            <strong>92%</strong>
            <span>Match satisfaction</span>
          </div>
        </div>
      </section>

      {/* =====================================================
          INTRO / PUBLICITY
      ====================================================== */}

      <section className="landing-intro" id="about">
        <div className="landing-container landing-intro-grid">
          <div className="landing-intro-title">
            <span className="landing-section-label">WELCOME TO JOBFIND</span>
            <h2>
              Your career.
              <span> Your opportunity.</span>
            </h2>
          </div>

          <div className="landing-intro-text">
            <p>
              Finding a job should not feel complicated. JobFind brings job
              seekers and employers together through a simple, modern, and
              accessible platform designed around real opportunities.
            </p>

            <p>
              Whether you are searching for your first position, planning your
              next career move, or looking for talented people to join your
              organization, JobFind gives you the tools to take the next step.
            </p>

            <button
              type="button"
              className="landing-text-link"
              onClick={() => scrollToSection("services")}
            >
              Discover what JobFind offers
              <span>→</span>
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          SERVICES
      ====================================================== */}

      <section className="landing-services" id="services">
        <div className="landing-container">
          <div className="landing-section-heading">
            <span className="landing-section-label">WHAT JOBFIND OFFERS</span>
            <h2>
              Everything you need to move
              <span> your career forward.</span>
            </h2>
            <p>
              From discovering opportunities to connecting employers with
              talent, JobFind brings the essential parts of the recruitment
              journey together.
            </p>
          </div>

          <div className="landing-services-grid">
            {SERVICES.map((service) => (
              <article className="landing-service-card" key={service.number}>
                <div className="landing-service-top">
                  <span className="landing-service-icon">{service.icon}</span>
                  <span className="landing-service-number">
                    {service.number}
                  </span>
                </div>

                <h3>{service.title}</h3>

                <p>{service.text}</p>

                <button
                  type="button"
                  onClick={() =>
                    onGetStarted(
                      service.title === "Recruit better"
                        ? "recruiter"
                        : "seeker"
                    )
                  }
                >
                  Learn more <span>↗</span>
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          JOB CATEGORIES
      ====================================================== */}

      <section className="landing-categories">
        <div className="landing-container">
          <div className="landing-section-heading landing-heading-row">
            <div>
              <span className="landing-section-label">EXPLORE CAREERS</span>
              <h2>
                Opportunities across
                <span> different industries.</span>
              </h2>
            </div>

            <button
              type="button"
              className="landing-outline-button"
              onClick={onBrowseJobs}
            >
              Browse opportunities
              <span>→</span>
            </button>
          </div>

          <div className="landing-category-grid">
            <button
              type="button"
              className={`landing-category-card ${
                activeCategory === "All"
                  ? "landing-category-active"
                  : ""
              }`}
              onClick={() => {
                setActiveCategory("All");
                scrollToSection("jobs");
              }}
            >
              <span className="landing-category-icon">✦</span>
              <strong>All Opportunities</strong>
              <small>Explore all jobs</small>
              <span className="landing-category-arrow">→</span>
            </button>

            {CATEGORIES.map((category) => (
              <button
                type="button"
                key={category.name}
                className={`landing-category-card ${
                  activeCategory === category.name
                    ? "landing-category-active"
                    : ""
                }`}
                onClick={() => {
                  setActiveCategory(category.name);
                  scrollToSection("jobs");
                }}
              >
                <span className="landing-category-icon">
                  {category.icon}
                </span>

                <strong>{category.name}</strong>

                <small>{category.jobs}</small>

                <span className="landing-category-arrow">→</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          JOBS
      ====================================================== */}

      <section className="landing-jobs" id="jobs">
        <div className="landing-container">
          <div className="landing-section-heading landing-heading-row">
            <div>
              <span className="landing-section-label">LATEST OPPORTUNITIES</span>
              <h2>
                Find something worth
                <span> applying for.</span>
              </h2>
              <p>
                Explore selected opportunities and discover where your skills
                can take you.
              </p>
            </div>

            <button
              type="button"
              className="landing-outline-button"
              onClick={onBrowseJobs}
            >
              View all jobs
              <span>→</span>
            </button>
          </div>

          <div className="landing-job-filter">
            <button
              type="button"
              className={activeCategory === "All" ? "active" : ""}
              onClick={() => setActiveCategory("All")}
            >
              All
            </button>

            {CATEGORIES.map((category) => (
              <button
                type="button"
                key={category.name}
                className={
                  activeCategory === category.name ? "active" : ""
                }
                onClick={() => setActiveCategory(category.name)}
              >
                {category.name}
              </button>
            ))}
          </div>

          {displayedJobs.length > 0 ? (
            <div className="landing-job-grid">
              {displayedJobs.map((job) => (
                <article className="landing-job-card" key={job.id}>
                  <div className="landing-job-card-top">
                    <div className="landing-company-logo">
                      {job.company.charAt(0)}
                    </div>

                    {job.featured && (
                      <span className="landing-featured">FEATURED</span>
                    )}
                  </div>

                  <span className="landing-job-category">
                    {job.category}
                  </span>

                  <h3>{job.title}</h3>

                  <p className="landing-company-name">{job.company}</p>

                  <div className="landing-job-meta">
                    <span>⌖ {job.location}</span>
                    <span>◷ {job.type}</span>
                  </div>

                  <div className="landing-job-bottom">
                    <strong>{job.salary}</strong>

                    <button
                      type="button"
                      onClick={() => onBrowseJobs()}
                    >
                      View Job
                      <span>→</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="landing-empty-jobs">
              <div>⌕</div>
              <h3>No opportunities found</h3>
              <p>
                Try another keyword, location, or category.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setLocation("");
                  setActiveCategory("All");
                }}
              >
                Show all jobs
              </button>
            </div>
          )}

          {filteredJobs.length > 4 && !showAllJobs && (
            <div className="landing-load-more">
              <button
                type="button"
                className="landing-outline-button"
                onClick={() => setShowAllJobs(true)}
              >
                Show more opportunities
                <span>↓</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          JOB SEEKERS
      ====================================================== */}

      <section className="landing-seeker-section">
        <div className="landing-container landing-seeker-grid">
          <div className="landing-seeker-copy">
            <span className="landing-section-label">
              FOR JOB SEEKERS
            </span>

            <h2>
              Stop searching endlessly.
              <span> Start moving forward.</span>
            </h2>

            <p>
              JobFind helps you spend less time searching and more time
              discovering opportunities that actually match your career goals.
            </p>

            <div className="landing-feature-list">
              {FEATURES.slice(0, 4).map((feature) => (
                <div key={feature}>
                  <span>✓</span>
                  <strong>{feature}</strong>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="landing-btn landing-btn-dark"
              onClick={() => onGetStarted("seeker")}
            >
              Create your profile
              <span>→</span>
            </button>
          </div>

          <div className="landing-seeker-visual">
            <div className="landing-visual-glow" />

            <div className="landing-profile-card">
              <div className="landing-profile-top">
                <div className="landing-profile-avatar">A</div>

                <div>
                  <strong>Your career profile</strong>
                  <span>Ready for opportunities</span>
                </div>

                <span className="landing-profile-check">✓</span>
              </div>

              <div className="landing-progress">
                <div className="landing-progress-label">
                  <span>Profile strength</span>
                  <strong>92%</strong>
                </div>

                <div className="landing-progress-track">
                  <span />
                </div>
              </div>

              <div className="landing-profile-skills">
                <span>React</span>
                <span>TypeScript</span>
                <span>UI/UX</span>
                <span>+4</span>
              </div>

              <div className="landing-profile-opportunity">
                <span className="landing-opportunity-dot" />

                <div>
                  <strong>New opportunity</strong>
                  <small>Frontend Developer · Remote</small>
                </div>

                <span>→</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          EMPLOYERS
      ====================================================== */}

      <section className="landing-employer-section">
        <div className="landing-container landing-employer-grid">
          <div className="landing-employer-visual">
            <div className="landing-employer-card">
              <span className="landing-section-label">EMPLOYER DASHBOARD</span>

              <h3>Find the people who can move your business forward.</h3>

              <div className="landing-candidate-row">
                <span>JM</span>
                <div>
                  <strong>Frontend Developer</strong>
                  <small>98% profile match</small>
                </div>
                <b>✓</b>
              </div>

              <div className="landing-candidate-row">
                <span>CN</span>
                <div>
                  <strong>Product Designer</strong>
                  <small>94% profile match</small>
                </div>
                <b>✓</b>
              </div>

              <div className="landing-candidate-row">
                <span>FA</span>
                <div>
                  <strong>Software Engineer</strong>
                  <small>91% profile match</small>
                </div>
                <b>✓</b>
              </div>
            </div>
          </div>

          <div className="landing-employer-copy">
            <span className="landing-section-label">
              FOR EMPLOYERS
            </span>

            <h2>
              Your next great hire
              <span> could be one search away.</span>
            </h2>

            <p>
              Reach qualified candidates and make recruitment simpler. JobFind
              gives employers a practical way to publish opportunities and
              connect with people looking for their next role.
            </p>

            <div className="landing-feature-list">
              {FEATURES.slice(4).map((feature) => (
                <div key={feature}>
                  <span>✓</span>
                  <strong>{feature}</strong>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="landing-btn landing-btn-primary-dark"
              onClick={() => onGetStarted("recruiter")}
            >
              Start hiring
              <span>→</span>
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          WHY JOBFIND
      ====================================================== */}

      <section className="landing-why">
        <div className="landing-container">
          <div className="landing-section-heading">
            <span className="landing-section-label">WHY JOBFIND</span>

            <h2>
              Built to make opportunity
              <span> easier to find.</span>
            </h2>
          </div>

          <div className="landing-why-grid">
            <article>
              <span>01</span>
              <h3>Simple</h3>
              <p>
                A straightforward experience without unnecessary complexity.
              </p>
            </article>

            <article>
              <span>02</span>
              <h3>Accessible</h3>
              <p>
                Discover opportunities from Cameroon and beyond, wherever you
                are.
              </p>
            </article>

            <article>
              <span>03</span>
              <h3>Connected</h3>
              <p>
                Bring job seekers and employers together in one ecosystem.
              </p>
            </article>

            <article>
              <span>04</span>
              <h3>Career focused</h3>
              <p>
                Designed around helping people take their next professional
                step.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* =====================================================
          PUBLICITY CTA
      ====================================================== */}

      <section className="landing-publicity">
        <div className="landing-publicity-glow" />

        <div className="landing-container landing-publicity-inner">
          <div>
            <span className="landing-section-label">
              YOUR NEXT OPPORTUNITY STARTS HERE
            </span>

            <h2>
              One platform.
              <span> Endless possibilities.</span>
            </h2>

            <p>
              Whether you are looking for your next job or your next great
              hire, JobFind is ready to help you make the connection.
            </p>
          </div>

          <div className="landing-publicity-actions">
            <button
              type="button"
              className="landing-btn landing-btn-primary"
              onClick={() => onGetStarted("seeker")}
            >
              I'm looking for a job
              <span>→</span>
            </button>

            <button
              type="button"
              className="landing-btn landing-btn-glass"
              onClick={() => onGetStarted("recruiter")}
            >
              I'm hiring
              <span>→</span>
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          FAQ PREVIEW
      ====================================================== */}

      <section className="landing-faq" id="faq">
        <div className="landing-container">
          <div className="landing-section-heading landing-heading-row">
            <div>
              <span className="landing-section-label">QUESTIONS?</span>
              <h2>
                We've got
                <span> answers.</span>
              </h2>
              <p>
                Find quick answers to some of the questions people ask about
                JobFind.
              </p>
            </div>
          </div>

          <div className="landing-faq-list">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <article
                  className={`landing-faq-item ${
                    isOpen ? "landing-faq-open" : ""
                  }`}
                  key={faq.question}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenFaq(isOpen ? null : index)
                    }
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    <strong>{isOpen ? "−" : "+"}</strong>
                  </button>

                  {isOpen && (
                    <div className="landing-faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          <div className="landing-faq-link">
            <button
              type="button"
              onClick={() => {
                scrollToSection("home");
                window.dispatchEvent(
                  new CustomEvent("jobfind-open-faq")
                );
              }}
            >
              Visit the full FAQ page
              <span>→</span>
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ====================================================== */}

      <section className="landing-final-cta">
        <div className="landing-final-decoration landing-final-decoration-one" />
        <div className="landing-final-decoration landing-final-decoration-two" />

        <div className="landing-container landing-final-inner">
          <span className="landing-section-label">JOBFIND</span>

          <h2>
            Your next chapter
            <span> starts here.</span>
          </h2>

          <p>
            Find opportunities. Build connections. Grow your career.
            Discover what is waiting for you on JobFind.
          </p>

          <div className="landing-final-buttons">
            <button
              type="button"
              className="landing-btn landing-btn-primary"
              onClick={() => onGetStarted("seeker")}
            >
              Get Started
              <span>→</span>
            </button>

            <button
              type="button"
              className="landing-final-text-button"
              onClick={onBrowseJobs}
            >
              Explore opportunities
              <span>↗</span>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}