import { seedLawyers } from "../data/seedLawyers";
import type {
  ConnectionStatus,
  LawyerProfile,
  NetworkFilters,
} from "../models/Lawyer";
import { matchesFilters } from "../models/Lawyer";
import type { User } from "../models/User";
import { DEMO_USER_ID } from "./AuthService";
import { StorageService } from "./StorageService";

const DIRECTORY_KEY = "lexora_network_directory";
const CONNECTIONS_KEY_PREFIX = "lexora_network_connections_";
const ACCOUNTS_KEY = "lexora_accounts";

type ConnectionsMap = Record<string, ConnectionStatus>;

const SEED_CONNECTIONS: ConnectionsMap = {
  "lw-01": "connected",
  "lw-04": "connected",
  "lw-08": "connected",
  "lw-06": "pending-incoming",
  "lw-09": "pending-outgoing",
};

export class NetworkService {
  private directoryStorage: StorageService<LawyerProfile[]>;
  private accountsStorage: StorageService<User[]>;

  constructor() {
    this.directoryStorage = new StorageService<LawyerProfile[]>(DIRECTORY_KEY);
    this.accountsStorage = new StorageService<User[]>(ACCOUNTS_KEY);
  }

  // Svaki nalog ima sopstvenu mapu veza (ko sam ja povezan/pozvan) — bez ovoga
  // bi zahtev poslat sa naloga A bio nevidljiv nalogu B jer bi delili isti globalni zapis.
  private connectionsStorageFor(userId: string): StorageService<ConnectionsMap> {
    return new StorageService<ConnectionsMap>(`${CONNECTIONS_KEY_PREFIX}${userId}`);
  }

  seedIfEmpty(currentUserId?: string): void {
    const existing = this.directoryStorage.get();
    if (!existing || existing.length === 0) {
      this.directoryStorage.set(seedLawyers);
    }
    if (!currentUserId) return;
    const connectionsStorage = this.connectionsStorageFor(currentUserId);
    const existingConnections = connectionsStorage.get();
    if (!existingConnections) {
      connectionsStorage.set(currentUserId === DEMO_USER_ID ? SEED_CONNECTIONS : {});
    }
  }

  private mapUserToLawyer(user: User): LawyerProfile {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      headline: user.headline,
      practiceArea: user.practiceArea ?? "",
      city: user.city ?? "",
      connectionLevel: 2,
      mutualConnections: 0,
      avatarInitials: user.avatarInitials,
      about: user.bio,
      licenseVerified: user.licenseVerified,
      experience: user.experience,
      education: user.education,
      skills: user.skills,
      openToCollaboration: user.openToCollaboration,
      recommendations: user.recommendations,
    };
  }

  // Stvarno registrovani nalozi (uključujući demo nalog) — odvojeni od
  // seed direktorijuma, ali moraju biti vidljivi u pretrazi i predlozima.
  private getRegisteredLawyers(): LawyerProfile[] {
    const accounts = this.accountsStorage.get() ?? [];
    return accounts.map((account) => this.mapUserToLawyer(account));
  }

  private getAllLawyers(): LawyerProfile[] {
    return [...(this.directoryStorage.get() ?? []), ...this.getRegisteredLawyers()];
  }

  getDirectory(filters?: NetworkFilters, excludeUserId?: string): LawyerProfile[] {
    const lawyers = excludeUserId
      ? this.getAllLawyers().filter((lawyer) => lawyer.id !== excludeUserId)
      : this.getAllLawyers();
    if (!filters) return lawyers;
    return lawyers.filter((lawyer) => matchesFilters(lawyer, filters));
  }

  getById(id: string): LawyerProfile | null {
    return this.getAllLawyers().find((lawyer) => lawyer.id === id) ?? null;
  }

  getConnectionStatus(lawyerId: string, currentUserId: string): ConnectionStatus {
    const connections = this.connectionsStorageFor(currentUserId).get() ?? {};
    return connections[lawyerId] ?? "none";
  }

  getPendingIncoming(currentUserId: string): LawyerProfile[] {
    const connections = this.connectionsStorageFor(currentUserId).get() ?? {};
    return this.getAllLawyers().filter(
      (lawyer) => connections[lawyer.id] === "pending-incoming",
    );
  }

  connectedCount(currentUserId: string): number {
    const connections = this.connectionsStorageFor(currentUserId).get() ?? {};
    return Object.values(connections).filter((status) => status === "connected")
      .length;
  }

  // Upisuje status na obe strane — bez recipročnog upisa druga strana
  // nikad ne bi videla pozivnicu/prihvatanje kada se uloguje na svoj nalog.
  private setStatusBothSides(
    currentUserId: string,
    lawyerId: string,
    myStatus: ConnectionStatus,
    theirStatus: ConnectionStatus,
  ): void {
    const mine = this.connectionsStorageFor(currentUserId);
    const mineMap = mine.get() ?? {};
    mineMap[lawyerId] = myStatus;
    mine.set(mineMap);

    const theirs = this.connectionsStorageFor(lawyerId);
    const theirsMap = theirs.get() ?? {};
    theirsMap[currentUserId] = theirStatus;
    theirs.set(theirsMap);
  }

  sendRequest(lawyerId: string, currentUserId: string): void {
    this.setStatusBothSides(currentUserId, lawyerId, "pending-outgoing", "pending-incoming");
  }

  accept(lawyerId: string, currentUserId: string): void {
    this.setStatusBothSides(currentUserId, lawyerId, "connected", "connected");
  }

  decline(lawyerId: string, currentUserId: string): void {
    this.setStatusBothSides(currentUserId, lawyerId, "none", "none");
  }
}
