// ============================================================
// JOBFIND - AUTH STORAGE
// ============================================================

import type {
  AccountStatus,
  AdminProfile,
  Gender,
  JobCategoryPreference,
  RecruiterContext,
  RecruiterLevel,
  RecruiterProfile,
  RecruiterType,
  RecruitmentCategoryPreference,
  RecruitmentFrequency,
  RecruitmentPurpose,
  SeekerProfile,
  SeekerWorkType,
  UserAccount,
  Workplace,
  WorkplaceType,
} from "./types";

// ============================================================
// STORAGE KEYS
// ============================================================

const USERS_KEY = "jf_users";
const CURRENT_USER_KEY = "jf_current_user";

// ============================================================
// DEFAULT PROFILES
// ============================================================

function createDefaultSeekerProfile(): SeekerProfile {
  return {
    enabled: true,
    completed: false,
    jobCategories: [],
    workTypes: [],
    customJobCategories: [],
  };
}

function createDefaultRecruiterProfile(): RecruiterProfile {
  return {
    enabled: false,
    completed: false,
    workerCategories: [],
    customWorkerCategories: [],
    verificationStatus: "not_started",
  };
}

// ============================================================
// AUTH EVENT
// ============================================================

function notifyAuthUpdate(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new Event("jf-auth-updated")
  );
}

// ============================================================
// ID GENERATORS
// ============================================================

