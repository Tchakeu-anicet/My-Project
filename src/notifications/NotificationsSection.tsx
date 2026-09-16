import {
  useEffect,
  useState,
  type JSX,
} from "react";

import type {
  UserRole,
} from "../types";

import "./NotificationsSection.css";

interface NotificationItem {
  id: string;

  title: string;

  message: string;

  type:
    | "success"
    | "rejected"
    | "info";

  createdAt: string;

  read: boolean;
}

const NOTIFICATION_KEY =
  "jf_notifications";

const defaultRecruiterNotifications:
  NotificationItem[] = [
    {
      id: "demo-r1",
      title:
        "New application received",
      message:
        "A job seeker applied for one of your published jobs.",
      type: "info",
      createdAt:
        new Date(
          Date.now() -
            2 *
              60 *
              60 *
              1000
        ).toISOString(),
      read: false,
    },
    {
      id: "demo-r2",
      title:
        "Candidate viewed your posting",
      message:
        "Your job posting is getting attention.",
      type: "info",
      createdAt:
        new Date(
          Date.now() -
            5 *
              60 *
              60 *
              1000
        ).toISOString(),
      read: true,
    },
  ];

const defaultSeekerNotifications:
  NotificationItem[] = [
    {
      id: "demo-s1",
      title:
        "New job recommendation",
      message:
        "A new opportunity may match your profile.",
      type: "info",
      createdAt:
        new Date(
          Date.now() -
            2 *
              60 *
              60 *
              1000
        ).toISOString(),
      read: false,
    },
    {
      id: "demo-s2",
      title:
        "Profile reminder",
      message:
        "Keep your profile updated to improve your opportunities.",
      type: "info",
      createdAt:
        new Date(
          Date.now() -
            5 *
              60 *
              60 *
              1000
        ).toISOString(),
      read: true,
    },
  ];

function loadNotifications():
  NotificationItem[] {
  try {
    const saved =
      localStorage.getItem(
        NOTIFICATION_KEY
      );

    if (!saved) {
      return [];
    }

    const parsed: unknown =
      JSON.parse(saved);

    return Array.isArray(parsed)
      ? (parsed as NotificationItem[])
      : [];
  } catch {
    return [];
  }
}

function saveNotifications(
  items: NotificationItem[]
): void {
  localStorage.setItem(
    NOTIFICATION_KEY,
    JSON.stringify(items)
  );
}

function formatTime(
  dateString: string
): string {
  const date =
    new Date(dateString);

  const now =
    new Date();

  const minutes =
    Math.max(
      0,
      Math.floor(
        (now.getTime() -
          date.getTime()) /
          60000
      )
    );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  if (hours < 24) {
    return `${hours} hour${
      hours === 1
        ? ""
        : "s"
    } ago`;
  }

  const days =
    Math.floor(
      hours / 24
    );

  if (days === 1) {
    return "Yesterday";
  }

  return date.toLocaleDateString();
}

export default function NotificationsSection({
  role,
}: {
  role: UserRole;
}): JSX.Element {
  const recruiter =
    role === "recruiter";

  const [
    notifications,
    setNotifications,
  ] =
    useState<
      NotificationItem[]
    >(() =>
      loadNotifications()
    );

  const refresh = (): void => {
    setNotifications(
      loadNotifications()
    );
  };

  useEffect(() => {
    refresh();

    window.addEventListener(
      "jf-notifications-updated",
      refresh
    );

    return () => {
      window.removeEventListener(
        "jf-notifications-updated",
        refresh
      );
    };
  }, []);

  const visibleNotifications =
    notifications.length > 0
      ? notifications
      : recruiter
      ? defaultRecruiterNotifications
      : defaultSeekerNotifications;

  const unreadCount =
    visibleNotifications.filter(
      (notification) =>
        !notification.read
    ).length;

  const markAsRead = (
    id: string
  ): void => {
    const updated =
      notifications.map(
        (notification) =>
          notification.id === id
            ? {
                ...notification,
                read: true,
              }
            : notification
      );

    saveNotifications(
      updated
    );

    setNotifications(
      updated
    );

    window.dispatchEvent(
      new Event(
        "jf-notifications-updated"
      )
    );
  };

  const markAllAsRead =
    (): void => {
      const updated =
        notifications.map(
          (notification) => ({
            ...notification,
            read: true,
          })
        );

      saveNotifications(
        updated
      );

      setNotifications(
        updated
      );

      window.dispatchEvent(
        new Event(
          "jf-notifications-updated"
        )
      );
    };

  const clearNotifications =
    (): void => {
      saveNotifications([]);

      setNotifications([]);

      window.dispatchEvent(
        new Event(
          "jf-notifications-updated"
        )
      );
    };

  return (
    <section className="notifications-page">

      <div className="notifications-header">

        <div>
          <span className="notifications-kicker">
            JOBFIND /{" "}
            {recruiter
              ? "RECRUITER"
              : "JOB SEEKER"}
          </span>

          <h2>
            Notifications
          </h2>

          <p>
            {recruiter
              ? "Stay informed about applications and recruitment activity."
              : "Stay informed about your applications and job search activity."}
          </p>
        </div>

        <div className="notifications-header-actions">

          <span className="notifications-count">
            {unreadCount} unread
          </span>

          {notifications.length >
            0 && (
            <>
              <button
                type="button"
                onClick={
                  markAllAsRead
                }
              >
                Mark all as read
              </button>

              <button
                type="button"
                onClick={
                  clearNotifications
                }
              >
                Clear
              </button>
            </>
          )}

        </div>
      </div>

      <div className="notifications-list">

        {visibleNotifications.map(
          (notification) => (
            <article
              key={
                notification.id
              }
              className={`notification-card ${
                notification.read
                  ? "read"
                  : "unread"
              } ${
                notification.type
              }`}
              onClick={() => {
                if (
                  !notification.read &&
                  notifications.length >
                    0
                ) {
                  markAsRead(
                    notification.id
                  );
                }
              }}
            >

              <div className="notification-icon">
                {notification.type ===
                "success"
                  ? "✓"
                  : notification.type ===
                    "rejected"
                  ? "×"
                  : "🔔"}
              </div>

              <div className="notification-content">

                <div className="notification-title-row">

                  <strong>
                    {
                      notification.title
                    }
                  </strong>

                  {!notification.read && (
                    <span className="notification-new">
                      NEW
                    </span>
                  )}

                </div>

                <p>
                  {
                    notification.message
                  }
                </p>

                <small>
                  {formatTime(
                    notification.createdAt
                  )}
                </small>

              </div>

              {!notification.read && (
                <span className="notification-dot" />
              )}

            </article>
          )
        )}

      </div>

    </section>
  );
}