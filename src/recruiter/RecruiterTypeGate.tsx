import { useEffect, useState, type JSX } from "react";

import type { RecruiterType, UserAccount } from "../types";
import { updateCurrentUser } from "../authStorage";

import "./RecruiterTypeGate.css";

type RecruiterCategory =
  | "solo_entrepreneur"
  | "private_household"
  | "freelance_recruiter"
  | "micro_employer"
  | "side_hustle_provider"
  | "contractor"
  | "other";

interface RecruiterTypeGateProps {
  open: boolean;
  user: UserAccount;
  onClose: () => void;
  onComplete: (user: UserAccount) => void;
}

type Step = "type" | "category";

export default function RecruiterTypeGate({
  open,
  user,
  onClose,
  onComplete,
}: RecruiterTypeGateProps): JSX.Element | null {
  const [step, setStep] = useState<Step>("type");
  const [recruiterType, setRecruiterType] = useState<RecruiterType | "">("");
  const [category, setCategory] = useState<RecruiterCategory | "">("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setStep("type");
      setRecruiterType("");
      setCategory("");
      setError("");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const saveRecruiter = (
    type: RecruiterType,
    selectedCategory?: RecruiterCategory
  ): void => {
    const currentProfile = user.recruiterProfile as UserAccount["recruiterProfile"] & {
      recruiterCategory?: RecruiterCategory;
    };

    const updated = updateCurrentUser({
      role: "recruiter",
      recruiterProfile: {
        ...currentProfile,
        enabled: true,
        recruiterType: type,
        ...(selectedCategory
          ? { recruiterCategory: selectedCategory }
          : {}),
        completed: false,
      } as UserAccount["recruiterProfile"],
    });

    if (!updated) {
      setError("Unable to activate the recruiter profile. Please try again.");
      return;
    }

    onComplete(updated);
    onClose();
  };

  const handleTypeNext = (): void => {
    setError("");

    if (!recruiterType) {
      setError("Please choose whether you represent a company or recruit independently.");
      return;
    }

    if (recruiterType === "company") {
      // Company recruiters go directly to the recruiter workplace/profile.
      saveRecruiter("company");
      return;
    }

    setStep("category");
  };

  const handleCategoryNext = (): void => {
    setError("");

    if (!category) {
      setError("Please select the option that best describes you.");
      return;
    }

    saveRecruiter("individual", category);
  };

  return (
    <div
      className="recruiter-gate-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="recruiter-gate" role="dialog" aria-modal="true">
        <button
          type="button"
          className="recruiter-gate-close"
          onClick={onClose}
          aria-label="Close recruiter onboarding"
        >
          ×
        </button>

        <span className="recruiter-gate-kicker">JOBFIND RECRUITER</span>

        {step === "type" && (
          <>
            <h2>Tell us how you recruit</h2>
            <p>
              Your answer determines the recruiter workplace and the profile
              information you will complete.
            </p>

            <div className="recruiter-options">
              <button
                type="button"
                className={recruiterType === "company" ? "selected" : ""}
                onClick={() => setRecruiterType("company")}
              >
                <strong>I represent a company</strong>
                <span>
                  I recruit workers for an established company or organization.
                </span>
              </button>

              <button
                type="button"
                className={recruiterType === "individual" ? "selected" : ""}
                onClick={() => setRecruiterType("individual")}
              >
                <strong>I recruit independently</strong>
                <span>
                  I am a household employer, entrepreneur, contractor, freelance
                  recruiter, side-hustle provider or other individual employer.
                </span>
              </button>
            </div>

            {error && <p className="recruiter-error">{error}</p>}

            <button
              type="button"
              className="recruiter-primary"
              onClick={handleTypeNext}
            >
              Continue
            </button>
          </>
        )}

        {step === "category" && (
          <>
            <h2>What best describes you?</h2>
            <p>Choose the option closest to your recruitment activity.</p>

            <div className="recruiter-category-grid">
              <CategoryButton
                value="solo_entrepreneur"
                selected={category === "solo_entrepreneur"}
                title="Solo entrepreneur"
                description="You run your own business and hire help."
                onClick={setCategory}
              />
              <CategoryButton
                value="private_household"
                selected={category === "private_household"}
                title="Private household employer"
                description="You hire people for household work."
                onClick={setCategory}
              />
              <CategoryButton
                value="freelance_recruiter"
                selected={category === "freelance_recruiter"}
                title="Freelance recruiter"
                description="You recruit workers independently for clients or projects."
                onClick={setCategory}
              />
              <CategoryButton
                value="micro_employer"
                selected={category === "micro_employer"}
                title="Micro employer"
                description="You operate a small hiring activity."
                onClick={setCategory}
              />
              <CategoryButton
                value="side_hustle_provider"
                selected={category === "side_hustle_provider"}
                title="Side-hustle provider"
                description="You hire help for a side business or activity."
                onClick={setCategory}
              />
              <CategoryButton
                value="contractor"
                selected={category === "contractor"}
                title="Contractor"
                description="You hire workers for contracts or projects."
                onClick={setCategory}
              />
              <CategoryButton
                value="other"
                selected={category === "other"}
                title="Other"
                description="Another independent recruitment situation."
                onClick={setCategory}
              />
            </div>

            {error && <p className="recruiter-error">{error}</p>}

            <div className="recruiter-actions">
              <button
                type="button"
                className="recruiter-secondary"
                onClick={() => {
                  setError("");
                  setStep("type");
                }}
              >
                Back
              </button>

              <button
                type="button"
                className="recruiter-primary"
                onClick={handleCategoryNext}
              >
                Continue to workplace
              </button>
            </div>
          </>
        )}

        <small>Account: {user.fullName}</small>
      </div>
    </div>
  );
}

interface CategoryButtonProps {
  value: RecruiterCategory;
  selected: boolean;
  title: string;
  description: string;
  onClick: (value: RecruiterCategory) => void;
}

function CategoryButton({
  value,
  selected,
  title,
  description,
  onClick,
}: CategoryButtonProps): JSX.Element {
  return (
    <button
      type="button"
      className={selected ? "recruiter-category selected" : "recruiter-category"}
      onClick={() => onClick(value)}
    >
      <strong>{title}</strong>
      <span>{description}</span>
    </button>
  );
}