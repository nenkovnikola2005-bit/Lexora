import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { MessageService } from "../services/MessageService";
import { NetworkService } from "../services/NetworkService";
import type { ConnectionLevel, ConnectionStatus, LawyerProfile } from "../models/Lawyer";
import "./LawyerProfilePage.scss";

const LEVEL_LABEL: Record<ConnectionLevel, string> = {
  1: "1. nivo povezanosti",
  2: "2. nivo povezanosti",
  3: "3. nivo povezanosti",
};

const STATUS_LABEL: Record<ConnectionStatus, string> = {
  none: "Poveži se",
  "pending-outgoing": "Zahtev poslat",
  "pending-incoming": "Prihvati pozivnicu",
  connected: "Povezani",
};

// Profil pravnika iz mreže: pregled biografije, iskustva i akcije povezivanja.
export function LawyerProfilePage() {
  const { lawyerId } = useParams<{ lawyerId: string }>();
  const navigate = useNavigate();
  const networkService = useMemo(() => new NetworkService(), []);
  const messageService = useMemo(() => new MessageService(), []);

  const [lawyer, setLawyer] = useState<LawyerProfile | null | undefined>(undefined);
  const [status, setStatus] = useState<ConnectionStatus>("none");

  useEffect(() => {
    if (!lawyerId) return;
    networkService.seedIfEmpty();
    setLawyer(networkService.getById(lawyerId));
    setStatus(networkService.getConnectionStatus(lawyerId));
  }, [lawyerId, networkService]);

  if (lawyer === undefined) {
    return null;
  }

  if (lawyer === null) {
    return (
      <div className="lawyer-profile-page__not-found">
        <p>Ovaj pravnik ne postoji ili je uklonjen sa mreže.</p>
        <Link to="/network">Nazad na Mrežu</Link>
      </div>
    );
  }

  const isActionable = status === "none" || status === "pending-incoming";

  const handleConnectAction = () => {
    if (status === "none") {
      networkService.sendRequest(lawyer.id);
    } else if (status === "pending-incoming") {
      networkService.accept(lawyer.id);
    } else {
      return;
    }
    setStatus(networkService.getConnectionStatus(lawyer.id));
  };

  const handleMessage = () => {
    const conversation = messageService.startConversation(lawyer);
    navigate(`/messages/${conversation.id}`);
  };

  return (
    <div className="lawyer-profile-page">
      <div className="lawyer-profile-page__main">
        <header className="lawyer-profile-page__header">
          <Avatar initials={lawyer.avatarInitials} size="lg" />
          <div>
            <h1 className="lawyer-profile-page__name">
              {lawyer.firstName} {lawyer.lastName}
            </h1>
            <p className="lawyer-profile-page__headline">{lawyer.headline}</p>
            <div className="lawyer-profile-page__meta-row">
              <span className="lawyer-profile-page__city">{lawyer.city}</span>
              <span className="lawyer-profile-page__level-tag">
                {LEVEL_LABEL[lawyer.connectionLevel]}
              </span>
            </div>
          </div>
        </header>

        <section className="lawyer-profile-page__section">
          <h2>O meni</h2>
          <p>{lawyer.about}</p>
        </section>

        <section className="lawyer-profile-page__section">
          <h2>Iskustvo</h2>
          <ul className="lawyer-profile-page__timeline">
            {lawyer.experience.map((item) => (
              <li key={`${item.organization}-${item.period}`}>
                <p className="lawyer-profile-page__timeline-role">{item.role}</p>
                <p className="lawyer-profile-page__timeline-org">{item.organization}</p>
                <p className="lawyer-profile-page__timeline-period">{item.period}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="lawyer-profile-page__section">
          <h2>Obrazovanje</h2>
          <ul className="lawyer-profile-page__timeline">
            {lawyer.education.map((item) => (
              <li key={`${item.school}-${item.period}`}>
                <p className="lawyer-profile-page__timeline-role">{item.degree}</p>
                <p className="lawyer-profile-page__timeline-org">{item.school}</p>
                <p className="lawyer-profile-page__timeline-period">{item.period}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="lawyer-profile-page__section">
          <h2>Veštine</h2>
          <ul className="lawyer-profile-page__skills">
            {lawyer.skills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </section>
      </div>

      <aside className="lawyer-profile-page__sidebar">
        <Button
          variant={isActionable ? "primary" : "outline"}
          disabled={!isActionable}
          onClick={handleConnectAction}
        >
          {STATUS_LABEL[status]}
        </Button>
        <Button variant="secondary" onClick={handleMessage}>
          Pošalji poruku
        </Button>
      </aside>
    </div>
  );
}
