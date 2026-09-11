import { seedLawyers } from "../data/seedLawyers";
import type {
  ConnectionStatus,
  LawyerProfile,
  NetworkFilters,
} from "../models/Lawyer";
import { matchesFilters } from "../models/Lawyer";
import { StorageService } from "./StorageService";

const DIRECTORY_KEY = "lexora_network_directory";
const CONNECTIONS_KEY = "lexora_network_connections";

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

  constructor() {
    this.directoryStorage = new StorageService<LawyerProfile[]>(DIRECTORY_KEY);
    this.connectionsStorage = new StorageService<ConnectionsMap>(CONNECTIONS_KEY);
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

  getDirectory(filters?: NetworkFilters): LawyerProfile[] {
    const lawyers = this.directoryStorage.get() ?? [];
    if (!filters) return lawyers;
    return lawyers.filter((lawyer) => matchesFilters(lawyer, filters));
  }

  getById(id: string): LawyerProfile | null {
    const lawyers = this.directoryStorage.get() ?? [];
    return lawyers.find((lawyer) => lawyer.id === id) ?? null;
  }

  getConnectionStatus(lawyerId: string): ConnectionStatus {
    const connections = this.connectionsStorage.get() ?? {};
    return connections[lawyerId] ?? "none";
  }

  getPendingIncoming(): LawyerProfile[] {
    const connections = this.connectionsStorage.get() ?? {};
    const lawyers = this.directoryStorage.get() ?? [];
    return lawyers.filter((lawyer) => connections[lawyer.id] === "pending-incoming");
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
