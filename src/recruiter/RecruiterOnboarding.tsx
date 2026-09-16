import {
  useState,
  type FormEvent,
  type JSX,
} from "react";

import {
  completeRecruiterOnboarding,
} from "../authStorage";

import type {
  RecruiterContext,
  RecruiterType,
  RecruitmentFrequency,
  UserAccount,
} from "../types";

import "./RecruiterOnboarding.css";

interface RecruiterOnboardingProps {
  user: UserAccount;
  onComplete: (user: UserAccount) => void;
  onCancel: () => void;
}

const JOB_TYPES = [
  "Domestic / Household",
  "Construction",
  "Electrical",
  "Plumbing",
  "Cleaning",
  "Driving",
  "Technology",
  "Marketing",
  "Finance",
  "Healthcare",
  "Administration",
  "Freelance",
  "Temporary Work",
  "Full-time Employment",
  "Part-time Employment",
];

const RECRUITMENT_FREQUENCIES: Array<{
  value: RecruitmentFrequency;
  label: string;
}> = [
  {
    value: "occasional",
    label: "Occasionally",
  },
  {
    value: "few_times_year",
    label: "A few times per year",
  },
  {
    value: "monthly",
    label: "Monthly",
  },
  {
    value: "frequent",
    label: "Frequently",
  },
  {
    value: "continuous",
    label: "Continuously",
  },
];

