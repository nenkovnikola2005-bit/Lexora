import type { IAuthService } from "../models/interfaces";
import type { RegisterInput, User } from "../models/User";
import { ROLE_LABELS, getInitials } from "../models/User";
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
      headline: `${ROLE_LABELS[input.role]}${input.practiceArea ? ` · ${input.practiceArea}` : ""}`,
      bio: "",
      avatarInitials: getInitials(input.firstName, input.lastName),
      licenseVerified: false,
      experience: [],
      education: [],
      skills: [],
      createdAt: new Date().toISOString(),
      passwordChangedAt: new Date().toISOString(),
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
      passwordChangedAt: new Date().toISOString(),
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
      experience: [
        {
          role: "Advokatica, osnivačica",
          organization: "Advokatska kancelarija Kovačević",
          period: "2018–danas",
        },
        {
          role: "Advokatski pripravnik",
          organization: "AK Marković i partneri",
          period: "2014–2018",
        },
      ],
      education: [
        {
          school: "Pravni fakultet Univerziteta u Beogradu",
          degree: "Diplomirani pravnik",
          period: "2009–2013",
        },
      ],
      skills: ["Porodično pravo", "Nasledno pravo", "Medijacija"],
      openToCollaboration: {
        enabled: true,
        note: "Zajedničko zastupanje · Medijacija · Konsultacije za kolege iz drugih gradova",
      },
      recommendations: [
        {
          id: "rec-1",
          authorName: "Sanja Popović",
          authorInitials: "SP",
          authorHeadline: "Advokat i medijator · saradnja na 4 predmeta",
          text:
            "Ana ulazi u predmet sa idejom da ga zatvori, ne da ga produži. U dva zajednička " +
            "slučaja iz prošle godine sporazum je postignut pre prvog ročišta.",
        },
        {
          id: "rec-2",
          authorName: "Marija Ilić",
          authorInitials: "MI",
          authorHeadline: "Advokat · koleginica iz kancelarije Ristić i partneri",
          text:
            "Radile smo zajedno dve godine. Pripremu predmeta uvek ostavlja u stanju da ga " +
            "bilo ko može preuzeti — retka osobina.",
        },
      ],
      createdAt: new Date().toISOString(),
      passwordChangedAt: "2026-05-10T09:00:00.000Z",
      passwordHash,
    };
    accounts.push(demoAccount);
    this.accountsStorage.set(accounts);
  }
}
