import type { IAuthService } from "../models/interfaces";
import type { RegisterInput, User } from "../models/User";
import { getInitials } from "../models/User";
import { StorageService } from "./StorageService";

interface StoredAccount extends User {
  passwordHash: string;
}

const ACCOUNTS_KEY = "lexora_accounts";
const SESSION_KEY = "lexora_session";
const DEMO_EMAIL = "ana.kovacevic@advokat.rs";
const DEMO_PASSWORD = "lexora123";
export const DEMO_USER_ID = "user-demo-ana";

async function hashPassword(password: string): Promise<string> {
  const encoded = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function stripPassword(account: StoredAccount): User {
  const { passwordHash: _passwordHash, ...user } = account;
  return user;
}

export class AuthService implements IAuthService {
  private accountsStorage: StorageService<StoredAccount[]>;
  private sessionStorage: StorageService<string>;

  constructor() {
    this.accountsStorage = new StorageService<StoredAccount[]>(ACCOUNTS_KEY);
    this.sessionStorage = new StorageService<string>(SESSION_KEY);
  }

  async register(input: RegisterInput): Promise<User> {
    const accounts = this.accountsStorage.get() ?? [];
    const emailTaken = accounts.some(
      (account) => account.email.toLowerCase() === input.email.toLowerCase(),
    );
    if (emailTaken) {
      throw new Error("Nalog sa ovom email adresom već postoji.");
    }

    const passwordHash = await hashPassword(input.password);
    const account: StoredAccount = {
      id: crypto.randomUUID(),
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      role: input.role,
      barNumber: input.barNumber,
      practiceArea: input.practiceArea,
      city: input.city,
      headline:
        input.role === "advokat"
          ? `Advokat${input.practiceArea ? ` · ${input.practiceArea}` : ""}`
          : "Klijent",
      bio: "",
      avatarInitials: getInitials(input.firstName, input.lastName),
      licenseVerified: false,
      createdAt: new Date().toISOString(),
      passwordHash,
    };

    accounts.push(account);
    this.accountsStorage.set(accounts);
    this.sessionStorage.set(account.id);
    return stripPassword(account);
  }

  async login(email: string, password: string): Promise<User> {
    const accounts = this.accountsStorage.get() ?? [];
    const passwordHash = await hashPassword(password);
    const account = accounts.find(
      (candidate) =>
        candidate.email.toLowerCase() === email.toLowerCase() &&
        candidate.passwordHash === passwordHash,
    );
    if (!account) {
      throw new Error("Pogrešan email ili lozinka.");
    }
    this.sessionStorage.set(account.id);
    return stripPassword(account);
  }

  logout(): void {
    this.sessionStorage.remove();
  }

  getCurrentUser(): User | null {
    const userId = this.sessionStorage.get();
    if (!userId) return null;
    const accounts = this.accountsStorage.get() ?? [];
    const account = accounts.find((candidate) => candidate.id === userId);
    return account ? stripPassword(account) : null;
  }

  updateUser(id: string, patch: Partial<User>): User | null {
    const accounts = this.accountsStorage.get() ?? [];
    const index = accounts.findIndex((candidate) => candidate.id === id);
    if (index === -1) return null;
    const updated: StoredAccount = { ...accounts[index], ...patch };
    accounts[index] = updated;
    this.accountsStorage.set(accounts);
    return stripPassword(updated);
  }

  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const accounts = this.accountsStorage.get() ?? [];
    const index = accounts.findIndex((candidate) => candidate.id === id);
    if (index === -1) {
      throw new Error("Nalog nije pronađen.");
    }

    const currentHash = await hashPassword(currentPassword);
    if (accounts[index].passwordHash !== currentHash) {
      throw new Error("Trenutna lozinka nije tačna.");
    }

    accounts[index] = {
      ...accounts[index],
      passwordHash: await hashPassword(newPassword),
    };
    this.accountsStorage.set(accounts);
  }

  async seedDemoAccount(): Promise<void> {
    const accounts = this.accountsStorage.get() ?? [];
    const exists = accounts.some(
      (account) => account.email.toLowerCase() === DEMO_EMAIL,
    );
    if (exists) return;

    const passwordHash = await hashPassword(DEMO_PASSWORD);
    const demoAccount: StoredAccount = {
      id: DEMO_USER_ID,
      firstName: "Ana",
      lastName: "Kovačević",
      email: DEMO_EMAIL,
      role: "advokat",
      barNumber: "AK-2014-0472",
      practiceArea: "Porodično i nasledno pravo",
      city: "Beograd",
      headline: "Advokat · Porodično i nasledno pravo · Medijator",
      bio:
        "Advokatica sa deset godina iskustva u porodičnom i naslednom pravu. " +
        "Sertifikovani medijator posvećena mirnom rešavanju sporova.",
      avatarInitials: "AK",
      licenseVerified: true,
      createdAt: new Date().toISOString(),
      passwordHash,
    };
    accounts.push(demoAccount);
    this.accountsStorage.set(accounts);
  }
}