export default function RecruiterOnboarding({
  user,
  onComplete,
  onCancel,
}: RecruiterOnboardingProps): JSX.Element {
  const [step, setStep] = useState(1);

  const [recruiterType, setRecruiterType] =
    useState<RecruiterType | "">("");

  const [context, setContext] =
    useState<RecruiterContext | "">("");

  const [otherDescription, setOtherDescription] =
    useState("");

  const [frequency, setFrequency] =
    useState<RecruitmentFrequency | "">("");

  const [selectedJobs, setSelectedJobs] =
    useState<string[]>([]);

  const [error, setError] = useState("");

  const toggleJob = (job: string): void => {
    setSelectedJobs((current) =>
      current.includes(job)
        ? current.filter((item) => item !== job)
        : [...current, job]
    );
  };

  const nextStep = (): void => {
    setError("");

    if (step === 1 && !recruiterType) {
      setError(
        "Please choose whether you represent a company or operate independently."
      );
      return;
    }

    if (step === 2 && !context) {
      setError(
        "Please choose the option that best describes your activity."
      );
      return;
    }

    if (
      step === 2 &&
      context === "other" &&
      !otherDescription.trim()
    ) {
      setError(
        "Please describe your activity."
      );
      return;
    }

    if (step === 3 && !frequency) {
      setError(
        "Please select how often you recruit."
      );
      return;
    }

    if (step < 4) {
      setStep((current) => current + 1);
    }
  };

  const previousStep = (): void => {
    setError("");

    if (step > 1) {
      setStep((current) => current - 1);
    }
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ): void => {
    event.preventDefault();

    setError("");

    if (!recruiterType) {
      setError(
        "Please choose whether you represent a company or operate independently."
      );
      setStep(1);
      return;
    }

    if (!context) {
      setError(
        "Please choose the option that best describes your activity."
      );
      setStep(2);
      return;
    }

    if (
      context === "other" &&
      !otherDescription.trim()
    ) {
      setError(
        "Please describe your activity."
      );
      setStep(2);
      return;
    }

    if (!frequency) {
      setError(
        "Please select how often you recruit."
      );
      setStep(3);
      return;
    }

    const updated =
      completeRecruiterOnboarding({
        recruiterType,
        recruiterLevel: "solo",
        recruiterContext: context,
        otherContextDescription:
          otherDescription.trim() || undefined,
        recruitmentPurpose: "professional_recruitment",
        recruitmentFrequency: frequency,
        workerCategories: selectedJobs.map((job, index) => ({
          id: `job-${index}-${job
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")}`,
          name: job,
          source: "predefined",
        })),
        customWorkerCategories: [],
      });

    if (!updated) {
      setError(
        "Unable to save your recruiter profile."
      );
      return;
    }

    onComplete(updated);
  };

  return (
    <div className="recruiter-onboarding">
      <div className="recruiter-onboarding-card">

        {/* Brand */}
        <div className="recruiter-onboarding-brand">
          <span>J</span>

          <strong>
            <b>job</b>
            find
          </strong>
        </div>

        {/* Progress */}
        <div className="recruiter-progress">
          <div
            className="recruiter-progress-fill"
            style={{
              width: `${step * 25}%`,
            }}
          />
        </div>

        <div className="recruiter-step">
          Step {step} of 4
        </div>

        {/* Heading */}
        <div className="recruiter-heading">
          <span>
            RECRUITER ONBOARDING
          </span>

          <h1>
            Let's understand how
            you will use JobFind.
          </h1>

          <p>
            This helps us prepare the
            right employer workspace
            for you.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="recruiter-form"
          noValidate
        >

          {/* STEP 1 */}
          {step === 1 && (
            <div className="recruiter-question">
              <h2>
                Do you represent a
                company or organization?
              </h2>

              <p>
                You can be an individual
                employer even if you own
                or operate a small business.
              </p>

              <div className="recruiter-options">

                <button
                  type="button"
                  className={
                    recruiterType === "company"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setRecruiterType("company")
                  }
                >
                  <strong>
                    Yes, I represent a
                    company
                  </strong>

                  <span>
                    I recruit on behalf of
                    a company or organization.
                  </span>
                </button>

                <button
                  type="button"
                  className={
                    recruiterType === "individual"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setRecruiterType("individual")
                  }
                >
                  <strong>
                    No, I operate
                    independently
                  </strong>

                  <span>
                    I am a private employer,
                    entrepreneur, contractor,
                    freelancer, or similar.
                  </span>
                </button>

              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="recruiter-question">
              <h2>
                What best describes
                your activity?
              </h2>

              <div className="recruiter-context-grid">

                <ContextButton
                  value="solo_entrepreneur"
                  label="Solo Entrepreneur"
                  selected={
                    context ===
                    "solo_entrepreneur"
                  }
                  onClick={setContext}
                />

                <ContextButton
                  value="micro_employer"
                  label="Micro Employer"
                  selected={
                    context ===
                    "micro_employer"
                  }
                  onClick={setContext}
                />

                <ContextButton
                  value="private_household_employer"
                  label="Private Household Employer"
                  selected={
                    context ===
                    "private_household_employer"
                  }
                  onClick={setContext}
                />

                <ContextButton
                  value="contractor"
                  label="Contractor"
                  selected={
                    context ===
                    "contractor"
                  }
                  onClick={setContext}
                />

                <ContextButton
                  value="freelance_recruiter"
                  label="Freelance Recruiter"
                  selected={
                    context ===
                    "freelance_recruiter"
                  }
                  onClick={setContext}
                />

                <ContextButton
                  value="individual_employer"
                  label="Individual Employer"
                  selected={
                    context ===
                    "individual_employer"
                  }
                  onClick={setContext}
                />

                <ContextButton
                  value="company_representative"
                  label="Company Representative"
                  selected={
                    context ===
                    "company_representative"
                  }
                  onClick={setContext}
                />

                <ContextButton
                  value="other"
                  label="Something Else"
                  selected={
                    context === "other"
                  }
                  onClick={setContext}
                />

              </div>

              {context === "other" && (
                <textarea
                  value={otherDescription}
                  onChange={(event) =>
                    setOtherDescription(
                      event.target.value
                    )
                  }
                  placeholder="Tell us what you want to do on JobFind..."
                  rows={4}
                />
              )}
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="recruiter-question">
              <h2>
                How often do you expect
                to recruit?
              </h2>

              <div className="recruiter-options">

                {RECRUITMENT_FREQUENCIES.map(
                  (item) => (
                    <button
                      type="button"
                      key={item.value}
                      className={
                        frequency === item.value
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        setFrequency(
                          item.value
                        )
                      }
                    >
                      {item.label}
                    </button>
                  )
                )}

              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="recruiter-question">
              <h2>
                What type of workers
                will you recruit?
              </h2>

              <p>
                Select all that apply.
              </p>

              <div className="job-type-grid">

                {JOB_TYPES.map((job) => (
                  <label
                    key={job}
                    className={
                      selectedJobs.includes(job)
                        ? "checked"
                        : ""
                    }
                  >
                    <input
                      type="checkbox"
                      checked={selectedJobs.includes(
                        job
                      )}
                      onChange={() =>
                        toggleJob(job)
                      }
                    />

                    <span>
                      {job}
                    </span>
                  </label>
                ))}

              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              className="recruiter-error"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="recruiter-actions">

            <button
              type="button"
              className="secondary"
              onClick={
                step === 1
                  ? onCancel
                  : previousStep
              }
            >
              {step === 1
                ? "Cancel"
                : "Back"}
            </button>

            {step < 4 ? (
              <button
                type="button"
                className="primary"
                onClick={nextStep}
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                className="primary"
              >
                Enter My Workspace
              </button>
            )}

          </div>
        </form>

        {/* Current user */}
        <div className="recruiter-user">
          Signed in as{" "}
          <strong>
            {user.fullName}
          </strong>
        </div>

      </div>
    </div>
  );
}

interface ContextButtonProps {
  value: RecruiterContext;
  label: string;
  selected: boolean;
  onClick: (
    value: RecruiterContext
  ) => void;
}

function ContextButton({
  value,
  label,
  selected,
  onClick,
}: ContextButtonProps): JSX.Element {
  return (
    <button
      type="button"
      className={
        selected ? "selected" : ""
      }
      onClick={() => onClick(value)}
    >
      {label}
    </button>
  );
}