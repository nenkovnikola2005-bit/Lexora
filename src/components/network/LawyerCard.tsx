import { Link } from "react-router-dom";
import { Avatar } from "../ui/Avatar";
import type { ConnectionStatus, LawyerProfile } from "../../models/Lawyer";
import { pluralizeSr } from "../../utils/pluralizeSr";
import "./LawyerCard.scss";

export interface LawyerCardProps {
  lawyer: LawyerProfile;
  status: ConnectionStatus;
  onConnect: (lawyerId: string) => void;
}

const STATUS_LABEL: Record<ConnectionStatus, string> = {
  none: "Poveži se",
  "pending-outgoing": "Zahtev poslat",
  "pending-incoming": "Čeka odgovor",
  connected: "Povezani",
};

// Kartica jednog pravnika — generička, koristi se u rezultatima Mreže
// a kasnije i na drugim mestima (npr. "ljudi koje možda poznajete").
export function LawyerCard({ lawyer, status, onConnect }: LawyerCardProps) {
  const isActionable = status === "none";

  return (
    <article className="lawyer-card">
      <div className="lawyer-card__cover" />
      <Link to={`/network/${lawyer.id}`} className="lawyer-card__avatar-link">
        <Avatar initials={lawyer.avatarInitials} size="lg" />
      </Link>

      <div className="lawyer-card__body">
        <Link to={`/network/${lawyer.id}`} className="lawyer-card__name-link">
          {lawyer.firstName} {lawyer.lastName}
        </Link>
        <p className="lawyer-card__headline">{lawyer.headline}</p>

        {lawyer.mutualConnections > 0 && (
          <p className="lawyer-card__mutual">
            <span className="lawyer-card__mutual-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            {lawyer.mutualConnections}{" "}
            {pluralizeSr(lawyer.mutualConnections, "zajednička veza", "zajedničke veze", "zajedničkih veza")}
          </p>
        )}
      </div>

      <button
        type="button"
        className={
          isActionable ? "lawyer-card__connect" : "lawyer-card__connect lawyer-card__connect--disabled"
        }
        disabled={!isActionable}
        onClick={() => onConnect(lawyer.id)}
      >
        {STATUS_LABEL[status]}
      </button>
    </article>
  );
}
