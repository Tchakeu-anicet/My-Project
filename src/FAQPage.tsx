import { useMemo, useState, type JSX } from "react";
import "./FAQPage.css";

interface FAQItem {
  category: string;
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    category: "Getting Started",
    question: "Why choosing jobfind over other job search platforms?",
    answer:
      "jobfind connects job seekers with employers through a simple, fast, and user-friendly experience. You can browse opportunities, apply for positions, manage applications, and use our tools to discover roles that fit your goals.",
  },
  {
    category: "Getting Started",
    question: "Is JobFind free to use?",
    answer:
      "Yes. Browsing and applying to jobs is free for job seekers. Employers can use available posting options and choose additional visibility features when they need them.",
  },
  {
    category: "Job Seekers",
    question: "How do I apply for a job?",
    answer:
      "Create your account, complete your profile, browse jobs from the Find Jobs area, open a listing that interests you, and select Apply Now. Keep your profile and CV up to date for better opportunities.",
  },
  {
    category: "Employers",
    question: "How long does it take to post a job?",
    answer:
      "Most employers can create a listing in a few minutes. Once the required information is completed and the listing passes the platform's review process, it can become visible to candidates.",
  },
  {
    category: "Accounts",
    question: "Can I edit my profile or job listing after publishing?",
    answer:
      "Yes. Job seekers can update their profile information, while employers can edit their job listings from the appropriate dashboard.",
  },
  {
    category: "Security",
    question: "Is my personal information secure?",
    answer:
      "JobFind is designed with privacy and security in mind. Keep your password private, use a strong password, and only provide information necessary for your job-search or recruitment activity.",
  },
  {
    category: "Support",
    question: "How do I contact JobFind support?",
    answer:
      "Use the Contact Us page to send a message to our team. You can also use the support contact details provided there for questions about your account or the platform.",
  },
];

const CATEGORIES = [
  "All",
  "Getting Started",
  "Job Seekers",
  "Employers",
  "Accounts",
  "Security",
  "Support",
];

export default function FAQPage(): JSX.Element {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filteredFAQs = useMemo(() => {
    const q = search.trim().toLowerCase();

    return FAQS.filter(
      (item) =>
        (activeCategory === "All" ||
          item.category === activeCategory) &&
        (!q ||
          item.question.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q))
    );
  }, [activeCategory, search]);

  return (
    <main className="faq-page">
      <section className="faq-hero">
        <div className="faq-hero-orb faq-hero-orb-one" />
        <div className="faq-hero-orb faq-hero-orb-two" />
        <div className="faq-hero-grid" />

        <div className="faq-container faq-hero-content">
          <span className="faq-eyebrow">JOBFIND HELP CENTER</span>

          <h1>
            Questions?
            <span> We&apos;ve got answers.</span>
          </h1>

          <p>
            Everything you need to know about finding jobs, applying,
            recruiting, and getting the most from JobFind.
          </p>

          <div className="faq-search">
            <span>⌕</span>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search your question..."
              aria-label="Search frequently asked questions"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="faq-content">
        <div className="faq-container">
          <div className="faq-category-bar">
            {CATEGORIES.map((category) => (
              <button
                type="button"
                key={category}
                className={
                  activeCategory === category
                    ? "faq-category-active"
                    : ""
                }
                onClick={() => {
                  setActiveCategory(category);
                  setOpenIndex(null);
                }}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="faq-layout">
            <aside className="faq-side-card">
              <div className="faq-side-icon">?</div>

              <span className="faq-eyebrow">NEED MORE HELP?</span>

              <h2>Can&apos;t find your answer?</h2>

              <p>
                Send our team a message and we&apos;ll help you with your
                question.
              </p>

              <a href="#contact">
                Contact JobFind <span>→</span>
              </a>
            </aside>

            <div className="faq-list">
              {filteredFAQs.length === 0 ? (
                <div className="faq-empty">
                  <div>⌕</div>

                  <h2>No matching questions</h2>

                  <p>
                    Try another search term or choose a different category.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setActiveCategory("All");
                    }}
                  >
                    Show all questions
                  </button>
                </div>
              ) : (
                filteredFAQs.map((item, index) => {
                  const open = openIndex === index;

                  return (
                    <article
                      className={`faq-item ${
                        open ? "faq-item-open" : ""
                      }`}
                      key={item.question}
                    >
                      <button
                        type="button"
                        className="faq-question"
                        onClick={() =>
                          setOpenIndex(open ? null : index)
                        }
                        aria-expanded={open}
                      >
                        <span className="faq-question-main">
                          <small>{item.category}</small>
                          <strong>{item.question}</strong>
                        </span>

                        <span className="faq-toggle">
                          {open ? "−" : "+"}
                        </span>
                      </button>

                      <div className="faq-answer-wrap">
                        <div className="faq-answer">
                          <p>{item.answer}</p>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="faq-bottom-cta" id="contact">
        <div className="faq-container">
          <div>
            <span className="faq-eyebrow faq-bottom-eyebrow">
              STILL NEED HELP?
            </span>

            <h2>We&apos;re only a message away.</h2>

            <p>
              Let&apos;s get you moving toward your next opportunity.
            </p>
          </div>

          <a href="#contact">
            Contact Us <span>→</span>
          </a>
        </div>
      </section>
    </main>
  );
}