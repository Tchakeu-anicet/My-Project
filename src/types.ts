// ============================================================
// JOBFIND - TYPES
// ============================================================

/* ============================================================
   BASIC USER TYPES
   ============================================================ */

export type Gender =
  | "Male"
  | "Female";

export type UserRole =
  | "seeker"
  | "recruiter"
  | "admin";

/*
 * A user has ONE workplace.
 *
 * Job Seeker OR Recruiter.
 * Admin is handled separately.
 */
export type WorkplaceType =
  | "job-seeker"
  | "recruiter"
  | "admin";

/* ============================================================
   ACCOUNT STATUS
   ============================================================ */

export type AccountStatus =
  | "ACTIVE"
  | "SUSPENDED"
  | "DEACTIVATED";

/* ============================================================
   PREMIUM / SUBSCRIPTION
   ============================================================ */

export type SubscriptionStatus =
  | "ACTIVE"
  | "EXPIRED"
  | "CANCELLED"
  | "PENDING";

export interface UserSubscription {
  id?: string;

  plan?:
    | "FREE"
    | "PREMIUM";

  planName?: string;

  status: SubscriptionStatus;

  startDate: string;

  endDate: string;

  amount: number;

  currency: string;

  campayPhone?: string;

  reference?: string;

  increasedVisibility?: boolean;
}

/* ============================================================
   JOB SEEKER TYPES
   ============================================================ */

export type SeekerWorkType =
  | "side-hustles"
  | "contract"
  | "freelance"
  | "gigs"
  | "full-time"
  | "part-time"
  | "temporary"
  | "remote"
  | "local-services"
  | "other";

export interface JobCategoryPreference {
  id: string;

  name: string;

  source:
    | "predefined"
    | "custom";
}

export type WorkerAvailability =
  | "available"
  | "busy"
  | "unavailable";

export interface SeekerProfile {
  enabled: boolean;

  completed: boolean;

  jobCategories:
    JobCategoryPreference[];

  workTypes:
    SeekerWorkType[];

  customJobCategories:
    string[];

  location?: string;

  availability?:
    WorkerAvailability;

  experience?: string;

  skills?: string[];

  services?: string[];

  headline?: string;

  bio?: string;

  hourlyRate?: string;

  phone?: string;

  profilePhoto?: string;
}

/* ============================================================
   RECRUITER TYPES
   ============================================================ */

export type RecruiterType =
  | "individual"
  | "company"
  | "agency"
  | "organization"
  | "other";

export type RecruiterLevel =
  | "solo"
  | "micro"
  | "small"
  | "medium"
  | "large"
  | "enterprise"
  | "not_applicable";

export type RecruiterContext =
  | "solo_entrepreneur"
  | "micro_employer"
  | "private_household_employer"
  | "contractor"
  | "freelance_recruiter"
  | "individual_employer"
  | "company_representative"
  | "other";

export type RecruitmentFrequency =
  | "one_time"
  | "occasional"
  | "few_times_year"
  | "monthly"
  | "frequent"
  | "continuous";

export type RecruitmentPurpose =
  | "quick_task"
  | "home_service"
  | "temporary_help"
  | "side_hustle"
  | "professional_recruitment"
  | "long_term_staff"
  | "contractors"
  | "freelancers"
  | "other";

export interface RecruitmentCategoryPreference {
  id: string;

  name: string;

  source:
    | "predefined"
    | "custom";
}

export type VerificationStatus =
  | "not_started"
  | "pending"
  | "verified"
  | "rejected";

export interface RecruiterProfile {
  enabled: boolean;

  completed: boolean;

  recruiterType?:
    RecruiterType;

  recruiterLevel?:
    RecruiterLevel;

  recruiterContext?:
    RecruiterContext;

  otherContextDescription?: string;

  recruitmentPurpose?:
    RecruitmentPurpose;

  recruitmentFrequency?:
    RecruitmentFrequency;

  workerCategories:
    RecruitmentCategoryPreference[];

  customWorkerCategories:
    string[];

  companyName?: string;

  companyDescription?: string;

  companyLocation?: string;

  industry?: string;

  website?: string;

  phone?: string;

  position?: string;

  profilePhoto?: string;

  verificationStatus?:
    VerificationStatus;
}

/* ============================================================
   ADMIN
   ============================================================ */

export interface AdminProfile {
  adminID: string;

  department: string;

  permissions: string[];
}

/* ============================================================
   WORKPLACE
   ============================================================ */

export interface Workplace {
  id: string;

  type: WorkplaceType;

  name: string;

  description: string;

  createdAt: string;

  active: boolean;
}

/* ============================================================
   USER ACCOUNT
   ============================================================ */

export interface UserAccount {
  id: string;

  fullName: string;

  email: string;

  password: string;

  gender: Gender;

  phone?: string;

  city: string;

  /*
   * Job seeker, recruiter or administrator.
   */
  role: UserRole;

  /*
   * Account state.
   */
  accountStatus: AccountStatus;

  /*
   * Premium information.
   */
  isPremium: boolean;

  subscription?: UserSubscription;

  /*
   * EMAIL AUTHENTICATION
   *
   * false = account has not verified email
   * true  = email has been verified
   */
  emailVerified?: boolean;

  /*
   * Temporary verification token.
   */
  emailVerificationToken?:
    string;

  /*
   * Verification token expiration.
   */
  emailVerificationExpiresAt?:
    string;

  emailVerificationCode?:
    string;

  passwordResetCode?:
    string;

  passwordResetExpiresAt?:
    string;

  /*
   * Job seeker profile.
   */
  seekerProfile:
    SeekerProfile;

  /*
   * Recruiter profile.
   */
  recruiterProfile:
    RecruiterProfile;

  /*
   * Administrator profile.
   */
  adminProfile?:
    AdminProfile;

  /*
   * User's current workplace.
   */
  workplace?: Workplace;

  /*
   * Onboarding status.
   */
  onboardingCompleted: boolean;

  createdAt: string;

  updatedAt: string;
}