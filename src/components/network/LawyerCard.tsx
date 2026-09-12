import { Link } from "react-router-dom";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
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
      <Link to={`/network/${lawyer.id}`} className="lawyer-card__link">
        <Avatar initials={lawyer.avatarInitials} size="lg" />
        <p className="lawyer-card__name">
          {lawyer.firstName} {lawyer.lastName}
        </p>
        <p className="lawyer-card__headline">{lawyer.headline}</p>
      </Link>

      {lawyer.mutualConnections > 0 && (
        <p className="lawyer-card__mutual">
          {lawyer.mutualConnections}{" "}
          {pluralizeSr(lawyer.mutualConnections, "zajednička veza", "zajedničke veze", "zajedničkih veza")}
        </p>
      )}

      <Button
        variant={isActionable ? "primary" : "outline"}
        size="small"
        disabled={!isActionable}
        onClick={() => onConnect(lawyer.id)}
      >
        {STATUS_LABEL[status]}
      </Button>
    </article>
  );
}
