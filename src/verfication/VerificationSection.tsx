import {
  useEffect,
  useState,
  type JSX,
} from "react";

import "./VerificationSection.css";

type VerificationStatus =
  | "unverified"
  | "pending"
  | "verified"
  | "rejected";

interface VerificationSectionProps {
  phoneVerified?: boolean;

  identityVerified?: boolean;

  backgroundCheckStatus?:
    | "not_started"
    | "pending"
    | "passed"
    | "failed";

  onSubmit?: () => void;
}

export default function VerificationSection({
  phoneVerified = false,
  identityVerified = false,
  backgroundCheckStatus =
    "not_started",
  onSubmit,
}: VerificationSectionProps): JSX.Element {
  const [status, setStatus] =
    useState<VerificationStatus>(
      "unverified"
    );

  const [loading, setLoading] =
    useState(false);

  const phone =
    phoneVerified ||
    localStorage.getItem(
      "jf_phone_verified"
    ) === "true";

  const identity =
    identityVerified ||
    localStorage.getItem(
      "jf_identity_verified"
    ) === "true";

  const background =
    backgroundCheckStatus ===
      "passed" ||
    localStorage.getItem(
      "jf_background_check"
    ) === "passed";

  useEffect(() => {
    if (
      phone &&
      identity &&
      background
    ) {
      setStatus("verified");
    }
  }, [
    phone,
    identity,
    background,
  ]);

  const verify = (): void => {
    setLoading(true);
    setStatus("pending");

    window.setTimeout(() => {
      localStorage.setItem(
        "jf_phone_verified",
        "true"
      );

      localStorage.setItem(
        "jf_identity_verified",
        "true"
      );

      localStorage.setItem(
        "jf_background_check",
        "passed"
      );

      setLoading(false);
      setStatus("verified");

      onSubmit?.();
    }, 500);
  };

  const completed = [
    phone,
    identity,
    background,
  ].filter(Boolean).length;

  const percentage =
    Math.round(
      (completed / 3) * 100
    );

  return (
    <section className="verification-page">
      <div className="verification-hero">
        <div>
          <span>
            TRUST & SAFETY
          </span>

          <h2>
            Build a profile people
            can trust.
          </h2>

          <p>
            Verification helps
            homeowners feel safer when
            inviting workers into their
            homes.
          </p>
        </div>

        <div className="verification-score">
          <strong>
            {percentage}%
          </strong>

          <span>verified</span>
        </div>
      </div>

      <div className="verification-list">
        <article>
          <div className="verification-icon">
            {phone ? "✓" : "1"}
          </div>

          <div>
            <h3>
              Phone verification
            </h3>

            <p>
              Confirm that your phone
              number belongs to you.
            </p>
          </div>

          <strong>
            {phone
              ? "Verified"
              : "Required"}
          </strong>
        </article>

        <article>
          <div className="verification-icon">
            {identity ? "✓" : "2"}
          </div>

          <div>
            <h3>
              Identity verification
            </h3>

            <p>
              Verify your identity before
              taking private-home jobs.
            </p>
          </div>

          <strong>
            {identity
              ? "Verified"
              : "Required"}
          </strong>
        </article>

        <article>
          <div className="verification-icon">
            {background ? "✓" : "3"}
          </div>

          <div>
            <h3>
              Background check
            </h3>

            <p>
              Complete the required
              background-check process.
            </p>
          </div>

          <strong>
            {background
              ? "Passed"
              : "Required"}
          </strong>
        </article>
      </div>

      {status !== "verified" && (
        <button
          type="button"
          className="verification-button"
          onClick={verify}
          disabled={loading}
        >
          {loading
            ? "Processing..."
            : "Start verification"}
        </button>
      )}

      {status === "verified" && (
        <div className="verification-complete">
          ✓ Your worker verification
          profile is complete.
        </div>
      )}
    </section>
  );
}