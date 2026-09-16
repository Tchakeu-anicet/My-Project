import {
  useState,
  type FormEvent,
  type JSX,
} from "react";

import {
  authenticateUser,
} from "./authStorage";

import type {
  UserAccount,
} from "./types";

import "./AuthForms.css";

interface LoginFormProps {
  onSuccess: (
    user: UserAccount
  ) => void;

  onSwitchToRegister: () => void;
}

export default function LoginForm({
  onSuccess,
  onSwitchToRegister,
}: LoginFormProps): JSX.Element {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [forgotMode, setForgotMode] =
    useState(false);

  const [resetCode, setResetCode] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [error, setError] =
    useState<string | null>(
      null
    );

  const [statusMessage, setStatusMessage] =
    useState<string | null>(
      null
    );

  const [loading, setLoading] =
    useState(false);

  const handleLogin = async (): Promise<void> => {
    const cleanEmail =
      email
        .trim()
        .toLowerCase();

    if (!cleanEmail) {
      setError("Enter your email.");
      return;
    }

    if (!password) {
      setError("Enter your password.");
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        cleanEmail
      )
    ) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    setError(null);
    setStatusMessage(null);

    try {
      const response = await fetch(
        "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: cleanEmail,
            password,
          }),
        }
      );

      const data = (await response.json()) as {
        ok?: boolean;
        user?: UserAccount;
        message?: string;
      };

      if (!response.ok || !data.ok || !data.user) {
        throw new Error(
          data.message ||
            "Unable to sign in. Please try again."
        );
      }

      onSuccess(data.user);
    } catch (loginError) {
      console.error("Login failed:", loginError);
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (): Promise<void> => {
    const cleanEmail =
      email
        .trim()
        .toLowerCase();

    if (!cleanEmail) {
      setError("Enter your email before requesting a reset code.");
      return;
    }

    setLoading(true);
    setError(null);
    setStatusMessage(null);

    try {
      const response = await fetch(
        "/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: cleanEmail,
          }),
        }
      );

      const data = (await response.json()) as {
        ok?: boolean;
        message?: string;
        resetCode?: string;
      };

      if (!response.ok || !data.ok) {
        throw new Error(
          data.message ||
            "Unable to send the reset code."
        );
      }

      setForgotMode(true);
      setStatusMessage(
        `${data.message} Use the code below to set your new password.`
      );
      if (data.resetCode) {
        setResetCode(data.resetCode);
      }
    } catch (forgotError) {
      setError(
        forgotError instanceof Error
          ? forgotError.message
          : "Unable to send the reset code."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (): Promise<void> => {
    const cleanEmail =
      email
        .trim()
        .toLowerCase();

    if (!cleanEmail) {
      setError("Enter your email.");
      return;
    }

    if (!resetCode.trim()) {
      setError("Enter the reset code from your email.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    setError(null);
    setStatusMessage(null);

    try {
      const response = await fetch(
        "/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: cleanEmail,
            code: resetCode,
            password: newPassword,
          }),
        }
      );

      const data = (await response.json()) as {
        ok?: boolean;
        message?: string;
      };

      if (!response.ok || !data.ok) {
        throw new Error(
          data.message ||
            "Unable to reset the password."
        );
      }

      setStatusMessage(data.message || "Password reset successfully.");
      setForgotMode(false);
      setResetCode("");
      setNewPassword("");
      setPassword("");
    } catch (resetError) {
      setError(
        resetError instanceof Error
          ? resetError.message
          : "Unable to reset the password."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ): void => {
    event.preventDefault();

    if (forgotMode) {
      void handleResetPassword();
      return;
    }

    void handleLogin();
  };

  return (
    <form
      className="af-form"
      onSubmit={
        handleSubmit
      }
      noValidate
    >
      <div className="af-account-concept">
        <div className="af-account-icon">
          ✦
        </div>

        <div>
          <strong>
            Welcome back to Jobfind
          </strong>

          <span>
            Sign in to continue to
            your JobFind account.
          </span>
        </div>
      </div>

      <label className="af-label">
        Email

        <input
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(
              event.target.value
            )
          }
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
      </label>

      <label className="af-label">
        Password

        <div className="af-password-wrap">
          <input
            type={
              showPassword
                ? "text"
                : "password"
            }
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value
              )
            }
            placeholder="Your password"
            autoComplete="current-password"
            required
          />

          <button
            type="button"
            className="af-toggle-visibility"
            onClick={() =>
              setShowPassword(
                (value) =>
                  !value
              )
            }
          >
            {showPassword
              ? "Hide"
              : "Show"}
          </button>
        </div>
      </label>

      {error && (
        <p className="af-error">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="af-submit"
        disabled={loading}
      >
        {loading
          ? "Signing in..."
          : "Sign in"}
      </button>

      <p className="af-switch">
        Don't have an account?{" "}

        <button
          type="button"
          className="af-link-btn"
          onClick={
            onSwitchToRegister
          }
        >
          Create one
        </button>
      </p>
    </form>
  );
}