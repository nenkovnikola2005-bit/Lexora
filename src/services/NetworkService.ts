import { seedLawyers } from "../data/seedLawyers";
import type {
  ConnectionStatus,
  LawyerProfile,
  NetworkFilters,
} from "../models/Lawyer";
import { matchesFilters } from "../models/Lawyer";
import type { User } from "../models/User";
import { StorageService } from "./StorageService";

const DIRECTORY_KEY = "lexora_network_directory";
const CONNECTIONS_KEY = "lexora_network_connections";
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
  private connectionsStorage: StorageService<ConnectionsMap>;
  private accountsStorage: StorageService<User[]>;

  constructor() {
    this.directoryStorage = new StorageService<LawyerProfile[]>(DIRECTORY_KEY);
    this.connectionsStorage = new StorageService<ConnectionsMap>(CONNECTIONS_KEY);
    this.accountsStorage = new StorageService<User[]>(ACCOUNTS_KEY);
  }

  seedIfEmpty(): void {
    const existing = this.directoryStorage.get();
    if (!existing || existing.length === 0) {
      this.directoryStorage.set(seedLawyers);
    }
    const existingConnections = this.connectionsStorage.get();
    if (!existingConnections) {
      this.connectionsStorage.set(SEED_CONNECTIONS);
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

  getConnectionStatus(lawyerId: string): ConnectionStatus {
    const connections = this.connectionsStorage.get() ?? {};
    return connections[lawyerId] ?? "none";
  }

  getPendingIncoming(): LawyerProfile[] {
    const connections = this.connectionsStorage.get() ?? {};
    return this.getAllLawyers().filter(
      (lawyer) => connections[lawyer.id] === "pending-incoming",
    );
  }

  connectedCount(): number {
    const connections = this.connectionsStorage.get() ?? {};
    return Object.values(connections).filter((status) => status === "connected")
      .length;
  }

  sendRequest(lawyerId: string): void {
    const connections = this.connectionsStorage.get() ?? {};
    connections[lawyerId] = "pending-outgoing";
    this.connectionsStorage.set(connections);
  }

  accept(lawyerId: string): void {
    const connections = this.connectionsStorage.get() ?? {};
    connections[lawyerId] = "connected";
    this.connectionsStorage.set(connections);
  }

  decline(lawyerId: string): void {
    const connections = this.connectionsStorage.get() ?? {};
    connections[lawyerId] = "none";
    this.connectionsStorage.set(connections);
  }
}
