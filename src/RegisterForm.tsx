import {
  useEffect,
  useState,
  type FormEvent,
  type JSX,
} from "react";

import {
  createAccount,
  emailExists,
} from "./authStorage";

import type {
  UserAccount,
} from "./types";

import "./AuthForms.css";

interface RegisterFormProps {
  onSuccess: (user: UserAccount) => void;
  onSwitchToLogin: () => void;
}

/* ============================================================
   PASSWORD STRENGTH (unchanged)
   ============================================================ */

function getPasswordStrength(password: string): { score: number; label: string } {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  const labels = ["Very weak", "Weak", "Fair", "Good", "Strong", "Very strong"];
  return { score, label: labels[Math.min(score, labels.length - 1)] };
}

/* ============================================================
   REGISTER FORM
   ============================================================ */

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps): JSX.Element {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState<"" | "Male" | "Female">("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* --- Email verification state --- */
  const [verificationPending, setVerificationPending] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");

  /* 🔑 NEW: held in memory until the code is verified —
     only THEN is the account created. */
  const [pendingAccount, setPendingAccount] = useState<UserAccount | null>(null);

  /* 🔑 NEW: resend cooldown timer */
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setInterval(
      () => setResendIn((s) => (s > 0 ? s - 1 : 0)),
      1000,
    );
    return () => window.clearInterval(id);
  }, [resendIn]);

  const strength = getPasswordStrength(password);

  /* ==========================================================
     VERIFY CODE → ONLY HERE IS THE ACCOUNT CREATED
     ========================================================== */

  const handleVerifyEmail = async (): Promise<void> => {
    const target = pendingAccount?.email ?? registeredEmail;

    if (!target) {
      setError("Register a new account first.");
      return;
    }

    if (!verificationCode.trim()) {
      setError("Enter the 6-digit verification code sent to your email.");
      return;
    }

    setLoading(true);
    setError(null);
    setStatusMessage(null);

    try {
      const response = await fetch("/api/auth/verify-email-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: target, code: verificationCode.trim() }),
      });

      const data = (await response.json()) as { ok?: boolean; message?: string };

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Unable to verify your email.");
      }

      /* ✅ Server has now created the account — mirror it locally. */
      if (pendingAccount) {
        createAccount({ ...pendingAccount, emailVerified: true });
      }

      setVerificationPending(false);
      setPendingAccount(null);
      setVerificationCode("");
      setStatusMessage(
        data.message || "Email verified successfully. You can now sign in.",
      );
    } catch (verificationError) {
      setError(
        verificationError instanceof Error
          ? verificationError.message
          : "Unable to verify your email.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     RESEND CODE (with cooldown)
     ========================================================== */

  const handleResendCode = async (): Promise<void> => {
    const target = pendingAccount?.email ?? registeredEmail;

    if (!target) {
      setError("Register a valid email first.");
      return;
    }

    setLoading(true);
    setError(null);
    setStatusMessage(null);

    try {
      const response = await fetch("/api/auth/request-verification-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: target }),
      });

      const data = (await response.json()) as { ok?: boolean; message?: string };

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Unable to resend the verification code.");
      }

      setVerificationCode("");
      setResendIn(60);
      setStatusMessage(data.message || "A new code has been sent to your email.");
    } catch (resendError) {
      setError(
        resendError instanceof Error
          ? resendError.message
          : "Unable to resend the verification code.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     LINK-BASED VERIFICATION (?verify=token deep link)
     ========================================================== */

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("verify");
    if (!token) return;

    const verifyToken = async () => {
      try {
        const response = await fetch(
          `/api/auth/verify-email?token=${encodeURIComponent(token)}`,
        );
        const data = (await response.json()) as { ok?: boolean; message?: string };

        if (response.ok && data.ok) {
          setStatusMessage("Email verified successfully. You can now sign in.");
          setError(null);
        } else {
          setError(data.message || "This verification link is invalid or has expired.");
        }
      } catch {
        setError("This verification link is invalid or has expired.");
      } finally {
        window.history.replaceState(
          {},
          "",
          window.location.origin + window.location.pathname,
        );
      }
    };

    void verifyToken();
  }, []);

  /* ==========================================================
     SUBMIT REGISTRATION → account is NOT created yet
     ========================================================== */

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);
    setStatusMessage(null);

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2) { setError("Enter your full name."); return; }
    if (!gender) { setError("Select your gender."); return; }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    const passwordClasses = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/]
      .filter((regex) => regex.test(password)).length;

    if (password.length < 8 || passwordClasses < 3) {
      setError("Password must be at least 8 characters and contain at least 3 character types.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreed) {
      setError("You must accept the Terms of Use and Privacy Policy.");
      return;
    }

    if (emailExists(cleanEmail)) {
      setError("An account already exists with this email.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: cleanName,
          email: cleanEmail,
          password,
          gender,
        }),
      });

      const data = (await response.json()) as { ok?: boolean; message?: string };

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Unable to create the account. Please try again.");
      }

      /* 🔑 Stash the data — createAccount() happens ONLY after
         the code from the email is verified. */
      setPendingAccount({
        fullName: cleanName,
        email: cleanEmail,
        password,
        gender,
        emailVerified: false,
      });

      setRegisteredEmail(cleanEmail);
      setVerificationPending(true);
      setVerificationCode("");
      setResendIn(60);
      setStatusMessage(
        `We sent a 6-digit code to ${cleanEmail}. Enter it below to activate your account.`,
      );

      /* Clear the form fields */
      setFullName("");
      setEmail("");
      setGender("");
      setPassword("");
      setConfirmPassword("");
      setAgreed(false);
    } catch (registrationError) {
      console.error("Registration failed:", registrationError);
      setError(
        registrationError instanceof Error
          ? registrationError.message
          : "Unable to create the account. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     RENDER — verification panel REPLACES the form
     ========================================================== */

  return (
    <form
      className="af-form"
      onSubmit={(event) => void handleSubmit(event)}
      noValidate
    >
      {/* ---------- VERIFICATION PANEL (shown after register) ---------- */}

      {verificationPending ? (
        <>
          <div className="af-account-concept">
            <div className="af-account-icon">✉</div>
            <div>
              <strong>Verify your email</strong>
              <span>
                We sent a 6-digit code to{" "}
                <strong>{registeredEmail}</strong>. Your account is created
                only after you confirm the code.
              </span>
            </div>
          </div>

          <label className="af-label">
            Verification code

            <input
              type="text"
              value={verificationCode}
              onChange={(event) =>
                setVerificationCode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="Enter the 6-digit code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              autoFocus
            />
          </label>

          {statusMessage && <p className="af-success">{statusMessage}</p>}
          {error && <p className="af-error">{error}</p>}

          <button
            type="button"
            className="af-submit"
            disabled={loading || verificationCode.length !== 6}
            onClick={() => void handleVerifyEmail()}
          >
            {loading ? "Verifying account..." : "Verify account"}
          </button>

          <button
            type="button"
            className="af-link-btn"
            disabled={loading || resendIn > 0}
            onClick={() => void handleResendCode()}
          >
            {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
          </button>
        </>
      ) : (
        <>
          {/* ---------- REGISTRATION FIELDS (unchanged) ---------- */}

          <div className="af-account-concept">
            <div className="af-account-icon">✦</div>
            <div>
              <strong>Your JobFind account</strong>
              <span>
                Create your JobFind account. You will need to verify your
                email before the account is activated.
              </span>
            </div>
          </div>

          <label className="af-label">
            Full name
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Your full name"
              autoComplete="name"
              required
            />
          </label>

          <div className="af-two-column">
            <label className="af-label">
              Gender
              <select
                value={gender}
                onChange={(event) =>
                  setGender(event.target.value as "" | "Male" | "Female")
                }
                required
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </label>

            <label className="af-label">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>
          </div>

          <label className="af-label">
            Password
            <div className="af-password-wrap">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Create a strong password"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="af-toggle-visibility"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {password && (
              <div className="af-strength">
                <div className="af-strength-bar">
                  <div
                    className={`af-strength-fill af-strength-${strength.score}`}
                    style={{ width: `${strength.score * 20}%` }}
                  />
                </div>
                <span>{strength.label}</span>
              </div>
            )}
          </label>

          <label className="af-label">
            Confirm password
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repeat your password"
              autoComplete="new-password"
              required
            />
          </label>

          <label className="af-checkbox-inline af-terms">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
            />
            <span>I agree to the Terms of Use and Privacy Policy.</span>
          </label>

          {statusMessage && <p className="af-success">{statusMessage}</p>}
          {error && <p className="af-error">{error}</p>}

          <button type="submit" className="af-submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </>
      )}

      {/* ---------- SWITCH TO LOGIN (always visible) ---------- */}

      <p className="af-switch">
        Already have an account?{" "}
        <button type="button" className="af-link-btn" onClick={onSwitchToLogin}>
          Sign in
        </button>
      </p>
    </form>
  );
}