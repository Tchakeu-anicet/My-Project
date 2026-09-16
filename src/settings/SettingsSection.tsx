import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { UserAccount } from "../types";
import { updateCurrentUser } from "../authStorage";

import "./SettingsSection.css";

interface SettingsSectionProps {
  user: UserAccount;
  onUserUpdated?: (user: UserAccount) => void;
}

type SettingsTab =
  | "interface"
  | "account"
  | "jobs"
  | "notifications"
  | "privacy"
  | "data";

type ThemeMode = "light" | "dark" | "system";

type Language = "English" | "French";

type AlertFrequency =
  | "instant"
  | "daily"
  | "weekly"
  | "custom";

interface SettingsState {
  theme: ThemeMode;
  language: Language;

  email: string;
  phone: string;
  twoFactor: boolean;

  targetJobTitles: string[];
  remote: boolean;
  hybrid: boolean;
  preferredLocations: string[];

  alertFrequency: AlertFrequency;
  customAlertTime: string;

  muteNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;

  profileVisible: boolean;
  employerBlocklist: string[];

  subscriptionActive: boolean;
}

const DEFAULT_SETTINGS: SettingsState = {
  theme: "light",
  language: "English",

  email: "",
  phone: "",
  twoFactor: false,

  targetJobTitles: [],
  remote: true,
  hybrid: true,
  preferredLocations: [],

  alertFrequency: "instant",
  customAlertTime: "09:00",

  muteNotifications: false,
  emailNotifications: true,
  smsNotifications: true,
  pushNotifications: true,

  profileVisible: true,
  employerBlocklist: [],

  subscriptionActive: false,
};

const SETTINGS_KEY_PREFIX = "jf_settings_";

const tabs: Array<{
  id: SettingsTab;
  label: string;
  icon: string;
}> = [
  {
    id: "interface",
    label: "Interface & Localization",
    icon: "📍",
  },
  {
    id: "account",
    label: "Account & Security",
    icon: "🛡",
  },
  {
    id: "jobs",
    label: "Job Preferences",
    icon: "⌕",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: "🔔",
  },
  {
    id: "privacy",
    label: "Privacy & Visibility",
    icon: "👁",
  },
  {
    id: "data",
    label: "Data & Account",
    icon:"",
  },
];

function getStorageKey(userId: string): string {
  return `${SETTINGS_KEY_PREFIX}${userId}`;
}

function getUserPhone(user: UserAccount): string {
  const candidate = user as UserAccount & {
    phone?: string;
  };

  return candidate.phone ?? "";
}

function loadSettings(user: UserAccount): SettingsState {
  const defaultSettings: SettingsState = {
    ...DEFAULT_SETTINGS,
    email: user.email ?? "",
    phone: getUserPhone(user),
  };

  try {
    const raw = localStorage.getItem(
      getStorageKey(user.id),
    );

    if (!raw) {
      return defaultSettings;
    }

    const parsed: Partial<SettingsState> =
      JSON.parse(raw) as Partial<SettingsState>;

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      email:
        typeof parsed.email === "string"
          ? parsed.email
          : user.email ?? "",
      phone:
        typeof parsed.phone === "string"
          ? parsed.phone
          : getUserPhone(user),
      targetJobTitles: Array.isArray(
        parsed.targetJobTitles,
      )
        ? parsed.targetJobTitles.filter(
            (item): item is string =>
              typeof item === "string",
          )
        : [],
      preferredLocations: Array.isArray(
        parsed.preferredLocations,
      )
        ? parsed.preferredLocations.filter(
            (item): item is string =>
              typeof item === "string",
          )
        : [],
      employerBlocklist: Array.isArray(
        parsed.employerBlocklist,
      )
        ? parsed.employerBlocklist.filter(
            (item): item is string =>
              typeof item === "string",
          )
        : [],
    };
  } catch {
    return defaultSettings;
  }
}

function saveSettings(
  userId: string,
  settings: SettingsState,
): void {
  try {
    localStorage.setItem(
      getStorageKey(userId),
      JSON.stringify(settings),
    );
  } catch {
    // Ignore localStorage errors.
  }
}

