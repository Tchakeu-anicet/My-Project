import type { JobApplication } from "../jobs/JobsSection";

const APPLICATIONS_KEY = "jf_applications";

export interface StoredNotification {
  id: string;
  applicationId: string;
  jobId: string;
  title: string;
  message: string;
  type: "application" | "validated" | "rejected";
  createdAt: string;
  read: boolean;
}

const NOTIFICATIONS_KEY = "jf_notifications";

/* =========================================================
   APPLICATIONS
========================================================= */

export function getApplications(): JobApplication[] {
  try {
    const stored = localStorage.getItem(APPLICATIONS_KEY);

    if (!stored) {
      return [];
    }

    return JSON.parse(stored) as JobApplication[];
  } catch {
    return [];
  }
}


export function saveApplications(
  applications: JobApplication[]
): void {
  localStorage.setItem(
    APPLICATIONS_KEY,
    JSON.stringify(applications)
  );
}


export function createApplication(
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    salary: string;
  }
): JobApplication | null {

  const applications = getApplications();

  const alreadyApplied = applications.some(
    application => application.jobId === job.id
  );

  if (alreadyApplied) {
    return null;
  }

  const application: JobApplication = {
    id: `application-${Date.now()}`,
    jobId: job.id,
    jobTitle: job.title,
    company: job.company,
    location: job.location,
    salary: job.salary,
    appliedAt: new Date().toISOString(),
    status: "pending",
  };

  saveApplications([
    ...applications,
    application,
  ]);

  return application;
}


/* =========================================================
   UPDATE APPLICATION STATUS
========================================================= */

export function updateApplicationStatus(
  applicationId: string,
  status: "validated" | "rejected"
): JobApplication | null {

  const applications = getApplications();

  let updatedApplication: JobApplication | null = null;

  const updatedApplications = applications.map(
    application => {

      if (application.id !== applicationId) {
        return application;
      }

      updatedApplication = {
        ...application,
        status,
      };

      return updatedApplication;
    }
  );

  if (!updatedApplication) {
    return null;
  }

  saveApplications(updatedApplications);

  return updatedApplication;
}


/* =========================================================
   NOTIFICATIONS
========================================================= */

export function getNotifications(): StoredNotification[] {
  try {
    const stored = localStorage.getItem(
      NOTIFICATIONS_KEY
    );

    if (!stored) {
      return [];
    }

    return JSON.parse(
      stored
    ) as StoredNotification[];

  } catch {
    return [];
  }
}


function saveNotifications(
  notifications: StoredNotification[]
): void {
  localStorage.setItem(
    NOTIFICATIONS_KEY,
    JSON.stringify(notifications)
  );
}


/* =========================================================
   CREATE APPLICATION NOTIFICATION
========================================================= */

export function createApplicationNotification(
  application: JobApplication
): void {

  const notifications = getNotifications();

  const status = application.status;

  let title = "";
  let message = "";
  let type: StoredNotification["type"];

  if (status === "validated") {

    title = "Application validated";
    message =
      `Your application for ${application.jobTitle} at ${application.company} has been validated.`;

    type = "validated";

  } else {

    title = "Application rejected";
    message =
      `Your application for ${application.jobTitle} at ${application.company} has been rejected.`;

    type = "rejected";
  }

  const notification: StoredNotification = {
    id: `notification-${Date.now()}`,
    applicationId: application.id,
    jobId: application.jobId,
    title,
    message,
    type,
    createdAt: new Date().toISOString(),
    read: false,
  };

  saveNotifications([
    notification,
    ...notifications,
  ]);
}