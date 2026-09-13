import type { GroupWithMembership } from "../../services/GroupService";
import { pluralizeSr } from "../../utils/pluralizeSr";
import "./GroupItem.scss";

export interface GroupItemProps {
  group: GroupWithMembership;
  onToggleJoin: (groupId: string) => void;
}

// Jedan red u listi "Moje grupe" — naziv, broj članova i dugme za pridruživanje.
export function GroupItem({ group, onToggleJoin }: GroupItemProps) {
  return (
    <div className="group-item">
      <div className="group-item__info">
        <p className="group-item__name">{group.name}</p>
        <p className="group-item__count">
          {group.displayMemberCount} {pluralizeSr(group.displayMemberCount, "član", "člana", "članova")}
        </p>
      </div>
      <button
        type="button"
        className={group.isJoined ? "group-item__join group-item__join--joined" : "group-item__join"}
        onClick={() => onToggleJoin(group.id)}
      >
        {group.isJoined ? "Član" : "Pridruži se"}
      </button>
    </div>
  );
}
