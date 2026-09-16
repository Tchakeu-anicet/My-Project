import React, { useState } from "react";
import "./Contactpage.css";

type ContactForm = {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
};

const ContactPage: React.FC = () => {
  const [form, setForm] = useState<ContactForm>({
    firstName: "",
    lastName: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });

  const [sent, setSent] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.firstName || !form.lastName || !form.email || !form.message) {
      return;
    }

    setSent(true);
  };

  const sendAnother = () => {
    setSent(false);
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      subject: "General Inquiry",
      message: "",
    });
  };

  return (
    <main className="contact-page">
      {/* HERO */}
      <section className="contact-hero">
        <div className="contact-hero-orb contact-hero-orb-one" />
        <div className="contact-hero-orb contact-hero-orb-two" />

        <div className="contact-hero-content">
          <span className="contact-eyebrow">CONTACT jobfind</span>

          <h1>
            Let&apos;s Build Your
            <span> Next Opportunity.</span>
          </h1>

          <p>
            Have a question, need help finding a job, or want to work with
            JobFind? We&apos;re here to help.
          </p>

          <div className="contact-live-status">
            <span className="contact-live-dot" />
            <span>Our support team is available</span>
          </div>
        </div>
      </section>

      {/* CONTACT CONTENT */}
      <section className="contact-main">
        <div className="contact-section-heading">
          <span className="contact-eyebrow">GET IN TOUCH</span>
          <h2>We&apos;d love to hear from you.</h2>
          <p>
            Send us a message and our team will get back to you as soon as
            possible.
          </p>
        </div>

        <div className="contact-grid">
          {/* INFORMATION */}
          <div className="contact-info-column">
            <div className="contact-info-card">
              <div className="contact-icon contact-icon-email" aria-hidden="true">
                ✉
              </div>
              <div>
                <span className="contact-card-label">EMAIL US</span>
                <h3>Let&apos;s talk</h3>
                <a href="mailto:hello@jobfind.com">hello@jobfind.com</a>
                <a href="mailto:support@jobfind.com">support@jobfind.com</a>
              </div>
            </div>

            <div className="contact-info-card">
              <div className="contact-icon contact-icon-phone" aria-hidden="true">
                ☎
              </div>
              <div>
                <span className="contact-card-label">CALL US</span>
                <h3>Speak with us</h3>
                <a href="tel:+237688932299">+237 6 88 93 22 99</a>
                <p>Mon–Fri, 9am–6pm</p>
              </div>
            </div>

            <div className="contact-info-card">
              <div className="contact-icon contact-icon-location" aria-hidden="true">
                ⌖
              </div>
              <div>
                <span className="contact-card-label">VISIT US</span>
                <h3>JobFind Cameroon</h3>
                <p>Yaounde, Cameroon</p>
                <p>Available online worldwide</p>
              </div>
            </div>

            <div className="contact-quote-card">
              <div className="contact-quote-mark">&quot;</div>
              <p>
                Finding the right opportunity should feel simple. That&apos;s
                why we built JobFind.
              </p>
              <span>— The JobFind Team</span>
            </div>
          </div>

          {/* FORM */}
          <div className="contact-form-card">
            {!sent ? (
              <>
                <div className="contact-form-heading">
                  <span className="contact-eyebrow">SEND A MESSAGE</span>
                  <h2>How can we help?</h2>
                  <p>Fill in the form and we&apos;ll be in touch.</p>
                </div>

                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="contact-form-row">
                    <label>
                      <span>First Name</span>
                      <input
                        type="text"
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        placeholder="John"
                        required
                      />
                    </label>

                    <label>
                      <span>Last Name</span>
                      <input
                        type="text"
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        placeholder="Doe"
                        required
                      />
                    </label>
                  </div>

                  <label>
                    <span>Email Address</span>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                    />
                  </label>

                  <label>
                    <span>Subject</span>
                    <select
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                    >
                      <option>General Inquiry</option>
                      <option>Job Seeker Support</option>
                      <option>Employer Support</option>
                      <option>Sales & Partnerships</option>
                      <option>Technical Support</option>
                    </select>
                  </label>

                  <label>
                    <span>Message</span>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell us how we can help you..."
                      rows={6}
                      required
                    />
                  </label>

                  <label className="contact-checkbox">
                    <input type="checkbox" required />
                    <span>
                      I agree to the Privacy Policy and processing of my
                      personal data.
                    </span>
                  </label>

                  <button type="submit" className="contact-submit">
                    <span>Send Message</span>
                    <span aria-hidden="true">→</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="contact-success">
                <div className="contact-success-icon">✓</div>
                <span className="contact-eyebrow">MESSAGE SENT</span>
                <h2>Thank you for reaching out!</h2>
                <p>
                  Your message has been received. We&apos;ll get back to you
                  as soon as possible.
                </p>
                <button type="button" onClick={sendAnother}>
                  Send Another Message
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="contact-faq">
        <div className="contact-section-heading">
          <span className="contact-eyebrow">FAQ</span>
          <h2>Frequently Asked Questions</h2>
          <p>Here are answers to some common questions.</p>
        </div>

        <div className="contact-faq-list">
          <details>
            <summary>What is your typical response time?</summary>
            <p>
              We aim to respond to all inquiries within 24 hours during
              business days.
            </p>
          </details>

          <details>
            <summary>Do you offer phone support?</summary>
            <p>
              Yes. Our support line is available Monday through Friday, from
              9am to 6pm.
            </p>
          </details>

          <details>
            <summary>Can I schedule a demo?</summary>
            <p>
              Absolutely. Select &quot;Sales & Partnerships&quot; in the subject
              dropdown above and tell us what you would like to see.
            </p>
          </details>

          <details>
            <summary>Where are you located?</summary>
            <p>
              JobFind is based in Cameroon and supports job seekers and
              employers online.
            </p>
          </details>
        </div>
      </section>

      {/* CTA - NO FOOTER HERE.
          App.tsx already renders the global JobFind Footer. */}
      <section className="contact-cta">
        <div>
          <span className="contact-eyebrow">YOUR NEXT MOVE</span>
          <h2>Ready to find your next opportunity?</h2>
          <p>
            Explore JobFind and discover opportunities that match your skills
            and goals.
          </p>
        </div>

        <a href="/" className="contact-cta-button">
          Explore Jobs <span aria-hidden="true">→</span>
        </a>
      </section>
    </main>
  );
};

export default ContactPage;