export type UserRole =
  | "seeker"
  | "recruiter";

export type Gender =
  | "Male"
  | "Female";

export type RecruiterType =
  | "company"
  | "individual";

export type ProfileType =
  | "worker"
  | "recruiter";

export type VerificationStatus =
  | "not_started"
  | "pending"
  | "verified"
  | "rejected";

export type WorkerAvailability =
  | "available"
  | "busy"
  | "unavailable";

/* Recruiter activity/context */
export type RecruiterContext =
  | "solo_entrepreneur"
  | "micro_employer"
  | "private_household_employer"
  | "contractor"
  | "freelance_recruiter"
  | "individual_employer"
  | "company_representative"
  | "other";

/* How frequently the recruiter hires */
export type RecruitmentFrequency =
  | "occasional"
  | "few_times_year"
  | "monthly"
  | "frequent"
  | "continuous";

export interface WorkerProfile {
  id?: string;
  enabled: boolean;

  headline?: string;
  bio?: string;

  skills?: string[];
  services?: string[];

  location?: string;

  availability?: WorkerAvailability;

  hourlyRate?: string;
  experience?: string;
  phone?: string;
  profilePhoto?: string;

  completed?: boolean;

  createdAt?: string;
  updatedAt?: string;
}

export interface RecruiterProfile {
  id?: string;
  enabled: boolean;

  recruiterType?: RecruiterType;

  recruiterContext?: RecruiterContext;

  otherContextDescription?: string;

  recruitmentFrequency?: RecruitmentFrequency;

  jobTypes?: string[];

  companyName?: string;
  companyDescription?: string;
  companyLocation?: string;
  industry?: string;
  website?: string;
  phone?: string;
  position?: string;
  profilePhoto?: string;

  verificationStatus?: VerificationStatus;

  completed?: boolean;

  createdAt?: string;
  updatedAt?: string;
}

export interface UserAccount {
  id: string;

  fullName: string;
  email: string;
  password: string;

  role: UserRole;

  gender?: Gender;
  phone?: string;
  city?: string;

  workerProfile: WorkerProfile;
  recruiterProfile: RecruiterProfile;

  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  authenticated: boolean;
  user: UserAccount | null;
}