export default function SettingsSection({
  user,
  onUserUpdated,
}: SettingsSectionProps) {
  const [activeTab, setActiveTab] =
    useState<SettingsTab>("interface");

  const [settings, setSettings] =
    useState<SettingsState>(() =>
      loadSettings(user),
    );

  const [saved, setSaved] = useState(false);

  const [jobTitleInput, setJobTitleInput] =
    useState("");

  const [locationInput, setLocationInput] =
    useState("");

  const [employerInput, setEmployerInput] =
    useState("");

  const [showDeleteConfirm, setShowDeleteConfirm] =
    useState(false);

  const [showPasswordModal, setShowPasswordModal] =
    useState(false);

  const [oldPassword, setOldPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmNewPassword, setConfirmNewPassword] =
    useState("");

  const [passwordMessage, setPasswordMessage] =
    useState("");

  useEffect(() => {
    setSettings(loadSettings(user));
    setSaved(false);
  }, [user]);

  useEffect(() => {
    const isFrench = settings.language === "French";
    const resolvedTheme =
      settings.theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : settings.theme;

    const isDark = resolvedTheme === "dark";

    document.documentElement.lang = isFrench ? "fr" : "en";
    document.documentElement.dataset.theme = resolvedTheme;
    document.body.dataset.theme = resolvedTheme;
    document.documentElement.style.colorScheme = resolvedTheme;
    document.body.style.background = isDark ? "#0b1120" : "#f6f8fc";
    document.body.style.color = isDark ? "#edf4ff" : "#17202a";
    document.documentElement.style.setProperty("--jf-bg", isDark ? "#0b1120" : "#f6f8fc");
    document.documentElement.style.setProperty("--jf-text", isDark ? "#edf4ff" : "#17202a");
    document.documentElement.style.setProperty("--jf-muted", isDark ? "#a9b6cf" : "#788391");
    document.documentElement.style.setProperty("--jf-border", isDark ? "#2d3d5a" : "#e4e8ee");
    document.documentElement.style.setProperty("--jf-card", isDark ? "#18253d" : "#ffffff");
    document.documentElement.style.setProperty("--jf-panel", isDark ? "#1d2d45" : "#f8fafd");

    window.dispatchEvent(new CustomEvent("jf-settings-updated"));
  }, [settings.language, settings.theme]);

  const activeTabData = useMemo(
    () =>
      tabs.find(
        (tab) => tab.id === activeTab,
      ),
    [activeTab],
  );

  const updateSettings = (
    updates: Partial<SettingsState>,
  ): void => {
    setSettings((current) => ({
      ...current,
      ...updates,
    }));

    setSaved(false);
  };

  const handleSave = (): void => {
    saveSettings(user.id, settings);
    window.dispatchEvent(new CustomEvent("jf-settings-updated"));

    const updatedUser = updateCurrentUser({
      email: settings.email.trim(),
      phone: settings.phone.trim(),
      seekerProfile: {
        ...user.seekerProfile,
        location: user.city || settings.phone || user.seekerProfile.location,
      },
      recruiterProfile: {
        ...user.recruiterProfile,
        companyLocation: user.city || user.recruiterProfile.companyLocation,
      },
      updatedAt: new Date().toISOString(),
    });

    if (updatedUser && onUserUpdated) {
      onUserUpdated(updatedUser);
    }

    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const addJobTitle = (): void => {
    const value = jobTitleInput.trim();

    if (!value) {
      return;
    }

    const exists =
      settings.targetJobTitles.some(
        (title) =>
          title.toLowerCase() ===
          value.toLowerCase(),
      );

    if (!exists) {
      updateSettings({
        targetJobTitles: [
          ...settings.targetJobTitles,
          value,
        ],
      });
    }

    setJobTitleInput("");
  };

  const removeJobTitle = (
    title: string,
  ): void => {
    updateSettings({
      targetJobTitles:
        settings.targetJobTitles.filter(
          (item) => item !== title,
        ),
    });
  };

  const addLocation = (): void => {
    const value = locationInput.trim();

    if (!value) {
      return;
    }

    const exists =
      settings.preferredLocations.some(
        (location) =>
          location.toLowerCase() ===
          value.toLowerCase(),
      );

    if (!exists) {
      updateSettings({
        preferredLocations: [
          ...settings.preferredLocations,
          value,
        ],
      });
    }

    setLocationInput("");
  };

  const removeLocation = (
    location: string,
  ): void => {
    updateSettings({
      preferredLocations:
        settings.preferredLocations.filter(
          (item) => item !== location,
        ),
    });
  };

  const addEmployer = (): void => {
    const value = employerInput.trim();

    if (!value) {
      return;
    }

    const exists =
      settings.employerBlocklist.some(
        (employer) =>
          employer.toLowerCase() ===
          value.toLowerCase(),
      );

    if (!exists) {
      updateSettings({
        employerBlocklist: [
          ...settings.employerBlocklist,
          value,
        ],
      });
    }

    setEmployerInput("");
  };

  const removeEmployer = (
    employer: string,
  ): void => {
    updateSettings({
      employerBlocklist:
        settings.employerBlocklist.filter(
          (item) => item !== employer,
        ),
    });
  };

  const handleExportData = (): void => {
    const exportData = {
      user,
      settings,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob(
      [
        JSON.stringify(
          exportData,
          null,
          2,
        ),
      ],
      {
        type: "application/json",
      },
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      "jobfind-profile-data.json";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  const handleChangePassword = (): void => {
    setPasswordMessage("");

    if (!oldPassword) {
      setPasswordMessage(
        "Enter your current password.",
      );
      return;
    }

    if (user.password && oldPassword !== user.password) {
      setPasswordMessage(
        "Your current password does not match the saved password.",
      );
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage(
        "Your new password must contain at least 8 characters.",
      );
      return;
    }

    if (
      newPassword !==
      confirmNewPassword
    ) {
      setPasswordMessage(
        "The new passwords do not match.",
      );
      return;
    }

    const updated = updateCurrentUser({
      password: newPassword,
      updatedAt: new Date().toISOString(),
    });

    if (updated && onUserUpdated) {
      onUserUpdated(updated);
    }

    setPasswordMessage(
      "Password changed successfully.",
    );

    setOldPassword("");
    setNewPassword("");
    setConfirmNewPassword("");

    window.setTimeout(() => {
      setShowPasswordModal(false);
      setPasswordMessage("");
    }, 1200);
  };

  const handleDeactivateAccount =
    (): void => {
      const updatedSettings: SettingsState = {
        ...settings,
        profileVisible: false,
        muteNotifications: true,
      };

      setSettings(updatedSettings);

      saveSettings(
        user.id,
        updatedSettings,
      );

      const updatedUser = updateCurrentUser({
        accountStatus: "DEACTIVATED",
        updatedAt: new Date().toISOString(),
      });

      if (updatedUser && onUserUpdated) {
        onUserUpdated(updatedUser);
      }

      setSaved(true);
    };

  const handleDeleteAccount = (): void => {
    try {
      localStorage.removeItem(
        getStorageKey(user.id),
      );
    } catch {
      // Ignore storage errors.
    }

    localStorage.removeItem("jf_current_user");
    setShowDeleteConfirm(false);

    alert(
      "Your account has been removed from the local session. Please reconnect or create a new account to continue.",
    );

    window.location.reload();
  };

  const renderInterfaceSettings =
    (): ReactNode => (
      <>
        <SettingCard
          icon="◈"
          title="Appearance"
          description="Choose how JobFind should look on your device."
        >
          <div className="settings-choice-grid">
            <ChoiceCard
              active={
                settings.theme ===
                "light"
              }
              icon="☀"
              title="Light"
              description="Clean and bright interface."
              onClick={() =>
                updateSettings({
                  theme: "light",
                })
              }
            />

            <ChoiceCard
              active={
                settings.theme ===
                "dark"
              }
              icon="☾"
              title="Dark"
              description="Comfortable in low light."
              onClick={() =>
                updateSettings({
                  theme: "dark",
                })
              }
            />

            <ChoiceCard
              active={
                settings.theme ===
                "system"
              }
              icon="◐"
              title="System default"
              description="Follow your device settings."
              onClick={() =>
                updateSettings({
                  theme: "system",
                })
              }
            />
          </div>
        </SettingCard>

        <SettingCard
          icon="文"
          title="Language"
          description="Choose the language used throughout your JobFind workspace."
        >
          <div className="settings-language">
            <button
              type="button"
              className={
                settings.language ===
                "English"
                  ? "language-option active"
                  : "language-option"
              }
              onClick={() =>
                updateSettings({
                  language:
                    "English",
                })
              }
            >
              <span>🇬🇧</span>
              English
            </button>

            <button
              type="button"
              className={
                settings.language ===
                "French"
                  ? "language-option active"
                  : "language-option"
              }
              onClick={() =>
                updateSettings({
                  language:
                    "French",
                })
              }
            >
              <span>🇫🇷</span>
              Français
            </button>
          </div>
        </SettingCard>
      </>
    );

  const renderAccountSettings =
    (): ReactNode => (
      <>
        <SettingCard
          icon="◎"
          title="Account & security"
          description="Manage your contact details and protect your account."
        >
          <div className="settings-form-grid">
            <Field
              label="Email address"
              value={settings.email}
              onChange={(value) =>
                updateSettings({
                  email: value,
                })
              }
              type="email"
            />

            <Field
              label="Phone number"
              value={settings.phone}
              onChange={(value) =>
                updateSettings({
                  phone: value,
                })
              }
              placeholder="+237 6XX XXX XXX"
            />
          </div>

          <div className="settings-divider" />

          <div className="settings-security-row">
            <div>
              <strong>Change email</strong>
              <span>Update the primary email connected to your account.</span>
            </div>

            <button
              type="button"
              className="settings-outline-btn"
              onClick={() => {
                const nextEmail = window.prompt("Enter your new email address:", settings.email || "");

                if (!nextEmail) {
                  return;
                }

                const safeEmail = nextEmail.trim();
                updateSettings({ email: safeEmail });

                const updatedUser = updateCurrentUser({
                  email: safeEmail.toLowerCase(),
                  emailVerified: true,
                  updatedAt: new Date().toISOString(),
                });

                if (updatedUser && onUserUpdated) {
                  onUserUpdated(updatedUser);
                }

                alert("Your email address has been updated successfully.");
              }}
            >
              Update email
            </button>
          </div>

          <div className="settings-divider" />

          <div className="settings-security-row">
            <div>
              <strong>Change phone number</strong>
              <span>Update your mobile number for account alerts and verification.</span>
            </div>

            <button
              type="button"
              className="settings-outline-btn"
              onClick={() => {
                const nextPhone = window.prompt("Enter your new phone number:", settings.phone || "");

                if (!nextPhone) {
                  return;
                }

                updateSettings({ phone: nextPhone.trim() });
                alert("Your phone number has been updated.");
              }}
            >
              Update phone
            </button>
          </div>

          <div className="settings-divider" />

          <div className="settings-security-row">
            <div>
              <strong>Password</strong>
              <span>Change your JobFind password regularly.</span>
            </div>

            <button
              type="button"
              className="settings-outline-btn"
              onClick={() => {
                setPasswordMessage("");
                setShowPasswordModal(true);
              }}
            >
              Change password
            </button>
          </div>

          <div className="settings-divider" />

          <ToggleRow
            title="Two-factor authentication"
            description="Require an additional verification step when signing in."
            checked={settings.twoFactor}
            onChange={(checked) =>
              updateSettings({
                twoFactor: checked,
              })
            }
          />
        </SettingCard>
      </>
    );

  const renderJobSettings =
    (): ReactNode => (
      <>
        <SettingCard
          icon="⌕"
          title="Target job titles"
          description="Tell JobFind what kinds of opportunities you want to discover."
        >
          <div className="settings-add-row">
            <input
              value={jobTitleInput}
              onChange={(event) =>
                setJobTitleInput(
                  event.target.value,
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  event.preventDefault();
                  addJobTitle();
                }
              }}
              placeholder="e.g. Frontend Developer"
            />

            <button
              type="button"
              onClick={addJobTitle}
            >
              Add
            </button>
          </div>

          <TagList
            items={
              settings.targetJobTitles
            }
            onRemove={
              removeJobTitle
            }
            emptyText="No target job titles added yet."
          />
        </SettingCard>

        <SettingCard
          icon="⌂"
          title="Work preferences"
          description="Choose the work arrangements that match your lifestyle."
        >
          <ToggleRow
            title="Remote jobs"
            description="Show opportunities that can be performed remotely."
            checked={
              settings.remote
            }
            onChange={(checked) =>
              updateSettings({
                remote: checked,
              })
            }
          />

          <div className="settings-divider" />

          <ToggleRow
            title="Hybrid jobs"
            description="Show opportunities combining remote and on-site work."
            checked={
              settings.hybrid
            }
            onChange={(checked) =>
              updateSettings({
                hybrid: checked,
              })
            }
          />
        </SettingCard>

        <SettingCard
          icon="⌖"
          title="Preferred locations"
          description="Add cities or areas where you would like to work."
        >
          <div className="settings-add-row">
            <input
              value={locationInput}
              onChange={(event) =>
                setLocationInput(
                  event.target.value,
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  event.preventDefault();
                  addLocation();
                }
              }}
              placeholder="e.g. Douala, Yaoundé"
            />

            <button
              type="button"
              onClick={addLocation}
            >
              Add
            </button>
          </div>

          <TagList
            items={
              settings.preferredLocations
            }
            onRemove={
              removeLocation
            }
            emptyText="No preferred locations added yet."
          />
        </SettingCard>
      </>
    );

  const frequencyOptions: Array<{
    value: AlertFrequency;
    title: string;
    description: string;
    icon: string;
  }> = [
    {
      value: "instant",
      title: "Instant",
      description:
        "Get alerts as soon as they happen.",
      icon: "⚡",
    },
    {
      value: "daily",
      title: "Daily",
      description:
        "Receive one summary each day.",
      icon: "◷",
    },
    {
      value: "weekly",
      title: "Weekly",
      description:
        "Receive a weekly opportunity digest.",
      icon: "◴",
    },
    {
      value: "custom",
      title: "Custom",
      description:
        "Choose your preferred notification time.",
      icon: "⚙",
    },
  ];

  const renderNotificationSettings =
    (): ReactNode => (
      <>
        <SettingCard
          icon="♢"
          title="Alert frequency"
          description="Choose how often JobFind should notify you about opportunities."
        >
          <div className="frequency-grid">
            {frequencyOptions.map(
              (option) => (
                <ChoiceCard
                  key={option.value}
                  active={
                    settings.alertFrequency ===
                    option.value
                  }
                  icon={option.icon}
                  title={option.title}
                  description={
                    option.description
                  }
                  onClick={() =>
                    updateSettings({
                      alertFrequency:
                        option.value,
                    })
                  }
                />
              ),
            )}
          </div>

          {settings.alertFrequency ===
            "custom" && (
            <div className="custom-time">
              <label>
                <span>
                  Preferred alert time
                </span>

                <input
                  type="time"
                  value={
                    settings.customAlertTime
                  }
                  onChange={(event) =>
                    updateSettings({
                      customAlertTime:
                        event.target
                          .value,
                    })
                  }
                />
              </label>
            </div>
          )}
        </SettingCard>

        <SettingCard
          icon="🔕"
          title="Mute notifications"
          description="Temporarily silence all JobFind notifications."
        >
          <ToggleRow
            title="Mute all notifications"
            description={
              settings.muteNotifications
                ? "Notifications are currently muted."
                : "Notifications are currently active."
            }
            checked={
              settings.muteNotifications
            }
            onChange={(checked) =>
              updateSettings({
                muteNotifications:
                  checked,
              })
            }
          />
        </SettingCard>

        <SettingCard
          icon="◇"
          title="Notification channels"
          description="Choose where you want to receive JobFind alerts."
        >
          <ToggleRow
            title="Email"
            description="Receive alerts and summaries by email."
            checked={
              settings.emailNotifications
            }
            onChange={(checked) =>
              updateSettings({
                emailNotifications:
                  checked,
              })
            }
          />

          <div className="settings-divider" />

          <ToggleRow
            title="SMS"
            description="Receive important notifications by SMS."
            checked={
              settings.smsNotifications
            }
            onChange={(checked) =>
              updateSettings({
                smsNotifications:
                  checked,
              })
            }
          />

          <div className="settings-divider" />

          <ToggleRow
            title="Push notifications"
            description="Receive instant alerts in your browser or mobile app."
            checked={
              settings.pushNotifications
            }
            onChange={(checked) =>
              updateSettings({
                pushNotifications:
                  checked,
              })
            }
          />
        </SettingCard>
      </>
    );

  const renderPrivacySettings =
    (): ReactNode => (
      <>
        <SettingCard
          icon="◉"
          title="Profile visibility"
          description="Control whether employers can discover your profile."
        >
          <ToggleRow
            title="Make my profile visible"
            description={
              settings.profileVisible
                ? "Employers can discover your profile when matching jobs."
                : "Your profile is hidden from employer searches."
            }
            checked={
              settings.profileVisible
            }
            onChange={(checked) =>
              updateSettings({
                profileVisible:
                  checked,
              })
            }
          />
        </SettingCard>

        <SettingCard
          icon="⛔"
          title="Employer blocklist"
          description="Prevent specific employers from discovering your profile."
        >
          <div className="settings-add-row">
            <input
              value={employerInput}
              onChange={(event) =>
                setEmployerInput(
                  event.target.value,
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  event.preventDefault();
                  addEmployer();
                }
              }}
              placeholder="Company or employer name"
            />

            <button
              type="button"
              onClick={addEmployer}
            >
              Block
            </button>
          </div>

          <TagList
            items={
              settings.employerBlocklist
            }
            onRemove={
              removeEmployer
            }
            emptyText="No employers have been blocked."
            danger
          />
        </SettingCard>

        <SettingCard
          icon="✦"
          title="Get more visibility"
          description="Increase your chances of appearing in relevant employer searches."
        >
          <div className="visibility-banner">
            <div className="visibility-icon">
              ✦
            </div>

            <div className="visibility-content">
              <strong>
                Boost your professional visibility
              </strong>

              <p>
                Premium visibility can place your profile higher in relevant employer searches and recommendations.
              </p>

              <button
                type="button"
                className="settings-primary-btn"
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent("jf-open-premium-modal"),
                  );
                }}
              >
                {settings.subscriptionActive
                  ? "Manage Premium"
                  : "Get Premium"}
              </button>
            </div>
          </div>
        </SettingCard>
      </>
    );

  const renderDataSettings =
    (): ReactNode => (
      <>
        <SettingCard
          icon="⇩"
          title="Export profile data"
          description="Download a copy of your JobFind profile and preferences."
        >
          <div className="data-action">
            <div>
              <strong>
                Download your data
              </strong>

              <span>
                Your information will be exported as a JSON file.
              </span>
            </div>

            <button
              type="button"
              className="settings-outline-btn"
              onClick={
                handleExportData
              }
            >
              Export data
            </button>
          </div>
        </SettingCard>

        <SettingCard
          icon="◌"
          title="Account deactivation"
          description="Temporarily disable your JobFind account."
        >
          <div className="danger-action">
            <div>
              <strong>
                Deactivate account
              </strong>

              <span>
                Your profile will be hidden and notifications will be paused.
              </span>
            </div>

            <button
              type="button"
              className="settings-danger-outline"
              onClick={
                handleDeactivateAccount
              }
            >
              Deactivate
            </button>
          </div>
        </SettingCard>

        <SettingCard
          icon="×"
          title="Delete account"
          description="Permanently remove your JobFind account."
          danger
        >
          <div className="danger-action">
            <div>
              <strong>
                Permanently delete account
              </strong>

              <span>
                This action is permanent.
              </span>
            </div>

            <button
              type="button"
              className="settings-danger-btn"
              onClick={() =>
                setShowDeleteConfirm(true)
              }
            >
              Delete account
            </button>
          </div>
        </SettingCard>
      </>
    );

  const renderContent = (): ReactNode => {
    switch (activeTab) {
      case "account":
        return renderAccountSettings();

      case "jobs":
        return renderJobSettings();

      case "notifications":
        return renderNotificationSettings();

      case "privacy":
        return renderPrivacySettings();

      case "data":
        return renderDataSettings();

      case "interface":
      default:
        return renderInterfaceSettings();
    }
  };

  return (
    <section className="jf-settings">
      <div className="settings-header">
        <div>
          <span className="settings-eyebrow">
            ACCOUNT SETTINGS
          </span>

          <h2>
            Preferences & security
          </h2>

          <p>
            Customize your JobFind experience,
            job preferences, notifications and
            account privacy.
          </p>
        </div>

        <button
          type="button"
          className={
            saved
              ? "settings-save-btn saved"
              : "settings-save-btn"
          }
          onClick={handleSave}
        >
          {saved
            ? "✓ Saved"
            : "Save changes"}
        </button>
      </div>

      <div className="settings-layout">
        <aside className="settings-sidebar">
          <nav aria-label="Settings navigation">
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab.id}
                className={
                  activeTab === tab.id
                    ? "settings-tab active"
                    : "settings-tab"
                }
                onClick={() =>
                  setActiveTab(tab.id)
                }
              >
                <span className="settings-tab-icon">
                  {tab.icon}
                </span>

                <span className="settings-tab-label">
                  {tab.label}
                </span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="settings-main">
          <div className="settings-section-heading">
            <div className="settings-heading-icon">
              {activeTabData?.icon}
            </div>

            <div>
              <h3>
                {activeTabData?.label}
              </h3>

              <p>
                Manage your preferences from this
                section.
              </p>
            </div>
          </div>

          <div className="settings-cards">
            {renderContent()}
          </div>
        </main>
      </div>

      {showPasswordModal && (
        <div
          className="settings-modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setShowPasswordModal(false);
            }
          }}
        >
          <div
            className="settings-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="password-modal-title"
          >
            <button
              type="button"
              className="settings-modal-close"
              onClick={() =>
                setShowPasswordModal(false)
              }
              aria-label="Close password dialog"
            >
              ×
            </button>

            <div className="modal-icon">
              ◆
            </div>

            <h3 id="password-modal-title">
              Change password
            </h3>

            <p>
              Create a strong password to
              protect your JobFind account.
            </p>

            <div className="modal-fields">
              <Field
                label="Current password"
                value={oldPassword}
                onChange={setOldPassword}
                type="password"
              />

              <Field
                label="New password"
                value={newPassword}
                onChange={setNewPassword}
                type="password"
              />

              <Field
                label="Confirm new password"
                value={confirmNewPassword}
                onChange={
                  setConfirmNewPassword
                }
                type="password"
              />
            </div>

            {passwordMessage && (
              <div className="password-message">
                {passwordMessage}
              </div>
            )}

            <button
              type="button"
              className="settings-primary-btn full"
              onClick={
                handleChangePassword
              }
            >
              Update password
            </button>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div
          className="settings-modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setShowDeleteConfirm(false);
            }
          }}
        >
          <div
            className="settings-modal danger-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
          >
            <div className="modal-danger-icon">
              !
            </div>

            <h3 id="delete-modal-title">
              Delete your account?
            </h3>

            <p>
              This action is permanent. Your
              JobFind account and associated
              information may no longer be
              recoverable.
            </p>

            <div className="modal-actions">
              <button
                type="button"
                className="settings-outline-btn"
                onClick={() =>
                  setShowDeleteConfirm(false)
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="settings-danger-btn"
                onClick={
                  handleDeleteAccount
                }
              >
                Confirm deletion
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

interface SettingCardProps {
  icon: string;
  title: string;
  description: string;
  children: ReactNode;
  danger?: boolean;
}

function SettingCard({
  icon,
  title,
  description,
  children,
  danger = false,
}: SettingCardProps) {
  return (
    <article
      className={
        danger
          ? "setting-card danger-card"
          : "setting-card"
      }
    >
      <div className="setting-card-header">
        <div className="setting-card-icon">
          {icon}
        </div>

        <div>
          <h4>{title}</h4>
          <p>{description}</p>
        </div>
      </div>

      <div className="setting-card-body">
        {children}
      </div>
    </article>
  );
}

interface ChoiceCardProps {
  active: boolean;
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
}

function ChoiceCard({
  active,
  icon,
  title,
  description,
  onClick,
}: ChoiceCardProps) {
  return (
    <button
      type="button"
      className={
        active
          ? "choice-card active"
          : "choice-card"
      }
      onClick={onClick}
    >
      <span className="choice-icon">
        {icon}
      </span>

      <span className="choice-content">
        <strong>{title}</strong>

        <small>
          {description}
        </small>
      </span>

      <span className="choice-check">
        {active ? "✓" : ""}
      </span>
    </button>
  );
}

interface ToggleRowProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: ToggleRowProps) {
  return (
    <div className="toggle-row">
      <div className="toggle-text">
        <strong>{title}</strong>

        <span>{description}</span>
      </div>

      <button
        type="button"
        className={
          checked
            ? "settings-toggle active"
            : "settings-toggle"
        }
        onClick={() =>
          onChange(!checked)
        }
        aria-pressed={checked}
        aria-label={title}
      >
        <span />
      </button>
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: FieldProps) {
  return (
    <label className="settings-field">
      <span>{label}</span>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
      />
    </label>
  );
}

interface TagListProps {
  items: string[];
  onRemove: (item: string) => void;
  emptyText: string;
  danger?: boolean;
}

function TagList({
  items,
  onRemove,
  emptyText,
  danger = false,
}: TagListProps) {
  if (items.length === 0) {
    return (
      <p className="settings-empty">
        {emptyText}
      </p>
    );
  }

  return (
    <div className="settings-tags">
      {items.map((item) => (
        <span
          key={item}
          className={
            danger
              ? "settings-tag danger"
              : "settings-tag"
          }
        >
          <span>{item}</span>

          <button
            type="button"
            onClick={() =>
              onRemove(item)
            }
            aria-label={`Remove ${item}`}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}