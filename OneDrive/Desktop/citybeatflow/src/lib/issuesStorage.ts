import type { Issue } from "@/data/mockData";

const STORAGE_KEY = "citizen-reported-issues";

export type NewIssueInput = {
  title: string;
  description: string;
  category: Issue["category"] | string;
  locationText?: string; // "lat, lng" or address
  locationCoords?: { lat: number; lng: number } | null;
  urgency?: "low" | "medium" | "high";
};

export function getStoredIssues(): Issue[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredIssues(issues: Issue[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
}

export function addNewIssue(input: NewIssueInput): Issue {
  const issues = getStoredIssues();

  const coords = input.locationCoords ?? parseCoords(input.locationText);

  const newIssue: Issue = {
    id: `${Date.now()}`,
    title: input.title,
    description: input.description,
    category: normalizeCategory(input.category),
    status: "pending",
    location: {
      lat: coords?.lat ?? 0,
      lng: coords?.lng ?? 0,
      address: input.locationText || "User provided location",
    },
    reportedBy: "You",
    reportedAt: new Date().toISOString(),
    verificationCount: 0,
    priority: (input.urgency as any) || "medium",
  };

  const next = [newIssue, ...issues];
  saveStoredIssues(next);
  return newIssue;
}

function parseCoords(text?: string): { lat: number; lng: number } | null {
  if (!text) return null;
  const parts = text.split(",").map((s) => parseFloat(s.trim()));
  if (parts.length === 2 && parts.every((n) => Number.isFinite(n))) {
    return { lat: parts[0], lng: parts[1] };
  }
  return null;
}

function normalizeCategory(category: Issue["category"] | string): Issue["category"] {
  const map: Record<string, Issue["category"]> = {
    potholes: "pothole",
    pothole: "pothole",
    streetlights: "streetlight",
    streetlight: "streetlight",
    waste: "trash",
    trash: "trash",
    water: "water",
    utilities: "other",
    construction: "other",
    parks: "other",
    parking: "other",
    other: "other",
  };
  return map[category] ?? "other";
}


