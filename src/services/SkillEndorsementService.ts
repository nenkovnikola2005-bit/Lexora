import { seedSkillEndorsements } from "../data/seedSkillEndorsements";
import { StorageService } from "./StorageService";

const ENDORSEMENTS_KEY = "lexora_skill_endorsements";

type EndorsementMap = Record<string, string[]>;

function buildKey(lawyerId: string, skill: string): string {
  return `${lawyerId}::${skill}`;
}

export class SkillEndorsementService {
  private storage: StorageService<EndorsementMap>;

  constructor() {
    this.storage = new StorageService<EndorsementMap>(ENDORSEMENTS_KEY);
  }

  seedIfEmpty(): void {
    const existing = this.storage.get();
    if (!existing) {
      this.storage.set(seedSkillEndorsements);
    }
  }

  getEndorsers(lawyerId: string, skill: string): string[] {
    const map = this.storage.get() ?? {};
    return map[buildKey(lawyerId, skill)] ?? [];
  }

  hasEndorsed(lawyerId: string, skill: string, userId: string): boolean {
    return this.getEndorsers(lawyerId, skill).includes(userId);
  }

  toggleEndorse(lawyerId: string, skill: string, userId: string): void {
    const map = this.storage.get() ?? {};
    const key = buildKey(lawyerId, skill);
    const endorsers = map[key] ?? [];
    map[key] = endorsers.includes(userId)
      ? endorsers.filter((id) => id !== userId)
      : [...endorsers, userId];
    this.storage.set(map);
  }
}
