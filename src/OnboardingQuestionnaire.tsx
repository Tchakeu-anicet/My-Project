// ============================================================
// JOBFIND - DYNAMIC BRANCHING ONBOARDING QUESTIONNAIRE
// ============================================================

import { useState, type JSX } from "react";

import type {
  UserAccount,
  SeekerWorkType,
  RecruiterType,
  RecruiterLevel,
  RecruiterContext,
  RecruitmentPurpose,
  RecruitmentFrequency,
  JobCategoryPreference,
  RecruitmentCategoryPreference,
} from "./types";

import {
  completeSeekerOnboarding,
  completeRecruiterOnboarding,
} from "./authStorage";

import "./OnboardingQuestionnaire.css";

interface Props {
  user: UserAccount;
  onComplete: (user: UserAccount) => void;
}

export default function OnboardingQuestionnaire({
  user,
  onComplete,
}: Props): JSX.Element {
  /* ---------------- STEP & ROLE STATE ---------------- */
  const [role, setRole] = useState<"seeker" | "recruiter">("seeker");
  const [step, setStep] = useState(1);

  /* ---------------- SEEKER BRANCH STATE ---------------- */
  type SeekerPath = "trades" | "office" | "remote";
  const [seekerPath, setSeekerPath] = useState<SeekerPath>("trades");
  const [seekerSkills, setSeekerSkills] = useState<JobCategoryPreference[]>([]);
  const [customSeekerSkill, setCustomSeekerSkill] = useState("");
  const [city, setCity] = useState(user.city || "");
  const [locationError, setLocationError] = useState("");

  /* ---------------- RECRUITER BRANCH STATE ---------------- */
  type RecruiterBranch = "household" | "solo_entrepreneur" | "company" | "agency";
  const [recruiterBranch, setRecruiterBranch] = useState<RecruiterBranch>("household");

  /* Household Specifics */
  const [householdServiceCategory, setHouseholdServiceCategory] = useState<string>("Home Cleaning & Maintenance");

  /* Solo Entrepreneur Specifics */
  const [soloBusinessField, setSoloBusinessField] = useState<string>("Software & Tech Projects");

  /* Company Specifics */
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [companyHiringType, setCompanyHiringType] = useState<string>("Full-Time Employees");

  /* Agency Specifics */
  const [agencyName, setAgencyName] = useState("");
  const [agencySpecialization, setAgencySpecialization] = useState<string>("General Staffing Placement");
  const [agencyVolume, setAgencyVolume] = useState<string>("High-Volume Bulk Hiring");

  /* Recruiter Shared Worker Categories Needed */
  const [workerCategories, setWorkerCategories] = useState<RecruitmentCategoryPreference[]>([]);
  const [customWorkerCategory, setCustomWorkerCategory] = useState("");

  const totalSteps = role === "recruiter" ? 5 : 4;
  const progress = Math.round((step / totalSteps) * 100);

  /* ============================================================
     SEEKER CATEGORY LISTS BY PATH
     ============================================================ */
  const TRADE_SKILLS = [
    { id: "plumbing", name: "Plumbing & Piping", icon: "🔧" },
    { id: "carpentry", name: "Carpentry & Woodwork", icon: "🪚" },
    { id: "electrical", name: "Electrical Wiring", icon: "⚡" },
    { id: "masonry", name: "Masonry & Building", icon: "🧱" },
    { id: "cleaning", name: "House Cleaning & Housekeeping", icon: "🧹" },
    { id: "driving", name: "Private & Commercial Driving", icon: "🚗" },
    { id: "security", name: "Home & Facility Guarding", icon: "🛡️" },
    { id: "gardening", name: "Gardening & Lawn Care", icon: "🌱" },
    { id: "childcare", name: "Childcare & Babysitting", icon: "👶" },
  ];

  const OFFICE_SKILLS = [
    { id: "software", name: "Software Development", icon: "💻" },
    { id: "accounting", name: "Accounting & Finance", icon: "📊" },
    { id: "marketing", name: "Digital Marketing & Sales", icon: "📣" },
    { id: "admin", name: "Office Administration", icon: "📁" },
    { id: "education", name: "Teaching & Tutoring", icon: "📚" },
    { id: "design", name: "Graphic & UI/UX Design", icon: "🎨" },
    { id: "hr", name: "Human Resources & Recruitment", icon: "👥" },
  ];

  const REMOTE_SKILLS = [
    { id: "webdev", name: "Web & App Engineering", icon: "💻" },
    { id: "uiux", name: "UI/UX & Product Design", icon: "🎨" },
    { id: "content", name: "Copywriting & Content Creation", icon: "✍️" },
    { id: "va", name: "Virtual Assistance & Support", icon: "🎧" },
    { id: "smm", name: "Social Media Management", icon: "📱" },
    { id: "data", name: "Data Entry & Analysis", icon: "📈" },
  ];

  const currentSeekerSkillsList =
    seekerPath === "trades"
      ? TRADE_SKILLS
      : seekerPath === "office"
      ? OFFICE_SKILLS
      : REMOTE_SKILLS;

  /* Helper to toggle skill selection */
  const toggleSeekerSkill = (skillName: string, id: string) => {
    setSeekerSkills((prev) => {
      const exists = prev.some((s) => s.name === skillName);
      if (exists) return prev.filter((s) => s.name !== skillName);
      return [...prev, { id, name: skillName, source: "predefined" }];
    });
  };

  const addCustomSeekerSkill = () => {
    const val = customSeekerSkill.trim();
    if (!val) return;
    if (!seekerSkills.some((s) => s.name.toLowerCase() === val.toLowerCase())) {
      setSeekerSkills((prev) => [
        ...prev,
        { id: `custom-${Date.now()}`, name: val, source: "custom" },
      ]);
    }
    setCustomSeekerSkill("");
  };

  const toggleWorkerCategory = (categoryName: string, id: string) => {
    setWorkerCategories((prev) => {
      const exists = prev.some((c) => c.name === categoryName);
      if (exists) return prev.filter((c) => c.name !== categoryName);
      return [...prev, { id, name: categoryName, source: "predefined" }];
    });
  };

  const addCustomWorkerCategory = () => {
    const val = customWorkerCategory.trim();
    if (!val) return;
    if (!workerCategories.some((c) => c.name.toLowerCase() === val.toLowerCase())) {
      setWorkerCategories((prev) => [
        ...prev,
        { id: `custom-${Date.now()}`, name: val, source: "custom" },
      ]);
    }
    setCustomWorkerCategory("");
  };

  const nextStep = () => {
    const trimmedCity = city.trim();

    if (step === totalSteps && trimmedCity.length < 2) {
      setLocationError("Please enter your location before continuing.");
      return;
    }

    setLocationError("");

    if (step < totalSteps) {
      setStep((s) => s + 1);
    } else {
      finishOnboarding();
    }
  };

  const prevStep = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleRoleSelect = (nextRole: "seeker" | "recruiter") => {
    setRole(nextRole);
    setStep(1);
  };

  const finishOnboarding = () => {
    if (role === "seeker") {
      const mappedWorkTypes: SeekerWorkType[] =
        seekerPath === "trades"
          ? ["local-services", "gigs"]
          : seekerPath === "remote"
          ? ["remote", "freelance"]
          : ["full-time", "part-time"];

      const updated = completeSeekerOnboarding({
        workTypes: mappedWorkTypes,
        jobCategories: seekerSkills,
        customJobCategories: seekerSkills
          .filter((s) => s.source === "custom")
          .map((s) => s.name),
        city,
      });
      if (updated) onComplete(updated);
    } else {
      /* Derive Recruiter Profile based strictly on chosen branch */
      let recType: RecruiterType = "individual";
      let recLevel: RecruiterLevel = "solo";
      let recContext: RecruiterContext = "individual_employer";
      let recPurpose: RecruitmentPurpose = "home_service";
      let recFreq: RecruitmentFrequency = "occasional";

      if (recruiterBranch === "household") {
        recType = "individual";
        recLevel = "solo";
        recContext = "individual_employer";
        recPurpose = "home_service";
        recFreq = "occasional";
      } else if (recruiterBranch === "solo_entrepreneur") {
        recType = "individual";
        recLevel = "solo";
        recContext = "solo_entrepreneur";
        recPurpose = "quick_task";
        recFreq = "occasional";
      } else if (recruiterBranch === "company") {
        recType = "company";
        recLevel = "small";
        recContext = "company_representative";
        recPurpose = "professional_recruitment";
        recFreq = "monthly";
      } else if (recruiterBranch === "agency") {
        recType = "agency";
        recLevel = "large";
        recContext = "company_representative";
        recPurpose = "professional_recruitment";
        recFreq = "continuous";
      }

      const compName =
        recruiterBranch === "company"
          ? companyName.trim()
          : recruiterBranch === "agency"
          ? agencyName.trim()
          : undefined;

      const indName =
        recruiterBranch === "company"
          ? industry.trim()
          : recruiterBranch === "agency"
          ? agencySpecialization
          : recruiterBranch === "solo_entrepreneur"
          ? soloBusinessField
          : householdServiceCategory;

      const updated = completeRecruiterOnboarding({
        recruiterType: recType,
        recruiterLevel: recLevel,
        recruiterContext: recContext,
        recruitmentPurpose: recPurpose,
        recruitmentFrequency: recFreq,
        workerCategories,
        customWorkerCategories: workerCategories
          .filter((c) => c.source === "custom")
          .map((c) => c.name),
        companyName: compName,
        industry: indName,
        city,
      });
      if (updated) onComplete(updated);
    }
  };

  return (
    <div className="jf-onboarding">
      <div className="jf-onboarding-card">
        {/* HEADER & PROGRESS BAR */}
        <div className="jf-onboarding-header">
          <div className="jf-onboarding-brand">
            <span>J</span>
            <div>
              <strong>job<b>find</b>.</strong>
            </div>
          </div>
          <div className="jf-progress-info">
            <span>
              Step {step} of {totalSteps} — {role === "seeker" ? "Job Seeker Setup" : `${recruiterBranch.replace("_", " ").toUpperCase()} Setup`}
            </span>
            <strong>{progress}% Completed</strong>
          </div>
          <div className="jf-progress">
            <div style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {/* STEP BODY */}
        <div className="jf-onboarding-content">
          {/* STEP 1: ROLE & BRANCH SELECTION */}
          {step === 1 && (
            <div className="onboarding-step">
              <span className="jf-question-kicker">STEP 1: PRIMARY ROLE</span>
              <h1>Welcome! How do you plan to use JobFind?</h1>
              <p>Choose your account path. All subsequent questions will tailor dynamically to your choice.</p>

              <div className="jf-choice-grid">
                <button
                  type="button"
                  className={`jf-choice-card ${role === "seeker" ? "active" : ""}`}
                  onClick={() => handleRoleSelect("seeker")}
                >
                  <div className="jf-choice-icon">🛠️</div>
                  <h3>I am looking for Work</h3>
                  <p>Find full-time jobs, local service gigs, freelance contracts, or remote projects.</p>
                  <span className="choice-badge">Job Seeker Path</span>
                </button>

                <button
                  type="button"
                  className={`jf-choice-card ${role === "recruiter" ? "active" : ""}`}
                  onClick={() => handleRoleSelect("recruiter")}
                >
                  <div className="jf-choice-icon">💼</div>
                  <h3>I am looking to Hire</h3>
                  <p>Hire workers for home services, business projects, small business tasks, or company staff.</p>
                  <span className="choice-badge recruiter">Recruiter / Employer Path</span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================
             PATH A: JOB SEEKER FLOW
             ============================================================ */}
          {role === "seeker" && step === 2 && (
            <div className="onboarding-step">
              <span className="jf-question-kicker">STEP 2: TARGET WORK PATH</span>
              <h1>What is your main work focus?</h1>
              <p>Select your target work path to see relevant skill options.</p>

              <div className="employer-profile-grid">
                <div
                  className={`employer-choice-card ${seekerPath === "trades" ? "selected" : ""}`}
                  onClick={() => setSeekerPath("trades")}
                >
                  <div className="ec-icon">🛠️</div>
                  <div>
                    <h4>Local Services & Hands-On Trades</h4>
                    <p>Plumbing, electrical repair, carpentry, house cleaning, driving, gardening, security.</p>
                  </div>
                </div>

                <div
                  className={`employer-choice-card ${seekerPath === "office" ? "selected" : ""}`}
                  onClick={() => setSeekerPath("office")}
                >
                  <div className="ec-icon">💼</div>
                  <div>
                    <h4>Corporate & Office Careers</h4>
                    <p>Software development, accounting, digital marketing, office administration, sales, teaching.</p>
                  </div>
                </div>

                <div
                  className={`employer-choice-card ${seekerPath === "remote" ? "selected" : ""}`}
                  onClick={() => setSeekerPath("remote")}
                >
                  <div className="ec-icon">🌐</div>
                  <div>
                    <h4>Freelance & Remote Projects</h4>
                    <p>Web engineering, UI/UX design, content writing, virtual assistance, social media mgmt.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {role === "seeker" && step === 3 && (
            <div className="onboarding-step">
              <span className="jf-question-kicker">STEP 3: SKILLS ({seekerPath.toUpperCase()})</span>
              <h1>Select your specific skills & expertise</h1>
              <p>Pick all skills that match your experience in <strong>{seekerPath === "trades" ? "Local Trades" : seekerPath === "office" ? "Corporate & Office" : "Freelance & Remote"}</strong>.</p>

              <div className="categories-selection-grid">
                {currentSeekerSkillsList.map((skill) => {
                  const isSelected = seekerSkills.some((s) => s.name === skill.name);
                  return (
                    <div
                      key={skill.id}
                      className={`cat-chip ${isSelected ? "selected" : ""}`}
                      onClick={() => toggleSeekerSkill(skill.name, skill.id)}
                    >
                      <span className="cat-icon">{skill.icon}</span>
                      <span className="cat-name">{skill.name}</span>
                      {isSelected && <span className="cat-check">✓</span>}
                    </div>
                  );
                })}
              </div>

              <div className="hiring-purpose-section" style={{ marginTop: "28px" }}>
                <h3>Personalise Searching</h3>
                <p style={{ marginBottom: "14px" }}>
                  If you do not see the exact role or service you need, add your own search term.
                </p>
                <div className="custom-category-input-group">
                  <input
                    type="text"
                    placeholder="e.g. Sport Trainer, Solar Repair, Video Editing..."
                    value={customSeekerSkill}
                    onChange={(e) => setCustomSeekerSkill(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCustomSeekerSkill()}
                  />
                  <button type="button" onClick={addCustomSeekerSkill}>
                    Add Skill
                  </button>
                </div>
              </div>

              <div className="explicit-selection-count">
                Selected Skills: <strong>{seekerSkills.length} skill(s)</strong>
              </div>
            </div>
          )}

          {role === "seeker" && step === 4 && (
            <div className="onboarding-step">
              <span className="jf-question-kicker">STEP 4: LOCATION & CONFIRMATION</span>
              <h1>Set your location and review profile</h1>
              <p>Enter your primary city to receive job alerts nearby.</p>

              <div className="location-input-card">
                <label>Primary City / Base Location:</label>
                <input
                  type="text"
                  placeholder="e.g. Douala, Yaoundé, Bamenda..."
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    if (locationError) setLocationError("");
                  }}
                  required
                />
                {locationError && <div className="location-error">{locationError}</div>}
              </div>

              <div className="onboarding-summary-box">
                <h3>Explicit Summary of Your Seeker Profile</h3>
                <div className="summary-item">
                  <span>Selected Focus:</span>
                  <strong>{seekerPath === "trades" ? "Local Trades & On-Site Services" : seekerPath === "office" ? "Corporate & Office Employment" : "Freelance & Remote Work"}</strong>
                </div>
                <div className="summary-item">
                  <span>Skills Selected:</span>
                  <strong>{seekerSkills.map((s) => s.name).join(", ") || "General Skills"}</strong>
                </div>
                <div className="summary-item">
                  <span>Base Location:</span>
                  <strong>{city || "Not specified"}</strong>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================
             PATH B: RECRUITER / EMPLOYER DYNAMIC BRANCHES
             ============================================================ */}
          {role === "recruiter" && step === 2 && (
            <div className="onboarding-step">
              <span className="jf-question-kicker">STEP 2: EMPLOYER TYPE</span>
              <h1>Which type of employer best describes you?</h1>
              <p>Select your exact category. All remaining questions will tailor strictly to this choice.</p>

              <div className="employer-profile-grid">
                {/* CHOICE 1: HOUSEHOLD */}
                <div
                  className={`employer-choice-card ${recruiterBranch === "household" ? "selected" : ""}`}
                  onClick={() => setRecruiterBranch("household")}
                >
                  <div className="ec-icon">🏡</div>
                  <div>
                    <h4>Household / Individual Employer</h4>
                    <p>I need personal home help: cleaning, plumbing, repairs, gardening, childcare, or private driving.</p>
                  </div>
                </div>

                {/* CHOICE 2: SOLO ENTREPRENEUR */}
                <div
                  className={`employer-choice-card ${recruiterBranch === "solo_entrepreneur" ? "selected" : ""}`}
                  onClick={() => setRecruiterBranch("solo_entrepreneur")}
                >
                  <div className="ec-icon">👤</div>
                  <div>
                    <h4>Solo Entrepreneur / Freelancer</h4>
                    <p>I operate an independent business/practice and need contractors, designers, or tech helpers.</p>
                  </div>
                </div>

                {/* CHOICE 3: COMPANY */}
                <div
                  className={`employer-choice-card ${recruiterBranch === "company" ? "selected" : ""}`}
                  onClick={() => setRecruiterBranch("company")}
                >
                  <div className="ec-icon">🏢</div>
                  <div>
                    <h4>Company / Small-Medium Business</h4>
                    <p>I represent a registered company hiring full-time staff, contract workers, or interns.</p>
                  </div>
                </div>

                {/* CHOICE 4: AGENCY */}
                <div
                  className={`employer-choice-card ${recruiterBranch === "agency" ? "selected" : ""}`}
                  onClick={() => setRecruiterBranch("agency")}
                >
                  <div className="ec-icon">🏛️</div>
                  <div>
                    <h4>Recruitment Agency / Enterprise</h4>
                    <p>We are a staffing agency or enterprise managing high-volume client recruitment.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DYNAMIC STEP 3 FOR RECRUITER BRANCHES */}
          {role === "recruiter" && step === 3 && (
            <div className="onboarding-step">
              {/* BRANCH 1: HOUSEHOLD TAILORED STEP 3 */}
              {recruiterBranch === "household" && (
                <>
                  <span className="jf-question-kicker">STEP 3: HOUSEHOLD SERVICE NEEDED</span>
                  <h1>What category of home employment do you offer or need a worker for?</h1>
                  <p>Select the specific home service or task you need assistance with.</p>

                  <div className="options-pills-grid">
                    {[
                      "🧹 Domestic Cleaning & Housekeeping",
                      "🪚 Home Repairs & Carpentry Fixes",
                      "🔧 Plumbing & Water System Fixes",
                      "⚡ Electrical Wiring & Generator Repairs",
                      "👶 Babysitting & Nanny Care",
                      "🌱 Gardening & Lawn Care",
                      "🚗 Private Driver & Transportation",
                      "🛡️ Home Guarding & Security",
                      "🩺 Elder Care & Home Nursing",
                    ].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={`pill-option ${householdServiceCategory === opt ? "active" : ""}`}
                        onClick={() => setHouseholdServiceCategory(opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  <div className="hiring-purpose-section" style={{ marginTop: "28px" }}>
                    <h3>Personalise Searching</h3>
                    <p style={{ marginBottom: "14px" }}>
                      If you do not see the home service you need, add your own requirement.
                    </p>
                    <div className="custom-category-input-group">
                      <input
                        type="text"
                        placeholder="e.g. Sports Trainer, Private Chef, Home Nurse..."
                        value={customWorkerCategory}
                        onChange={(e) => setCustomWorkerCategory(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addCustomWorkerCategory()}
                      />
                      <button type="button" onClick={addCustomWorkerCategory}>
                        Add Category
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* BRANCH 2: SOLO ENTREPRENEUR TAILORED STEP 3 */}
              {recruiterBranch === "solo_entrepreneur" && (
                <>
                  <span className="jf-question-kicker">STEP 3: SOLO BUSINESS FOCUS</span>
                  <h1>What does your solo business or freelance practice do?</h1>
                  <p>Select the main field your solo business operates in.</p>

                  <div className="options-pills-grid">
                    {[
                      "💻 Software & Tech Projects",
                      "🎨 Creative Design & Media",
                      "🏗️ Construction & Trade Contracting",
                      "📣 Digital Marketing & Sales",
                      "💼 Professional Consulting & Finance",
                      "🍽️ Events, Catering & Hospitality",
                    ].map((f) => (
                      <button
                        key={f}
                        type="button"
                        className={`pill-option ${soloBusinessField === f ? "active" : ""}`}
                        onClick={() => setSoloBusinessField(f)}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  <div className="hiring-purpose-section" style={{ marginTop: "28px" }}>
                    <h3>Personalise Searching</h3>
                    <p style={{ marginBottom: "14px" }}>
                      If you do not see the exact service or worker your solo business needs, add it here.
                    </p>
                    <div className="custom-category-input-group">
                      <input
                        type="text"
                        placeholder="e.g. Sport Trainer, Video Editor, Copywriter..."
                        value={customWorkerCategory}
                        onChange={(e) => setCustomWorkerCategory(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addCustomWorkerCategory()}
                      />
                      <button type="button" onClick={addCustomWorkerCategory}>
                        Add Category
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* BRANCH 3: COMPANY TAILORED STEP 3 */}
              {recruiterBranch === "company" && (
                <>
                  <span className="jf-question-kicker">STEP 3: COMPANY DETAILS</span>
                  <h1>Tell us about your business & hiring model</h1>
                  <p>Enter your company details and employment structure.</p>

                  <div className="company-details-inputs" style={{ marginBottom: "20px" }}>
                    <div className="form-group">
                      <label>Company / Business Name:</label>
                      <input
                        type="text"
                        placeholder="e.g. InnovCam Tech Ltd."
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Industry Sector:</label>
                      <input
                        type="text"
                        placeholder="e.g. Information Technology, Construction..."
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="hiring-purpose-section">
                    <h3>Primary Employment Model:</h3>
                    <div className="options-pills-grid">
                      {[
                        "💼 Full-Time Employees",
                        "⏱️ Part-Time Staff",
                        "📝 Project Contractors",
                        "🎓 Interns & Trainees",
                      ].map((m) => (
                        <button
                          key={m}
                          type="button"
                          className={`pill-option ${companyHiringType === m ? "active" : ""}`}
                          onClick={() => setCompanyHiringType(m)}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* BRANCH 4: AGENCY TAILORED STEP 3 */}
              {recruiterBranch === "agency" && (
                <>
                  <span className="jf-question-kicker">STEP 4: AGENCY SPECIALIZATION</span>
                  <h1>Agency Profile & Staffing Volume</h1>
                  <p>Define your agency's recruitment scope.</p>

                  <div className="company-details-inputs" style={{ marginBottom: "20px" }}>
                    <div className="form-group">
                      <label>Agency / Enterprise Name:</label>
                      <input
                        type="text"
                        placeholder="e.g. Apex Staffing Partners"
                        value={agencyName}
                        onChange={(e) => setAgencyName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="hiring-purpose-section" style={{ marginBottom: "20px" }}>
                    <h3>Recruitment Specialization:</h3>
                    <div className="options-pills-grid">
                      {[
                        "General Staffing Placement",
                        "IT & Tech Recruitment",
                        "Blue-Collar & Trades Staffing",
                        "Executive & Specialist Search",
                        "Hospitality & Event Staffing",
                      ].map((spec) => (
                        <button
                          key={spec}
                          type="button"
                          className={`pill-option ${agencySpecialization === spec ? "active" : ""}`}
                          onClick={() => setAgencySpecialization(spec)}
                        >
                          {spec}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="hiring-purpose-section" style={{ marginBottom: "20px" }}>
                    <h3>Personalise Searching</h3>
                    <p style={{ marginBottom: "14px" }}>
                      If you do not see the recruitment category or worker type you need, add your own search.
                    </p>
                    <div className="custom-category-input-group">
                      <input
                        type="text"
                        placeholder="e.g. Sports Coach, Event Staff, Hospitality Crew..."
                        value={customWorkerCategory}
                        onChange={(e) => setCustomWorkerCategory(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addCustomWorkerCategory()}
                      />
                      <button type="button" onClick={addCustomWorkerCategory}>
                        Add Category
                      </button>
                    </div>
                  </div>

                  <div className="hiring-purpose-section">
                    <h3>Hiring Volume:</h3>
                    <div className="options-pills-grid">
                      {[
                        "High-Volume Bulk Hiring",
                        "Specialized Executive Search",
                        "Continuous Client Staffing",
                      ].map((vol) => (
                        <button
                          key={vol}
                          type="button"
                          className={`pill-option ${agencyVolume === vol ? "active" : ""}`}
                          onClick={() => setAgencyVolume(vol)}
                        >
                          {vol}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* DYNAMIC STEP 4 FOR RECRUITERS: WORKER CATEGORIES NEEDED */}
          {role === "recruiter" && step === 4 && (
            <div className="onboarding-step">
              <span className="jf-question-kicker">STEP 4: WORKER CATEGORIES</span>
              <h1>Which types of workers do you need to hire?</h1>
              <p>Select categories to receive matched candidate profiles on your dashboard.</p>

              <div className="categories-selection-grid">
                {[
                  { id: "cleaner", name: "Cleaners & Housekeepers", icon: "🧹" },
                  { id: "plumber", name: "Plumbers & Pipefitters", icon: "🔧" },
                  { id: "electrician", name: "Electricians", icon: "⚡" },
                  { id: "carpenter", name: "Carpenters & Woodworkers", icon: "🪚" },
                  { id: "driver", name: "Drivers & Delivery Personnel", icon: "🚗" },
                  { id: "mason", name: "Masons & Builders", icon: "🧱" },
                  { id: "software-dev", name: "Software Developers", icon: "💻" },
                  { id: "designer", name: "Designers & Creatives", icon: "🎨" },
                  { id: "marketer", name: "Marketing Specialists", icon: "📣" },
                  { id: "accountant", name: "Accountants & Bookkeepers", icon: "📊" },
                  { id: "security", name: "Security Officers", icon: "🛡️" },
                  { id: "childcare", name: "Childcare & Nannies", icon: "👶" },
                ].map((cat) => {
                  const isSelected = workerCategories.some((c) => c.name === cat.name);
                  return (
                    <div
                      key={cat.id}
                      className={`cat-chip ${isSelected ? "selected" : ""}`}
                      onClick={() => toggleWorkerCategory(cat.name, cat.id)}
                    >
                      <span className="cat-icon">{cat.icon}</span>
                      <span className="cat-name">{cat.name}</span>
                      {isSelected && <span className="cat-check">✓</span>}
                    </div>
                  );
                })}
              </div>

              <div className="hiring-purpose-section" style={{ marginTop: "28px" }}>
                <h3>Personalise Searching</h3>
                <p style={{ marginBottom: "14px" }}>
                  If you do not see the worker type you need, add your own requirement such as a sports trainer.
                </p>
                <div className="custom-category-input-group">
                  <input
                    type="text"
                    placeholder="e.g. Sports Trainer, Solar Installer, Chef..."
                    value={customWorkerCategory}
                    onChange={(e) => setCustomWorkerCategory(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCustomWorkerCategory()}
                  />
                  <button type="button" onClick={addCustomWorkerCategory}>
                    Add Category
                  </button>
                </div>
              </div>

              <div className="explicit-selection-count">
                Selected Worker Categories: <strong>{workerCategories.length} category(ies)</strong>
              </div>
            </div>
          )}

          {/* DYNAMIC STEP 5 FOR RECRUITERS: LOCATION & TAILORED SUMMARY */}
          {role === "recruiter" && step === 5 && (
            <div className="onboarding-step">
              <span className="jf-question-kicker">STEP 5: LOCATION & CONFIRMATION</span>
              <h1>Set your location & review employer summary</h1>
              <p>Enter your primary city to receive local worker suggestions.</p>

              <div className="location-input-card">
                <label>Primary City / Base Location:</label>
                <input
                  type="text"
                  placeholder="e.g. Douala, Yaoundé, Bafoussam..."
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    if (locationError) setLocationError("");
                  }}
                  required
                />
                {locationError && <div className="location-error">{locationError}</div>}
              </div>

              <div className="onboarding-summary-box">
                <h3>Explicit Summary of Your {recruiterBranch.replace("_", " ").toUpperCase()} Choice</h3>
                <div className="summary-item">
                  <span>Employer Type:</span>
                  <strong>{recruiterBranch === "household" ? "Household / Individual Employer" : recruiterBranch === "solo_entrepreneur" ? "Solo Entrepreneur / Freelancer" : recruiterBranch === "company" ? "Company / SME" : "Recruitment Agency / Enterprise"}</strong>
                </div>

                {recruiterBranch === "household" && (
                  <div className="summary-item">
                    <span>Home Employment Category Needed:</span>
                    <strong>{householdServiceCategory}</strong>
                  </div>
                )}

                {recruiterBranch === "solo_entrepreneur" && (
                  <div className="summary-item">
                    <span>Business Operating Field:</span>
                    <strong>{soloBusinessField}</strong>
                  </div>
                )}

                {recruiterBranch === "company" && (
                  <>
                    <div className="summary-item">
                      <span>Company Name:</span>
                      <strong>{companyName || "Not specified"} ({industry || "General Industry"})</strong>
                    </div>
                    <div className="summary-item">
                      <span>Employment Model:</span>
                      <strong>{companyHiringType}</strong>
                    </div>
                  </>
                )}

                {recruiterBranch === "agency" && (
                  <>
                    <div className="summary-item">
                      <span>Agency Name:</span>
                      <strong>{agencyName || "Not specified"}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Specialization & Volume:</span>
                      <strong>{agencySpecialization} • {agencyVolume}</strong>
                    </div>
                  </>
                )}

                <div className="summary-item">
                  <span>Worker Categories:</span>
                  <strong>{workerCategories.map((c) => c.name).join(", ") || "General Workers"}</strong>
                </div>

                <div className="summary-item">
                  <span>City Location:</span>
                  <strong>{city || "Not specified"}</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="jf-onboarding-footer">
          {step > 1 ? (
            <button type="button" className="jf-btn-secondary" onClick={prevStep}>
              ← Previous
            </button>
          ) : <div />}

          <button type="button" className="jf-btn-primary" onClick={nextStep}>
            {step === totalSteps ? "🚀 Complete Setup & Launch Workspace" : "Continue ➔"}
          </button>
        </div>
      </div>
    </div>
  );
}