import {
  useEffect,
  useState,
  type FormEvent,
  type JSX,
} from "react";

import type {
  RecruiterType,
  UserAccount,
  WorkerAvailability,
} from "../types";

import { updateCurrentUser } from "../authStorage";

import "./ProfileSection.css";

/**
 * Recruiter categories used by the JobFind recruiter onboarding flow.
 * Kept here as a local type so this component also works with older
 * versions of types.ts that do not yet export RecruiterCategory.
 */
type RecruiterCategory =
  | "solo_entrepreneur"
  | "private_household"
  | "freelance_recruiter"
  | "micro_employer"
  | "side_hustle_provider"
  | "contractor"
  | "other";

type RecruiterProfileView = UserAccount["recruiterProfile"] & {
  recruiterCategory?: RecruiterCategory;
  recruitmentPurpose?: string;
  organizationSize?: string;
  hiringFrequency?: string;
};

interface ProfileSectionProps {
  user: UserAccount;
  onUserUpdated: (user: UserAccount) => void;
  onEnableWorker?: () => void;
  onEnableRecruiter?: (type: RecruiterType) => void;
}

export default function ProfileSection({
  user,
  onUserUpdated,
  onEnableWorker,
  onEnableRecruiter,
}: ProfileSectionProps): JSX.Element {
  const worker = user.seekerProfile;
  const recruiter = user.recruiterProfile as RecruiterProfileView;

  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [city, setCity] = useState(user.city ?? "");

  const [headline, setHeadline] = useState(worker.headline ?? "");
  const [bio, setBio] = useState(worker.bio ?? "");
  const [skills, setSkills] = useState((worker.skills ?? []).join(", "));
  const [services, setServices] = useState((worker.services ?? []).join(", "));
  const [availability, setAvailability] = useState<WorkerAvailability>(
    worker.availability ?? "available"
  );
  const [hourlyRate, setHourlyRate] = useState(worker.hourlyRate ?? "");
  const [experience, setExperience] = useState(worker.experience ?? "");

  const [companyName, setCompanyName] = useState(recruiter.companyName ?? "");
  const [companyDescription, setCompanyDescription] = useState(
    recruiter.companyDescription ?? ""
  );
  const [companyLocation, setCompanyLocation] = useState(
    recruiter.companyLocation ?? ""
  );
  const [industry, setIndustry] = useState(recruiter.industry ?? "");
  const [website, setWebsite] = useState(recruiter.website ?? "");
  const [position, setPosition] = useState(recruiter.position ?? "");
  const [recruitmentPurpose, setRecruitmentPurpose] = useState(
    recruiter.recruitmentPurpose ?? ""
  );
  const [organizationSize, setOrganizationSize] = useState(
    recruiter.organizationSize ?? ""
  );
  const [hiringFrequency, setHiringFrequency] = useState(
    recruiter.hiringFrequency ?? ""
  );

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const currentRecruiter = user.recruiterProfile as RecruiterProfileView;

    setFullName(user.fullName);
    setPhone(user.phone ?? "");
    setCity(user.city ?? "");

    setHeadline(user.seekerProfile.headline ?? "");
    setBio(user.seekerProfile.bio ?? "");
    setSkills((user.seekerProfile.skills ?? []).join(", "));
    setServices((user.seekerProfile.services ?? []).join(", "));
    setAvailability(user.seekerProfile.availability ?? "available");
    setHourlyRate(user.seekerProfile.hourlyRate ?? "");
    setExperience(user.seekerProfile.experience ?? "");

    setCompanyName(currentRecruiter.companyName ?? "");
    setCompanyDescription(currentRecruiter.companyDescription ?? "");
    setCompanyLocation(currentRecruiter.companyLocation ?? "");
    setIndustry(currentRecruiter.industry ?? "");
    setWebsite(currentRecruiter.website ?? "");
    setPosition(currentRecruiter.position ?? "");
    setRecruitmentPurpose(currentRecruiter.recruitmentPurpose ?? "");
    setOrganizationSize(currentRecruiter.organizationSize ?? "");
    setHiringFrequency(currentRecruiter.hiringFrequency ?? "");
  }, [user]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setError("");
    setMessage("");

    const cleanName = fullName.trim();
    if (cleanName.length < 2) {
      setError("Please enter your full name.");
      return;
    }

    const cleanSkills = skills
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const cleanServices = services
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const updatedRecruiter = {
      ...user.recruiterProfile,
      companyName: companyName.trim(),
      companyDescription: companyDescription.trim(),
      companyLocation: companyLocation.trim(),
      industry: industry.trim(),
      website: website.trim(),
      position: position.trim(),
      recruitmentPurpose: recruitmentPurpose.trim(),
      organizationSize: organizationSize.trim(),
      hiringFrequency: hiringFrequency.trim(),
      completed: recruiter.enabled ? true : recruiter.completed,
    } as UserAccount["recruiterProfile"];

    const updated = updateCurrentUser({
      fullName: cleanName,
      phone: phone.trim(),
      city: city.trim(),
      seekerProfile: {
        ...user.seekerProfile,
        headline: headline.trim(),
        bio: bio.trim(),
        skills: cleanSkills,
        services: cleanServices,
        location: city.trim(),
        availability,
        hourlyRate: hourlyRate.trim(),
        experience: experience.trim(),
        phone: phone.trim(),
        completed: true,
      },
      recruiterProfile: updatedRecruiter,
    });

    if (!updated) {
      setError("Unable to save your profile.");
      return;
    }

    onUserUpdated(updated);
    setMessage("Profile updated successfully.");
  };

  const isCompanyRecruiter =
    recruiter.enabled && recruiter.recruiterType === "company";
  const isIndependentRecruiter =
    recruiter.enabled && recruiter.recruiterType === "individual";

  const workerSkillsCount = (worker.skills ?? []).length;
  const workerServicesCount = (worker.services ?? []).length;

  return (
    <section className="profile-page">
      <div className="profile-header">
        <div>
          <span className="profile-kicker">JOBFIND PROFILE</span>
          <h2>Your professional profile</h2>
          <p>
            Keep your information accurate so other JobFind users know who
            they are working with.
          </p>
        </div>

        <div className="profile-avatar">
          {user.fullName.charAt(0).toUpperCase()}
        </div>
      </div>

      <div className="profile-status-grid">
        <div className="profile-status-card">
          <span>Account</span>
          <strong>{getAccountLabel(user)}</strong>
        </div>

        <div className="profile-status-card">
          <span>Worker profile</span>
          <strong>{worker.enabled ? "Enabled" : "Not enabled"}</strong>
        </div>

        <div className="profile-status-card">
          <span>Recruiter profile</span>
          <strong>
            {recruiter.enabled
              ? recruiter.recruiterType === "company"
                ? "Company"
                : "Independent"
              : "Not enabled"}
          </strong>
        </div>
      </div>

      {recruiter.enabled && (
        <div className="recruiter-profile-banner">
          <div>
            <span>RECRUITER PROFILE</span>
            <h3>
              {isCompanyRecruiter
                ? "Company Recruiter"
                : "Independent Recruiter"}
            </h3>
            <p>
              {isCompanyRecruiter
                ? "Complete your company information below to build your recruitment workplace."
                : `Your recruiter category: ${formatRecruiterCategory(
                    recruiter.recruiterCategory
                  )}`}
            </p>
          </div>

          <div className="recruiter-profile-badge">
            {isCompanyRecruiter ? "COMPANY" : "INDEPENDENT"}
          </div>
        </div>
      )}

      <form className="profile-form" onSubmit={handleSubmit} noValidate>
        <div className="profile-card">
          <div className="profile-card-heading">
            <span>01</span>
            <div>
              <h3>Personal information</h3>
              <p>Basic information about your JobFind account.</p>
            </div>
          </div>

          <div className="profile-grid">
            <label>
              Full name
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
            </label>

            <label>
              Email
              <input value={user.email} disabled />
            </label>

            <label>
              Phone
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+237 ..."
              />
            </label>

            <label>
              City
              <input
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder="Douala"
              />
            </label>
          </div>
        </div>

        {worker.enabled && (
          <div className="profile-card">
            <div className="profile-card-heading">
              <span>02</span>
              <div>
                <h3>Worker profile</h3>
                <p>Present your skills and services to homeowners.</p>
              </div>
            </div>

            <div className="profile-count-row">
              <span>{workerSkillsCount} skills</span>
              <span>{workerServicesCount} services</span>
            </div>

            <div className="profile-grid">
              <label>
                Professional headline
                <input
                  value={headline}
                  onChange={(event) => setHeadline(event.target.value)}
                  placeholder="Experienced electrician"
                />
              </label>

              <label>
                Availability
                <select
                  value={availability}
                  onChange={(event) =>
                    setAvailability(event.target.value as WorkerAvailability)
                  }
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </label>

              <label>
                Skills
                <input
                  value={skills}
                  onChange={(event) => setSkills(event.target.value)}
                  placeholder="Electrical, wiring, repairs"
                />
                <small>Separate skills with commas.</small>
              </label>

              <label>
                Services
                <input
                  value={services}
                  onChange={(event) => setServices(event.target.value)}
                  placeholder="Home wiring, installation"
                />
                <small>Separate services with commas.</small>
              </label>

              <label>
                Hourly rate
                <input
                  value={hourlyRate}
                  onChange={(event) => setHourlyRate(event.target.value)}
                  placeholder="5000 FCFA/hour"
                />
              </label>

              <label>
                Experience
                <input
                  value={experience}
                  onChange={(event) => setExperience(event.target.value)}
                  placeholder="3 years"
                />
              </label>

              <label className="profile-full">
                Bio
                <textarea
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  rows={5}
                  placeholder="Tell clients about your experience..."
                />
              </label>
            </div>
          </div>
        )}

        {recruiter.enabled && (
          <div className="profile-card">
            <div className="profile-card-heading">
              <span>{worker.enabled ? "03" : "02"}</span>
              <div>
                <h3>
                  {isCompanyRecruiter
                    ? "Company information"
                    : "Independent recruiter information"}
                </h3>
              </div>
            </div>

            <div className="profile-grid">
              {isCompanyRecruiter && (
                <>
                  <label>
                    Company name
                    <input
                      value={companyName}
                      onChange={(event) => setCompanyName(event.target.value)}
                      placeholder="Your company name"
                    />
                  </label>

                  <label>
                    Industry
                    <input
                      value={industry}
                      onChange={(event) => setIndustry(event.target.value)}
                      placeholder="Construction"
                    />
                  </label>

                  <label>
                    Company location
                    <input
                      value={companyLocation}
                      onChange={(event) =>
                        setCompanyLocation(event.target.value)
                      }
                      placeholder="Douala"
                    />
                  </label>

                  <label>
                    Website
                    <input
                      value={website}
                      onChange={(event) => setWebsite(event.target.value)}
                      placeholder="https://..."
                    />
                  </label>

                  <label>
                    Your position
                    <input
                      value={position}
                      onChange={(event) => setPosition(event.target.value)}
                      placeholder="HR Manager"
                    />
                  </label>

                  <label>
                    Organization size
                    <select
                      value={organizationSize}
                      onChange={(event) =>
                        setOrganizationSize(event.target.value)
                      }
                    >
                      <option value="">Select size</option>
                      <option value="1-5">1–5 employees</option>
                      <option value="6-20">6–20 employees</option>
                      <option value="21-50">21–50 employees</option>
                      <option value="51-200">51–200 employees</option>
                      <option value="200+">200+ employees</option>
                    </select>
                  </label>

                  <label className="profile-full">
                    Company description
                    <textarea
                      value={companyDescription}
                      onChange={(event) =>
                        setCompanyDescription(event.target.value)
                      }
                      rows={5}
                      placeholder="Describe your company..."
                    />
                  </label>
                </>
              )}

              {isIndependentRecruiter && (
                <>
                  <label>
                    Recruitment purpose
                    <input
                      value={recruitmentPurpose}
                      onChange={(event) =>
                        setRecruitmentPurpose(event.target.value)
                      }
                      placeholder="What do you usually hire for?"
                    />
                  </label>

                  <label>
                    Hiring frequency
                    <select
                      value={hiringFrequency}
                      onChange={(event) =>
                        setHiringFrequency(event.target.value)
                      }
                    >
                      <option value="">Select frequency</option>
                      <option value="occasionally">Occasionally</option>
                      <option value="monthly">Monthly</option>
                      <option value="frequently">Frequently</option>
                      <option value="project_based">Project based</option>
                    </select>
                  </label>

                  <label>
                    Activity / business name
                    <input
                      value={companyName}
                      onChange={(event) => setCompanyName(event.target.value)}
                      placeholder="Optional business or activity name"
                    />
                  </label>

                  <label>
                    Industry / activity
                    <input
                      value={industry}
                      onChange={(event) => setIndustry(event.target.value)}
                      placeholder="Construction, cleaning, farming..."
                    />
                  </label>

                  <label>
                    Hiring scale
                    <select
                      value={organizationSize}
                      onChange={(event) =>
                        setOrganizationSize(event.target.value)
                      }
                    >
                      <option value="">Select</option>
                      <option value="individual">Independent</option>
                      <option value="1-5">1–5 workers</option>
                      <option value="6-20">6–20 workers</option>
                    </select>
                  </label>

                  <label>
                    Position / role
                    <input
                      value={position}
                      onChange={(event) => setPosition(event.target.value)}
                      placeholder="Owner, contractor, recruiter..."
                    />
                  </label>
                </>
              )}
            </div>
          </div>
        )}

        {error && <div className="profile-message error">{error}</div>}
        {message && <div className="profile-message success">{message}</div>}

        <button type="submit" className="profile-save">
          Save profile
        </button>
      </form>

      {!worker.enabled && onEnableWorker && (
        <div className="profile-add-card">
          <div>
            <span>WANT TO PROVIDE SERVICES?</span>
            <h3>Enable your Worker Profile</h3>
            <p>Offer your skills and find local gigs.</p>
          </div>
          <button type="button" onClick={onEnableWorker}>
            Become a Worker
          </button>
        </div>
      )}

      {!recruiter.enabled && onEnableRecruiter && (
        <div className="profile-add-card recruiter">
          <div>
            <span>WANT TO HIRE?</span>
            <h3>Become a Recruiter</h3>
            <p>Complete the recruiter questions before entering your workplace.</p>
          </div>
          <button
            type="button"
            onClick={() => onEnableRecruiter("individual")}
          >
            Become a Recruiter
          </button>
        </div>
      )}
    </section>
  );
}

function getAccountLabel(user: UserAccount): string {
  switch (user.role) {
    case "recruiter":
      return "Recruiter";
    case "seeker":
      return "Job Seeker";
    default:
      return "Job Seeker";
  }
}

function formatRecruiterCategory(
  category: RecruiterCategory | undefined
): string {
  switch (category) {
    case "solo_entrepreneur":
      return "Solo Entrepreneur";
    case "private_household":
      return "Private Household Employer";
    case "freelance_recruiter":
      return "Freelance Recruiter";
    case "micro_employer":
      return "Micro Employer";
    case "side_hustle_provider":
      return "Side-Hustle Provider";
    case "contractor":
      return "Contractor";
    case "other":
      return "Other";
    default:
      return "Independent Recruiter";
  }
}