import { Link } from "react-router-dom";
import { Avatar } from "../ui/Avatar";
import type { LawyerProfile } from "../../models/Lawyer";
import { pluralizeSr } from "../../utils/pluralizeSr";
import "./SuggestionCard.scss";

export interface SuggestionCardProps {
  lawyer: LawyerProfile;
  onConnect: (lawyerId: string) => void;
}

// Kompaktan predlog osobe za povezivanje — koristi se u bočnoj koloni feed-a.
export function SuggestionCard({ lawyer, onConnect }: SuggestionCardProps) {
  return (
    <div className="suggestion-card">
      <Link to={`/network/${lawyer.id}`} className="suggestion-card__avatar-link">
        <Avatar initials={lawyer.avatarInitials} size="md" />
      </Link>
      <div className="suggestion-card__body">
        <Link to={`/network/${lawyer.id}`} className="suggestion-card__name">
          {lawyer.firstName} {lawyer.lastName}
        </Link>
        <p className="suggestion-card__headline">{lawyer.headline}</p>
        {lawyer.mutualConnections > 0 && (
          <p className="suggestion-card__mutual">
            {lawyer.mutualConnections}{" "}
            {pluralizeSr(lawyer.mutualConnections, "zajednička veza", "zajedničke veze", "zajedničkih veza")}
          </p>
        )}
        <button type="button" className="suggestion-card__connect" onClick={() => onConnect(lawyer.id)}>
          Poveži se
        </button>
      </div>
    </div>
  );
}
