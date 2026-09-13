import { seedGroups } from "../data/seedGroups";
import type { Group } from "../models/Group";
import { StorageService } from "./StorageService";

const GROUPS_KEY = "lexora_groups";
const MEMBERSHIPS_KEY = "lexora_group_memberships";

export interface GroupWithMembership extends Group {
  isJoined: boolean;
  displayMemberCount: number;
}

export class GroupService {
  private groupsStorage: StorageService<Group[]>;
  private membershipsStorage: StorageService<string[]>;

  constructor() {
    this.groupsStorage = new StorageService<Group[]>(GROUPS_KEY);
    this.membershipsStorage = new StorageService<string[]>(MEMBERSHIPS_KEY);
  }

  seedIfEmpty(): void {
    const existing = this.groupsStorage.get();
    if (!existing || existing.length === 0) {
      this.groupsStorage.set(seedGroups);
    }
  }

  list(): GroupWithMembership[] {
    const groups = this.groupsStorage.get() ?? [];
    const memberships = this.membershipsStorage.get() ?? [];
    return groups.map((group) => {
      const isJoined = memberships.includes(group.id);
      return {
        ...group,
        isJoined,
        displayMemberCount: group.memberCount + (isJoined ? 1 : 0),
      };
    });
  }

  toggleJoin(groupId: string): void {
    const memberships = this.membershipsStorage.get() ?? [];
    const isJoined = memberships.includes(groupId);
    this.membershipsStorage.set(
      isJoined
        ? memberships.filter((id) => id !== groupId)
        : [...memberships, groupId],
    );
  }
}
