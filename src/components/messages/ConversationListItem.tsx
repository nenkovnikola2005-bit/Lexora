import { Link } from "react-router-dom";
import { Avatar } from "../ui/Avatar";
import type { Conversation } from "../../models/Message";
import { formatRelativeTime } from "../../utils/formatRelativeTime";
import "./ConversationListItem.scss";

export interface ConversationListItemProps {
  conversation: Conversation;
  active: boolean;
}

// Jedan red u listi razgovora — vodi na nit poruka sa datim učesnikom.
export function ConversationListItem({ conversation, active }: ConversationListItemProps) {
  return (
    <Link
      to={`/messages/${conversation.id}`}
      className={
        active ? "conversation-item conversation-item--active" : "conversation-item"
      }
      aria-current={active ? "page" : undefined}
    >
      <Avatar initials={conversation.participantInitials} size="md" />
      <div className="conversation-item__info">
        <div className="conversation-item__top-row">
          <p
            className={
              conversation.unread
                ? "conversation-item__name conversation-item__name--unread"
                : "conversation-item__name"
            }
          >
            {conversation.participantName}
          </p>
          <p className="conversation-item__time">{formatRelativeTime(conversation.updatedAt)}</p>
        </div>
        <p className="conversation-item__headline">{conversation.participantHeadline}</p>
        <div className="conversation-item__bottom-row">
          <p className="conversation-item__preview">
            {conversation.lastMessagePreview || "Nema poruka još."}
          </p>
          {conversation.unread && <span className="conversation-item__unread-dot" aria-label="Nepročitano" />}
        </div>
      </div>
    </Link>
  );
}
