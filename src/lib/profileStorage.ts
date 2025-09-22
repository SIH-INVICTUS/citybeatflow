export type UserProfile = {
  fullName: string;
  email: string;
  phone: string;
  gender: "male" | "female" | "other" | "prefer-not-to-say" | "";
  dateOfBirth: string; // ISO date
};

const PROFILE_KEY = "citizen-user-profile";

export function getProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return { fullName: "", email: "", phone: "", gender: "", dateOfBirth: "" };
    const parsed = JSON.parse(raw);
    return {
      fullName: parsed.fullName || "",
      email: parsed.email || "",
      phone: parsed.phone || "",
      gender: parsed.gender || "",
      dateOfBirth: parsed.dateOfBirth || "",
    };
  } catch {
    return { fullName: "", email: "", phone: "", gender: "", dateOfBirth: "" };
  }
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function clearProfile(): void {
  localStorage.removeItem(PROFILE_KEY);
}


