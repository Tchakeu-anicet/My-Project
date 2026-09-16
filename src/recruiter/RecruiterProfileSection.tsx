import {
  useState,
  type FormEvent,
  type JSX,
} from "react";

import type {
  UserAccount,
} from "../types";

import {
  updateCurrentUser,
} from "../authStorage";

import "./RecruiterProfileSection.css";

interface RecruiterProfileSectionProps {
  user: UserAccount;

  onUserUpdated: (
    user: UserAccount
  ) => void;
}

export default function RecruiterProfileSection({
  user,
  onUserUpdated,
}: RecruiterProfileSectionProps): JSX.Element {
  const profile =
    user.recruiterProfile;

  const [companyName, setCompanyName] =
    useState(
      profile.companyName ?? ""
    );

  const [
    companyDescription,
    setCompanyDescription,
  ] = useState(
    profile.companyDescription ?? ""
  );

  const [
    companyLocation,
    setCompanyLocation,
  ] = useState(
    profile.companyLocation ??
      user.city ??
      ""
  );

  const [industry, setIndustry] =
    useState(
      profile.industry ?? ""
    );

  const [website, setWebsite] =
    useState(
      profile.website ?? ""
    );

  const [phone, setPhone] =
    useState(
      profile.phone ??
        user.phone ??
        ""
    );

  const [position, setPosition] =
    useState(
      profile.position ?? ""
    );

  const [fullName, setFullName] =
    useState(user.fullName);

  const [success, setSuccess] =
    useState("");

  const [error, setError] =
    useState("");

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ): void => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      profile.recruiterType ===
        "company" &&
      !companyName.trim()
    ) {
      setError(
        "Please enter your company or organization name."
      );
      return;
    }

    if (!fullName.trim()) {
      setError(
        "Please enter your full name."
      );
      return;
    }

    const updatedUser =
      updateCurrentUser({
        fullName:
          fullName.trim(),

        city:
          companyLocation.trim(),

        phone:
          phone.trim(),

        recruiterProfile: {
          ...profile,

          companyName:
            companyName.trim(),

          companyDescription:
            companyDescription.trim(),

          companyLocation:
            companyLocation.trim(),

          industry:
            industry.trim(),

          website:
            website.trim(),

          phone:
            phone.trim(),

          position:
            position.trim(),

          completed: true,
        },
      });

    if (!updatedUser) {
      setError(
        "Unable to save your profile."
      );
      return;
    }

    onUserUpdated(updatedUser);

    setSuccess(
      "Your recruiter profile has been saved successfully."
    );
  };

  const recruiterLabel =
    profile.recruiterType ===
    "company"
      ? "Company Recruiter"
      : "Independent Recruiter";

  return (
    <section className="recruiter-profile-page">
      <div className="recruiter-profile-header">
        <div>
          <span>
            RECRUITER PROFILE
          </span>

          <h2>
            Complete your
            recruiter profile.
          </h2>

          <p>
            This information will be
            used when you post jobs and
            communicate with workers.
          </p>
        </div>

        <div className="recruiter-profile-type">
          {recruiterLabel}
        </div>
      </div>

      <div className="recruiter-profile-context">
        <strong>
          Your JobFind context
        </strong>

        <span>
          {getContextLabel(
            profile.recruiterContext
          )}
        </span>
      </div>

      <form
        className="recruiter-profile-form"
        onSubmit={handleSubmit}
      >
        <div className="profile-section-card">
          <h3>
            Personal information
          </h3>

          <div className="profile-grid">
            <label>
              Full name
              <input
                value={fullName}
                onChange={(event) =>
                  setFullName(
                    event.target.value
                  )
                }
                required
              />
            </label>

            <label>
              Phone
              <input
                value={phone}
                onChange={(event) =>
                  setPhone(
                    event.target.value
                  )
                }
                placeholder="+237..."
              />
            </label>
          </div>
        </div>

        <div className="profile-section-card">
          <h3>
            {profile.recruiterType ===
            "company"
              ? "Company information"
              : "Employer information"}
          </h3>

          <div className="profile-grid">
            <label>
              {profile.recruiterType ===
              "company"
                ? "Company / organization name"
                : "Business / activity name"}

              <input
                value={companyName}
                onChange={(event) =>
                  setCompanyName(
                    event.target.value
                  )
                }
                placeholder={
                  profile.recruiterType ===
                  "company"
                    ? "Company name"
                    : "Business or activity name"
                }
              />
            </label>

            <label>
              Industry
              <input
                value={industry}
                onChange={(event) =>
                  setIndustry(
                    event.target.value
                  )
                }
                placeholder="Construction, IT, Cleaning..."
              />
            </label>

            <label>
              Location
              <input
                value={companyLocation}
                onChange={(event) =>
                  setCompanyLocation(
                    event.target.value
                  )
                }
                placeholder="Douala, Cameroon"
              />
            </label>

            <label>
              Your position
              <input
                value={position}
                onChange={(event) =>
                  setPosition(
                    event.target.value
                  )
                }
                placeholder="Owner, HR Manager, Contractor..."
              />
            </label>
          </div>

          <label>
            Description
            <textarea
              value={
                companyDescription
              }
              onChange={(event) =>
                setCompanyDescription(
                  event.target.value
                )
              }
              rows={6}
              placeholder="Tell workers about your business, household, projects, or recruitment activity..."
            />
          </label>

          <label>
            Website
            <input
              type="url"
              value={website}
              onChange={(event) =>
                setWebsite(
                  event.target.value
                )
              }
              placeholder="https://example.com"
            />
          </label>
        </div>

        {error && (
          <div className="recruiter-profile-error">
            {error}
          </div>
        )}

        {success && (
          <div className="recruiter-profile-success">
            {success}
          </div>
        )}

        <button
          type="submit"
          className="recruiter-profile-save"
        >
          Save Recruiter Profile
        </button>
      </form>
    </section>
  );
}

function getContextLabel(
  context:
    | UserAccount["recruiterProfile"]["recruiterContext"]
    | undefined
): string {
  const labels: Record<
    NonNullable<
      UserAccount["recruiterProfile"]["recruiterContext"]
    >,
    string
  > = {
    company_representative:
      "Company Representative",

    solo_entrepreneur:
      "Solo Entrepreneur",

    micro_employer:
      "Micro Employer",

    private_household_employer:
      "Private Household Employer",

    contractor:
      "Contractor",

    freelance_recruiter:
      "Freelance Recruiter",

    individual_employer:
      "Individual Employer",

    other:
      "Other",
  };

  return context
    ? labels[context]
    : "Not specified";
}