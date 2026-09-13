import type { Education, Experience } from "./Lawyer";

export type UserRole = "advokat" | "klijent";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  barNumber?: string;
  practiceArea?: string;
  city?: string;
  headline: string;
  bio: string;
  avatarInitials: string;
  licenseVerified: boolean;
  experience: Experience[];
  education: Education[];
  skills: string[];
  createdAt: string;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  barNumber?: string;
  practiceArea?: string;
  city?: string;
}

export function fullName(user: User): string {
  return `${user.firstName} ${user.lastName}`;
}

export function getInitials(firstName: string, lastName: string): string {
  const first = firstName.trim().charAt(0).toUpperCase();
  const last = lastName.trim().charAt(0).toUpperCase();
  return `${first}${last}`;
}
