export type ConnectionLevel = 1 | 2 | 3;

export type ConnectionStatus =
  | "none"
  | "pending-outgoing"
  | "pending-incoming"
  | "connected";

export interface Experience {
  role: string;
  organization: string;
  period: string;
}

export interface Education {
  school: string;
  degree: string;
  period: string;
}

export interface LawyerProfile {
  id: string;
  firstName: string;
  lastName: string;
  headline: string;
  practiceArea: string;
  city: string;
  connectionLevel: ConnectionLevel;
  mutualConnections: number;
  avatarInitials: string;
  about: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
}

export interface NetworkFilters {
  levels: ConnectionLevel[];
  practiceAreas: string[];
  city: string;
  onlyMutual: boolean;
}

export function matchesFilters(
  lawyer: LawyerProfile,
  filters: NetworkFilters,
): boolean {
  if (filters.levels.length > 0 && !filters.levels.includes(lawyer.connectionLevel)) {
    return false;
  }
  if (
    filters.practiceAreas.length > 0 &&
    !filters.practiceAreas.includes(lawyer.practiceArea)
  ) {
    return false;
  }
  if (filters.city && lawyer.city !== filters.city) {
    return false;
  }
  if (filters.onlyMutual && lawyer.mutualConnections === 0) {
    return false;
  }
  return true;
}
