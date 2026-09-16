import type { JSX } from "react";
import "./Aboutpage.css";

const VALUES = [
  {
    icon: "✓",
    title: "Verified opportunities",
    text: "We focus on clear, useful listings so job seekers can spend less time filtering and more time applying.",
  },
  {
    icon: "◎",
    title: "Built for Cameroon",
    text: "JobFind is designed around local employers, candidates, cities, and salary expectations.",
  },
  {
    icon: "⚡",
    title: "Simple by design",
    text: "Search, discover, apply, and manage opportunities without unnecessary steps.",
  },
];

const STATS = [
  { number: "500+", label: "Active listings" },
  { number: "200+", label: "Companies hiring" },
  { number: "10k+", label: "Job seekers" },
  { number: "92%", label: "Match satisfaction" },
];

export default function AboutPage(): JSX.Element {
  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="about-hero-orb about-hero-orb-one" />
        <div className="about-hero-orb about-hero-orb-two" />
        <div className="about-hero-grid" />

        <div className="about-container about-hero-content">
          <span className="about-eyebrow">ABOUT Jobfind</span>

          <h1>
            Connecting talent
            <span> with opportunity.</span>
          </h1>

          <p>
            JobFind makes finding work and hiring people simpler, faster, and
            more accessible across Cameroon.
          </p>

          <div className="about-hero-badge">
            <span className="about-status-dot" />
            Built for job seekers &amp; employers
          </div>
        </div>
      </section>

      <section className="about-intro">
        <div className="about-container about-intro-grid">
          <div>
            <span className="about-eyebrow">WHY JOBFIND</span>
            <h2>A better way to move careers forward.</h2>
          </div>

          <div className="about-intro-copy">
            <p>
              JobFind was created to make the job search experience feel less
              complicated. We bring candidates and employers together through a
              platform that is easy to understand and built around real
              opportunities.
            </p>

            <p>
              Whether you are looking for your first role, your next career
              move, or the right person for your team, JobFind is designed to
              help you take the next step with confidence.
            </p>
          </div>
        </div>
      </section>

      <section className="about-stats">
        <div className="about-container about-stats-grid">
          {STATS.map((stat, index) => (
            <div className="about-stat" key={stat.label}>
              <span className="about-stat-number">{stat.number}</span>
              <span className="about-stat-label">{stat.label}</span>

              {index < 3 && <span className="about-stat-line" />}
            </div>
          ))}
        </div>
      </section>

      <section className="about-mission">
        <div className="about-container about-mission-grid">
          <div className="about-mission-visual">
            <div className="about-visual-ring about-visual-ring-one" />
            <div className="about-visual-ring about-visual-ring-two" />

            <div className="about-visual-card">
              <span className="about-visual-mark">J</span>
              <strong>jobfind</strong>
              <small>Find the job of your life.</small>
            </div>
          </div>

          <div className="about-mission-copy">
            <span className="about-eyebrow">OUR MISSION</span>

            <h2>Make opportunity easier to find.</h2>

            <p>
              Our mission is to create a trusted bridge between people looking
              for meaningful work and organizations looking for great talent.
            </p>

            <div className="about-mission-points">
              <div>
                <span>01</span>

                <div>
                  <strong>For job seekers</strong>
                  <p>
                    Discover relevant roles and move from searching to applying
                    faster.
                  </p>
                </div>
              </div>

              <div>
                <span>02</span>

                <div>
                  <strong>For employers</strong>
                  <p>
                    Reach candidates and manage recruitment with less friction.
                  </p>
                </div>
              </div>

              <div>
                <span>03</span>

                <div>
                  <strong>For everyone</strong>
                  <p>
                    Create a more transparent and accessible job market.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-values">
        <div className="about-container">
          <div className="about-section-heading">
            <span className="about-eyebrow">WHAT WE VALUE</span>

            <h2>The principles behind JobFind.</h2>

            <p>
              Every feature starts with one question: does this make the
              experience better for the people using it?
            </p>
          </div>

          <div className="about-values-grid">
            {VALUES.map((value, index) => (
              <article
                className={`about-value-card about-value-card-${index + 1}`}
                key={value.title}
              >
                <div className="about-value-icon">{value.icon}</div>

                <span className="about-value-number">
                  0{index + 1}
                </span>

                <h3>{value.title}</h3>

                <p>{value.text}</p>

                <span className="about-value-arrow">↗</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-cta">
        <div className="about-container about-cta-inner">
          <div>
            <span className="about-eyebrow about-cta-eyebrow">
              YOUR NEXT STEP
            </span>

            <h2>Ready to find what&apos;s next?</h2>

            <p>
              Explore JobFind and discover opportunities built around your
              goals.
            </p>
          </div>

          <div className="about-cta-decoration">
            <span>job</span>
            <b>find</b>
          </div>
        </div>
      </section>
    </main>
  );
}