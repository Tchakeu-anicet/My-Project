import { useState, type JSX } from "react";
import type { UserAccount, UserSubscription } from "../types";
import { updateUserSubscriptionInfo } from "../authStorage";
import "./PremiumSubscriptionModal.css";

interface PremiumSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount;
  onSuccess: (updatedUser: UserAccount) => void;
}

export type PremiumPlanId = "basic" | "pro" | "enterprise";

interface PlanDetail {
  id: PremiumPlanId;
  name: "Basic Premium" | "Professional Premium" | "Enterprise Visibility";
  priceXAF: number;
  badge: string;
  features: string[];
}

const PLAN_DETAILS: PlanDetail[] = [
  {
    id: "basic",
    name: "Basic Premium",
    priceXAF: 5000,
    badge: "Popular",
    features: [
      "2x Higher profile placement in search results",
      "Featured candidate/recruiter badge",
      "Direct priority messaging",
      "Standard customer support",
    ],
  },
  {
    id: "pro",
    name: "Professional Premium",
    priceXAF: 15000,
    badge: "Recommended",
    features: [
      "5x Increased visibility for candidate / recruiter profiles",
      "Unlimited job application status tracking alerts",
      "Verified Pro Badge",
      "AI Resume & Candidate Matching priority",
      "24/7 Priority Support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise Visibility",
    priceXAF: 35000,
    badge: "Maximum Boost",
    features: [
      "10x Maximum platform visibility across all search filters",
      "Top homepage placement",
      "Unlimited direct contacts & job postings",
      "Dedicated account manager",
    ],
  },
];

export default function PremiumSubscriptionModal({
  isOpen,
  onClose,
  user,
  onSuccess,
}: PremiumSubscriptionModalProps): JSX.Element | null {
  const [step, setStep] = useState<"SELECT_PLAN" | "PAYMENT_FORM" | "PROCESSING" | "SUCCESS">(
    "SELECT_PLAN"
  );
  const [selectedPlan, setSelectedPlan] = useState<PlanDetail>(PLAN_DETAILS[1]);
  const [phone, setPhone] = useState(user.phone || "670000000");
  const [paymentOperator, setPaymentOperator] = useState<"MTN" | "ORANGE">("MTN");
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleSelectPlan = (plan: PlanDetail) => {
    setSelectedPlan(plan);
    setStep("PAYMENT_FORM");
    setErrorMessage("");
  };

  const validatePhone = (num: string): boolean => {
    const cleaned = num.replace(/\s+/g, "");
    return /^(6[5-9]\d{7}|2\d{8})$/.test(cleaned);
  };

  const handleConfirmPayment = async () => {
    setErrorMessage("");
    if (!validatePhone(phone)) {
      setErrorMessage("Please enter a valid 9-digit Cameroonian mobile money phone number (e.g., 670123456).");
      return;
    }

    setStep("PROCESSING");

    try {
      const response = await fetch("/api/campay/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          amount: selectedPlan.priceXAF,
          phone,
          operator: paymentOperator,
          planName: selectedPlan.name,
        }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        message?: string;
        reference?: string;
      };

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Campay payment request failed.");
      }

      const newSub: UserSubscription = {
        status: "ACTIVE",
        planName: selectedPlan.name,
        amount: selectedPlan.priceXAF,
        currency: "XAF",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        campayPhone: phone,
        reference: data.reference || `CAMPAY-TX-${Date.now()}`,
        increasedVisibility: true,
      };

      const updatedUser = updateUserSubscriptionInfo(user.id, newSub);
      if (updatedUser) {
        setStep("SUCCESS");
        onSuccess(updatedUser);
      } else {
        setErrorMessage("Payment verification failed. Please try again.");
        setStep("PAYMENT_FORM");
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Payment processing failed. Please try again.");
      setStep("PAYMENT_FORM");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content premium-sub-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="premium-header-title">
            <span className="premium-icon">⭐</span>
            <div>
              <h2>Subscribe to Premium Visibility</h2>
              <p>Boost your profile & access exclusive features (Campay Mobile Money)</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {step === "SELECT_PLAN" && (
            <div className="plans-container">
              <p className="plans-intro">
                Select a plan below to activate <strong>Increased Visibility</strong> across JobFind search results and candidate recommendations.
              </p>
              <div className="plans-grid">
                {PLAN_DETAILS.map((plan) => (
                  <div
                    key={plan.id}
                    className={`plan-card ${selectedPlan.id === plan.id ? "active" : ""}`}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    {plan.badge && <span className="plan-badge">{plan.badge}</span>}
                    <h3>{plan.name}</h3>
                    <div className="plan-price">
                      <span className="amount">{plan.priceXAF.toLocaleString()} FCFA</span>
                      <span className="period">/ month</span>
                    </div>
                    <ul className="plan-features">
                      {plan.features.map((feat, idx) => (
                        <li key={idx}>✓ {feat}</li>
                      ))}
                    </ul>
                    <button className="select-plan-btn" onClick={() => handleSelectPlan(plan)}>
                      Choose Plan
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === "PAYMENT_FORM" && (
            <div className="payment-form-container">
              <button className="back-btn" onClick={() => setStep("SELECT_PLAN")}>
                ← Back to Plans
              </button>

              <div className="payment-summary">
                <h3>Order Summary</h3>
                <div className="summary-row">
                  <span>Selected Plan:</span>
                  <strong>{selectedPlan.name}</strong>
                </div>
                <div className="summary-row">
                  <span>Amount to Pay:</span>
                  <strong className="summary-price">{selectedPlan.priceXAF.toLocaleString()} FCFA</strong>
                </div>
              </div>

              <div className="campay-section">
                <h4>Mobile Money Checkout</h4>
                <p>Enter your mobile money number to receive a payment prompt.</p>

                {errorMessage && <div className="payment-error">{errorMessage}</div>}

                <div className="form-group">
                  <label>Select Network Operator:</label>
                  <div className="operator-selector">
                    <button
                      type="button"
                      className={`op-btn mtn ${paymentOperator === "MTN" ? "selected" : ""}`}
                      onClick={() => setPaymentOperator("MTN")}
                    >
                      MTN Mobile Money
                    </button>
                    <button
                      type="button"
                      className={`op-btn orange ${paymentOperator === "ORANGE" ? "selected" : ""}`}
                      onClick={() => setPaymentOperator("ORANGE")}
                    >
                      Orange Money
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Mobile Money Phone Number:</label>
                  <input
                    type="tel"
                    placeholder="e.g. 670123456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <button className="confirm-pay-btn" onClick={handleConfirmPayment}>
                  Pay {selectedPlan.priceXAF.toLocaleString()} FCFA with {setPaymentOperator.name}
                </button>
              </div>
            </div>
          )}

          {step === "PROCESSING" && (
            <div className="processing-container">
              <div className="spinner"></div>
              <h3>Communicating with Campay Payment Gateway...</h3>
              <p>Please check your phone ({phone}) to confirm the USSD Mobile Money PIN authorization prompt.</p>
            </div>
          )}

          {step === "SUCCESS" && (
            <div className="success-container">
              <div className="success-icon">🎉</div>
              <h3>Premium Subscription Activated!</h3>
              <p>
                Your account now has <strong>{selectedPlan.name}</strong> status with <strong>Increased Visibility</strong> active across the JobFind platform.
              </p>
              <button className="done-btn" onClick={onClose}>
                Return to Workspace
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
