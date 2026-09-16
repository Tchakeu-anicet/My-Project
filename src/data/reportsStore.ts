import type { ReportedContent } from "../types";

const REPORTS_KEY = "jf_reported_content";

function getInitialMockReports(): ReportedContent[] {
  return [
    {
      reportId: "rep-001",
      reporterId: "user-seeker-101",
      reporterName: "Jean Dupont",
      itemType: "job",
      itemId: "job-spam-99",
      itemTitle: "Unrealistic Work From Home - High Yield",
      reason: "Potential fraudulent job offer requesting fee payment upfront.",
      reportedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      status: "PENDING",
    },
    {
      reportId: "rep-002",
      reporterId: "user-recruiter-202",
      reporterName: "InnovCam Inc.",
      itemType: "user",
      itemId: "user-fake-88",
      itemTitle: "Candidate: Paul FakeProfile",
      reason: "Suspicious activity and misleading resume information.",
      reportedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      status: "PENDING",
    },
  ];
}

export function getReportedContents(): ReportedContent[] {
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    if (!raw) return getInitialMockReports();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : getInitialMockReports();
  } catch {
    return getInitialMockReports();
  }
}

export function saveReportedContents(reports: ReportedContent[]): void {
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
}

export function createReport(reportData: {
  reporterId: string;
  reporterName: string;
  itemType: "job" | "user" | "message" | "application";
  itemId: string;
  itemTitle: string;
  reason: string;
}): ReportedContent {
  const reports = getReportedContents();
  const newReport: ReportedContent = {
    reportId: `rep-${Date.now()}`,
    ...reportData,
    reportedAt: new Date().toISOString(),
    status: "PENDING",
  };
  const updated = [newReport, ...reports];
  saveReportedContents(updated);
  return newReport;
}

export function updateReportStatus(
  reportId: string,
  status: "RESOLVED" | "DISMISSED"
): ReportedContent | null {
  const reports = getReportedContents();
  let updated: ReportedContent | null = null;

  const newList = reports.map((r) => {
    if (r.reportId === reportId) {
      updated = { ...r, status };
      return updated;
    }
    return r;
  });

  if (updated) {
    saveReportedContents(newList);
  }
  return updated;
}
