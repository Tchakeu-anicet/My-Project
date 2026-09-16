import {
  useEffect,
  useState,
  type JSX,
} from "react";

import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

import type {
  UserAccount,
} from "./types";

import "./RoleGate.css";

interface RoleGateProps {
  open: boolean;

  onClose: () => void;

  onAuthSuccess: (
    user: UserAccount
  ) => void;

  initialStep?:
    | "login"
    | "register";
}

export default function RoleGate({
  open,
  onClose,
  onAuthSuccess,
  initialStep = "login",
}: RoleGateProps): JSX.Element | null {
  const [step, setStep] =
    useState<
      "login" | "register"
    >(initialStep);

  useEffect(() => {
    if (open) {
      setStep(initialStep);
    }
  }, [open, initialStep]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent
    ): void => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="jf-gate-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="jf-gate-title"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="jf-gate-modal">
        <button
          type="button"
          className="jf-gate-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className="jf-gate-brand">
          <span className="jf-gate-logo">
            J
          </span>

          <span>
            <strong>job</strong>
            <b>find</b>
          </span>
        </div>

        <div className="jf-gate-header">
          <span className="jf-gate-kicker">
            WELCOME TO Jobfind
          </span>

          <h2 id="jf-gate-title">
            {step === "login"
              ? "Welcome back"
              : "Create your account"}
          </h2>

          <p>
            {step === "login"
              ? "Sign in to continue to your JobFind workspace."
              : "Create one account and decide how you want to use JobFind."}
          </p>
        </div>

        {step === "login" ? (
          <LoginForm
            onSuccess={onAuthSuccess}
            onSwitchToRegister={() =>
              setStep("register")
            }
          />
        ) : (
          <RegisterForm
            onSuccess={onAuthSuccess}
            onSwitchToLogin={() =>
              setStep("login")
            }
          />
        )}

        <div className="jf-gate-footer">
          <span>
            Your account can have a
            Worker Profile, Recruiter
            Profile, or both.
          </span>
        </div>
      </div>
    </div>
  );
}