function generateUserId(): string {
  return `user-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function generateWorkplaceId(): string {
  return `workplace-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

// ============================================================
// DEFAULT ADMIN
// ============================================================

function createDefaultAdminAccount(): UserAccount {
  const timestamp = new Date().toISOString();

  const adminProfile: AdminProfile = {
    adminID: "ADM-001",
    department: "Platform Operations",
    permissions: [
      "MANAGE_USERS",
      "MANAGE_JOBS",
      "MANAGE_REPORTS",
      "MONITOR_PLATFORM",
    ],
  };

  return {
    id: "user-admin-001",

    fullName: "System Admin",

    email: "admin@jobfind.com",

    /*
     * NOTE:
     * This is acceptable for a local prototype only.
     * Never store plaintext passwords in a real production
     * application.
     */
    password: "admin123",

    gender: "Male",

    phone: "+237 600000000",

    city: "Douala",

    role: "admin",

    accountStatus: "ACTIVE",

    isPremium: true,

    emailVerified: true,

    seekerProfile:
      createDefaultSeekerProfile(),

    recruiterProfile:
      createDefaultRecruiterProfile(),

    adminProfile,

    workplace: {
      id: "workplace-admin",

      type: "admin",

      name: "Admin Control Center",

      description:
        "Platform management and analytics",

      createdAt: timestamp,

      active: true,
    },

    onboardingCompleted: true,

    createdAt: timestamp,

    updatedAt: timestamp,
  };
}

// ============================================================
// NORMALIZE USER
// ============================================================

function normalizeUser(
  raw: Partial<UserAccount>
): UserAccount {
  const timestamp =
    new Date().toISOString();

  /*
   * ----------------------------------------------------------
   * SEEKER PROFILE
   * ----------------------------------------------------------
   */

  const seekerProfile: SeekerProfile = {
    ...createDefaultSeekerProfile(),

    ...(raw.seekerProfile ?? {}),

    jobCategories:
      raw.seekerProfile?.jobCategories ??
      [],

    workTypes:
      raw.seekerProfile?.workTypes ??
      [],

    customJobCategories:
      raw.seekerProfile
        ?.customJobCategories ??
      [],
  };

  /*
   * ----------------------------------------------------------
   * SUPPORT OLD workerProfile DATA
   * ----------------------------------------------------------
   */

  type OldWorkerProfile = {
    enabled?: boolean;
    completed?: boolean;
    headline?: string;
    bio?: string;
    skills?: string[];
    services?: string[];
    location?: string;
    availability?:
      | "available"
      | "busy"
      | "unavailable";
    hourlyRate?: string;
    experience?: string;
    phone?: string;
    profilePhoto?: string;
  };

  const oldWorkerProfile = (
    raw as Partial<UserAccount> & {
      workerProfile?: OldWorkerProfile;
    }
  ).workerProfile;

  if (
    oldWorkerProfile &&
    !raw.seekerProfile
  ) {
    seekerProfile.enabled =
      oldWorkerProfile.enabled ??
      true;

    seekerProfile.completed =
      oldWorkerProfile.completed ??
      false;

    seekerProfile.headline =
      oldWorkerProfile.headline;

    seekerProfile.bio =
      oldWorkerProfile.bio;

    seekerProfile.skills =
      oldWorkerProfile.skills;

    seekerProfile.services =
      oldWorkerProfile.services;

    seekerProfile.location =
      oldWorkerProfile.location;

    seekerProfile.availability =
      oldWorkerProfile.availability;

    seekerProfile.hourlyRate =
      oldWorkerProfile.hourlyRate;

    seekerProfile.experience =
      oldWorkerProfile.experience;

    seekerProfile.phone =
      oldWorkerProfile.phone;

    seekerProfile.profilePhoto =
      oldWorkerProfile.profilePhoto;
  }

  /*
   * ----------------------------------------------------------
   * RECRUITER PROFILE
   * ----------------------------------------------------------
   */

  const recruiterProfile: RecruiterProfile = {
    ...createDefaultRecruiterProfile(),

    ...(raw.recruiterProfile ?? {}),

    workerCategories:
      raw.recruiterProfile
        ?.workerCategories ??
      [],

    customWorkerCategories:
      raw.recruiterProfile
        ?.customWorkerCategories ??
      [],

    verificationStatus:
      raw.recruiterProfile
        ?.verificationStatus ??
      "not_started",
  };

  /*
   * ----------------------------------------------------------
   * ROLE
   * ----------------------------------------------------------
   */

  const role:
    | "seeker"
    | "recruiter"
    | "admin" =
    raw.role === "admin"
      ? "admin"
      : raw.role === "recruiter"
      ? "recruiter"
      : "seeker";

  /*
   * ----------------------------------------------------------
   * ENABLE THE CORRECT PROFILE
   * ----------------------------------------------------------
   */

  if (role === "seeker") {
    seekerProfile.enabled = true;
    recruiterProfile.enabled = false;
  }

  if (role === "recruiter") {
    seekerProfile.enabled = false;
    recruiterProfile.enabled = true;
  }

  if (role === "admin") {
    seekerProfile.enabled = false;
    recruiterProfile.enabled = false;
  }

  /*
   * ----------------------------------------------------------
   * ADMIN PROFILE
   * ----------------------------------------------------------
   */

  let adminProfile:
    | AdminProfile
    | undefined =
    raw.adminProfile;

  if (
    role === "admin" &&
    !adminProfile
  ) {
    adminProfile = {
      adminID:
        `ADM-${raw.id ?? "001"}`,

      department:
        "System Moderation",

      permissions: [
        "MANAGE_USERS",
        "MANAGE_JOBS",
        "MANAGE_REPORTS",
        "MONITOR_PLATFORM",
      ],
    };
  }

  /*
   * ----------------------------------------------------------
   * RETURN NORMALIZED USER
   * ----------------------------------------------------------
   */

  return {
    id:
      raw.id ??
      generateUserId(),

    fullName:
      raw.fullName ??
      "",

    email:
      raw.email
        ?.trim()
        .toLowerCase() ??
      "",

    password:
      raw.password ??
      "",

    gender:
      raw.gender ??
      "Male",

    phone:
      raw.phone,

    city:
      raw.city ??
      "",

    role,

    accountStatus:
      raw.accountStatus ??
      "ACTIVE",

    isPremium:
      raw.isPremium ??
      false,

    subscription:
      raw.subscription,

    emailVerified:
      raw.emailVerified ??
      false,

    emailVerificationToken:
      raw.emailVerificationToken,

    emailVerificationExpiresAt:
      raw.emailVerificationExpiresAt,

    seekerProfile,

    recruiterProfile,

    adminProfile,

    workplace:
      raw.workplace,

    onboardingCompleted:
      raw.onboardingCompleted ??
      (role === "admin"),

    createdAt:
      raw.createdAt ??
      timestamp,

    updatedAt:
      raw.updatedAt ??
      timestamp,
  };
}

// ============================================================
// READ USERS
// ============================================================

function readUsers(): UserAccount[] {
  if (
    typeof window === "undefined"
  ) {
    return [];
  }

  const raw =
    localStorage.getItem(
      USERS_KEY
    );

  let users: UserAccount[] = [];

  if (raw) {
    try {
      const parsed: unknown =
        JSON.parse(raw);

      if (
        Array.isArray(parsed)
      ) {
        users = parsed.map(
          (user: unknown) =>
            normalizeUser(
              user as Partial<UserAccount>
            )
        );
      }
    } catch {
      users = [];
    }
  }

  /*
   * Ensure the default administrator exists.
   */
  const hasAdmin =
    users.some(
      (user) =>
        user.role === "admin" ||
        user.email.toLowerCase() ===
          "admin@jobfind.com"
    );

  if (!hasAdmin) {
    const admin =
      createDefaultAdminAccount();

    users.push(admin);

    writeUsers(users);
  }

  return users;
}

// ============================================================
// WRITE USERS
// ============================================================

function writeUsers(
  users: UserAccount[]
): void {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  localStorage.setItem(
    USERS_KEY,
    JSON.stringify(users)
  );
}

// ============================================================
// EMAIL VERIFICATION
// ============================================================

export function createEmailVerificationToken(): string {
  return (
    `verify-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 14)}`
  );
}

// ============================================================
// CHECK EMAIL
// ============================================================

export function emailExists(
  email: string
): boolean {
  const normalizedEmail =
    email
      .trim()
      .toLowerCase();

  return readUsers().some(
    (user) =>
      user.email.toLowerCase() ===
      normalizedEmail
  );
}

// ============================================================
// GENERATE VERIFICATION LINK
// ============================================================

export function generateVerificationLink(
  user: Pick<
    UserAccount,
    "emailVerificationToken"
  >
): string {
  const token =
    user.emailVerificationToken;

  if (!token) {
    return "";
  }

  const baseUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}`
      : "http://localhost:5173/";

  return `${baseUrl}?verify=${encodeURIComponent(
    token
  )}`;
}

// ============================================================
// VERIFY EMAIL TOKEN
// ============================================================

export function verifyEmailToken(
  token: string
): UserAccount | null {
  const cleanToken =
    token.trim();

  if (!cleanToken) {
    return null;
  }

  const users =
    readUsers();

  const userIndex =
    users.findIndex(
      (user) =>
        user.emailVerificationToken ===
        cleanToken
    );

  if (
    userIndex === -1
  ) {
    return null;
  }

  const user =
    users[userIndex];

  /*
   * Check expiration.
   */
  if (
    user.emailVerificationExpiresAt
  ) {
    const expiresAt =
      new Date(
        user.emailVerificationExpiresAt
      ).getTime();

    if (
      Date.now() >
      expiresAt
    ) {
      return null;
    }
  }

  const updatedUser: UserAccount = {
    ...user,

    emailVerified: true,

    emailVerificationToken:
      undefined,

    emailVerificationExpiresAt:
      undefined,

    updatedAt:
      new Date().toISOString(),
  };

  users[userIndex] =
    updatedUser;

  writeUsers(users);

  /*
   * If this user is currently logged in,
   * update the stored session.
   */
  const currentUser =
    getCurrentUser();

  if (
    currentUser &&
    currentUser.id ===
      updatedUser.id
  ) {
    loginUser(updatedUser);
  }

  return updatedUser;
}

// ============================================================
// CREATE ACCOUNT
// ============================================================

export function createAccount(
  data: {
    fullName: string;
    email: string;
    password: string;
    gender: Gender;
  }
): UserAccount {
  const users =
    readUsers();

  const fullName =
    data.fullName.trim();

  const email =
    data.email
      .trim()
      .toLowerCase();

  if (!fullName) {
    throw new Error(
      "Full name is required."
    );
  }

  if (!email) {
    throw new Error(
      "Email address is required."
    );
  }

  if (!data.password) {
    throw new Error(
      "Password is required."
    );
  }

  /*
   * Prevent duplicate accounts.
   */
  const exists =
    users.some(
      (user) =>
        user.email.toLowerCase() ===
        email
    );

  if (exists) {
    throw new Error(
      "An account already exists with this email."
    );
  }

  const timestamp =
    new Date().toISOString();

  const verificationToken =
    createEmailVerificationToken();

  const verificationExpiresAt =
    new Date(
      Date.now() +
        24 * 60 * 60 * 1000
    ).toISOString();

  const account: UserAccount = {
    id: generateUserId(),

    fullName,

    email,

    password:
      data.password,

    gender:
      data.gender,

    phone:
      undefined,

    city:
      "",

    /*
     * New accounts begin as job seekers.
     * Onboarding can later configure the
     * user's recruiter profile.
     */
    role: "seeker",

    accountStatus:
      "ACTIVE",

    isPremium:
      false,

    subscription:
      undefined,

    /*
     * New accounts must verify their email before login.
     */
    emailVerified:
      false,

    emailVerificationToken:
      verificationToken,

    emailVerificationExpiresAt:
      verificationExpiresAt,

    seekerProfile:
      createDefaultSeekerProfile(),

    recruiterProfile:
      createDefaultRecruiterProfile(),

    adminProfile:
      undefined,

    workplace:
      undefined,

    onboardingCompleted:
      false,

    createdAt:
      timestamp,

    updatedAt:
      timestamp,
  };

  users.push(account);

  writeUsers(users);

  return account;
}

// ============================================================
// CURRENT USER
// ============================================================

export function getCurrentUser():
  UserAccount | null {
  if (
    typeof window === "undefined"
  ) {
    return null;
  }

  const raw =
    localStorage.getItem(
      CURRENT_USER_KEY
    );

  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown =
      JSON.parse(raw);

    if (
      !parsed ||
      typeof parsed !== "object"
    ) {
      throw new Error(
        "Invalid stored user."
      );
    }

    return normalizeUser(
      parsed as Partial<UserAccount>
    );
  } catch {
    localStorage.removeItem(
      CURRENT_USER_KEY
    );

    return null;
  }
}

// ============================================================
// LOGIN USER
// ============================================================

export function loginUser(
  user: UserAccount
): void {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  const normalized =
    normalizeUser(user);

  localStorage.setItem(
    CURRENT_USER_KEY,
    JSON.stringify(
      normalized
    )
  );

  notifyAuthUpdate();
}

// ============================================================
// AUTHENTICATE USER
// ============================================================

export function authenticateUser(
  email: string,
  password: string
): UserAccount {
  const users =
    readUsers();

  const normalizedEmail =
    email
      .trim()
      .toLowerCase();

  const account =
    users.find(
      (user) =>
        user.email.toLowerCase() ===
        normalizedEmail
    );

  /*
   * Do not reveal whether the email
   * or password was incorrect.
   */
  if (
    !account ||
    account.password !==
      password
  ) {
    throw new Error(
      "Invalid email or password."
    );
  }

  /*
   * Account status.
   */
  if (
    account.accountStatus !==
    "ACTIVE"
  ) {
    if (
      account.accountStatus ===
      "SUSPENDED"
    ) {
      throw new Error(
        "This account has been suspended."
      );
    }

    throw new Error(
      "This account has been deactivated."
    );
  }

  /*
   * Email verification.
   */
  if (
    !account.emailVerified
  ) {
    throw new Error(
      "Please verify your email before signing in."
    );
  }

  /*
   * Create authenticated session.
   */
  loginUser(account);

  return account;
}

// ============================================================
// LOGOUT
// ============================================================

export function logoutUser(): void {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  localStorage.removeItem(
    CURRENT_USER_KEY
  );

  notifyAuthUpdate();
}

// ============================================================
// UPDATE CURRENT USER
// ============================================================

export function updateCurrentUser(
  updates: Partial<UserAccount>
): UserAccount | null {
  const current =
    getCurrentUser();

  if (!current) {
    return null;
  }

  const updated: UserAccount = {
    ...current,

    ...updates,

    updatedAt:
      new Date().toISOString(),
  };

  /*
   * Always preserve the existing profiles
   * when partial profile updates are passed.
   */
  updated.seekerProfile = {
    ...current.seekerProfile,

    ...(updates.seekerProfile ??
      {}),
  };

  updated.recruiterProfile = {
    ...current.recruiterProfile,

    ...(updates.recruiterProfile ??
      {}),
  };

  /*
   * Normalize the active profile according
   * to the selected role.
   */
  if (
    updated.role === "seeker"
  ) {
    updated.seekerProfile.enabled =
      true;

    updated.recruiterProfile.enabled =
      false;
  }

  if (
    updated.role === "recruiter"
  ) {
    updated.seekerProfile.enabled =
      false;

    updated.recruiterProfile.enabled =
      true;
  }

  if (
    updated.role === "admin"
  ) {
    updated.seekerProfile.enabled =
      false;

    updated.recruiterProfile.enabled =
      false;
  }

  /*
   * Ensure an admin always has an
   * administrator profile.
   */
  if (
    updated.role === "admin" &&
    !updated.adminProfile
  ) {
    updated.adminProfile = {
      adminID:
        `ADM-${updated.id}`,

      department:
        "System Moderation",

      permissions: [
        "MANAGE_USERS",
        "MANAGE_JOBS",
        "MANAGE_REPORTS",
        "MONITOR_PLATFORM",
      ],
    };
  }

  const users =
    readUsers();

  const index =
    users.findIndex(
      (user) =>
        user.id ===
        current.id
    );

  if (
    index === -1
  ) {
    return null;
  }

  users[index] =
    updated;

  writeUsers(users);

  if (
    typeof window !==
    "undefined"
  ) {
    localStorage.setItem(
      CURRENT_USER_KEY,
      JSON.stringify(
        updated
      )
    );
  }

  notifyAuthUpdate();

  return updated;
}

// ============================================================
// CREATE WORKPLACE
// ============================================================

export function createWorkplace(
  type: WorkplaceType,
  name: string,
  description: string
): Workplace {
  return {
    id:
      generateWorkplaceId(),

    type,

    name,

    description,

    createdAt:
      new Date().toISOString(),

    active: true,
  };
}

// ============================================================
// ENABLE SEEKER PROFILE
// ============================================================

export function enableSeekerProfile():
  UserAccount | null {
  const current =
    getCurrentUser();

  if (!current) {
    return null;
  }

  const workplace =
    createWorkplace(
      "job-seeker",

      "Job Seeker Workspace",

      "A personalized workplace for finding jobs, gigs, contracts and opportunities."
    );

  return updateCurrentUser({
    role: "seeker",

    seekerProfile: {
      ...current.seekerProfile,

      enabled: true,
    },

    recruiterProfile: {
      ...current.recruiterProfile,

      enabled: false,
    },

    workplace,
  });
}

// ============================================================
// ENABLE RECRUITER PROFILE
// ============================================================

export function enableRecruiterProfile(
  recruiterType: RecruiterType
): UserAccount | null {
  const current =
    getCurrentUser();

  if (!current) {
    return null;
  }

  const workplace =
    createWorkplace(
      "recruiter",

      "Recruiter Workspace",

      "A personalized workplace for finding workers and managing recruitment."
    );

  return updateCurrentUser({
    role: "recruiter",

    seekerProfile: {
      ...current.seekerProfile,

      enabled: false,
    },

    recruiterProfile: {
      ...current.recruiterProfile,

      enabled: true,

      recruiterType,

      verificationStatus:
        current.recruiterProfile
          .verificationStatus ??
        "not_started",
    },

    workplace,
  });
}

// ============================================================
// JOB SEEKER ONBOARDING
// ============================================================

export interface SeekerOnboardingData {
  workTypes: SeekerWorkType[];

  jobCategories:
    JobCategoryPreference[];

  customJobCategories:
    string[];

  city?: string;
}

// ============================================================
// COMPLETE SEEKER ONBOARDING
// ============================================================

export function completeSeekerOnboarding(
  data: SeekerOnboardingData
): UserAccount | null {
  const current =
    getCurrentUser();

  if (!current) {
    return null;
  }

  const workplace =
    createWorkplace(
      "job-seeker",

      "Job Seeker Workspace",

      "Personalized job, gig and work opportunities based on your preferences."
    );

  return updateCurrentUser({
    role: "seeker",

    city:
      data.city?.trim() ??
      current.city,

    seekerProfile: {
      ...current.seekerProfile,

      enabled: true,

      completed: true,

      workTypes:
        data.workTypes,

      jobCategories:
        data.jobCategories,

      customJobCategories:
        data.customJobCategories,
    },

    recruiterProfile: {
      ...current.recruiterProfile,

      enabled: false,
    },

    workplace,

    onboardingCompleted:
      true,
  });
}

// ============================================================
// RECRUITER ONBOARDING
// ============================================================

export interface RecruiterOnboardingData {
  recruiterType:
    RecruiterType;

  recruiterLevel:
    RecruiterLevel;

  recruiterContext:
    RecruiterContext;

  otherContextDescription?:
    string;

  recruitmentPurpose:
    RecruitmentPurpose;

  recruitmentFrequency:
    RecruitmentFrequency;

  workerCategories:
    RecruitmentCategoryPreference[];

  customWorkerCategories:
    string[];

  companyName?: string;

  industry?: string;

  city?: string;
}

// ============================================================
// COMPLETE RECRUITER ONBOARDING
// ============================================================

export function completeRecruiterOnboarding(
  data: RecruiterOnboardingData
): UserAccount | null {
  const current =
    getCurrentUser();

  if (!current) {
    return null;
  }

  const workplace =
    createWorkplace(
      "recruiter",

      "Recruiter Workspace",

      "Personalized recruitment tools based on the recruiter's needs."
    );

  return updateCurrentUser({
    role: "recruiter",

    city:
      data.city?.trim() ??
      current.city,

    seekerProfile: {
      ...current.seekerProfile,

      enabled: false,
    },

    recruiterProfile: {
      ...current.recruiterProfile,

      enabled: true,

      completed: true,

      recruiterType:
        data.recruiterType,

      recruiterLevel:
        data.recruiterLevel,

      recruiterContext:
        data.recruiterContext,

      otherContextDescription:
        data.otherContextDescription,

      recruitmentPurpose:
        data.recruitmentPurpose,

      recruitmentFrequency:
        data.recruitmentFrequency,

      workerCategories:
        data.workerCategories,

      customWorkerCategories:
        data.customWorkerCategories,

      companyName:
        data.companyName,

      industry:
        data.industry,

      companyLocation:
        data.city,

      /*
       * Company verification starts
       * separately when required.
       */
      verificationStatus:
        current.recruiterProfile
          .verificationStatus ??
        "not_started",
    },

    workplace,

    onboardingCompleted:
      true,
  });
}

// ============================================================
// UPDATE SEEKER PROFILE
// ============================================================

export function updateSeekerProfile(
  updates: Partial<
    UserAccount["seekerProfile"]
  >
): UserAccount | null {
  const current =
    getCurrentUser();

  if (!current) {
    return null;
  }

  return updateCurrentUser({
    role: "seeker",

    seekerProfile: {
      ...current.seekerProfile,

      ...updates,

      enabled: true,
    },

    recruiterProfile: {
      ...current.recruiterProfile,

      enabled: false,
    },
  });
}

// ============================================================
// UPDATE RECRUITER PROFILE
// ============================================================

export function updateRecruiterProfile(
  updates: Partial<
    UserAccount["recruiterProfile"]
  >
): UserAccount | null {
  const current =
    getCurrentUser();

  if (!current) {
    return null;
  }

  return updateCurrentUser({
    role: "recruiter",

    seekerProfile: {
      ...current.seekerProfile,

      enabled: false,
    },

    recruiterProfile: {
      ...current.recruiterProfile,

      ...updates,

      enabled: true,
    },
  });
}

// ============================================================
// COMPLETE PROFILE
// ============================================================

export function markSeekerProfileComplete():
  UserAccount | null {
  return updateSeekerProfile({
    completed: true,
  });
}

export function markRecruiterProfileComplete():
  UserAccount | null {
  return updateRecruiterProfile({
    completed: true,
  });
}

// ============================================================
// ADMIN - GET ALL USERS
// ============================================================

export function getAllUsers():
  UserAccount[] {
  return readUsers();
}

// ============================================================
// ADMIN - UPDATE ACCOUNT STATUS
// ============================================================

export function updateUserAccountStatus(
  userId: string,
  status: AccountStatus
): UserAccount | null {
  const users =
    readUsers();

  const index =
    users.findIndex(
      (user) =>
        user.id ===
        userId
    );

  if (
    index === -1
  ) {
    return null;
  }

  users[index].accountStatus =
    status;

  users[index].updatedAt =
    new Date().toISOString();

  writeUsers(users);

  /*
   * If the affected user is currently
   * logged in, update the session too.
   */
  const currentUser =
    getCurrentUser();

  if (
    currentUser &&
    currentUser.id ===
      userId
  ) {
    /*
     * If the account was deactivated or
     * suspended, remove the current session.
     */
    if (
      status !== "ACTIVE"
    ) {
      logoutUser();
    } else {
      localStorage.setItem(
        CURRENT_USER_KEY,
        JSON.stringify(
          users[index]
        )
      );

      notifyAuthUpdate();
    }
  }

  return users[index];
}

// ============================================================
// ADMIN - DELETE USER
// ============================================================

export function deleteUserAccount(
  userId: string
): boolean {
  const users =
    readUsers();

  /*
   * Protect the default administrator.
   */
  if (
    userId ===
    "user-admin-001"
  ) {
    return false;
  }

  const filtered =
    users.filter(
      (user) =>
        user.id !==
        userId
    );

  if (
    filtered.length ===
    users.length
  ) {
    return false;
  }

  writeUsers(filtered);

  const currentUser =
    getCurrentUser();

  if (
    currentUser &&
    currentUser.id ===
      userId
  ) {
    logoutUser();
  }

  return true;
}

export function updateUserSubscriptionInfo(
  userId: string,
  subscription: UserAccount["subscription"]
): UserAccount | null {
  const users =
    readUsers();

  const index =
    users.findIndex(
      (user) =>
        user.id ===
        userId
    );

  if (index === -1) {
    return null;
  }

  const currentUser =
    users[index];

  const updatedUser: UserAccount = {
    ...currentUser,
    subscription:
      subscription ??
      currentUser.subscription,
    isPremium:
      Boolean(
        subscription ||
          currentUser.subscription
      ),
    updatedAt:
      new Date().toISOString(),
  };

  users[index] = updatedUser;
  writeUsers(users);

  const currentSession =
    getCurrentUser();

  if (
    currentSession &&
    currentSession.id ===
      userId
  ) {
    localStorage.setItem(
      CURRENT_USER_KEY,
      JSON.stringify(
        updatedUser
      )
    );
  }

  notifyAuthUpdate();

  return updatedUser;
}

// ============================================================
// SUBSCRIPTION
// ============================================================