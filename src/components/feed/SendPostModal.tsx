import { useMemo, useState } from "react";
import { Avatar } from "../ui/Avatar";
import { Modal } from "../ui/Modal";
import type { LawyerProfile } from "../../models/Lawyer";
import type { Post } from "../../models/Post";
import type { User } from "../../models/User";
import type { MessageService } from "../../services/MessageService";
import type { NetworkService } from "../../services/NetworkService";
import "./SendPostModal.scss";

export interface SendPostModalProps {
  post: Post;
  currentUser: User;
  networkService: NetworkService;
  messageService: MessageService;
  onClose: () => void;
}

const PREVIEW_LIMIT = 120;

function buildShareText(post: Post): string {
  if (post.content.trim()) {
    const preview =
      post.content.length > PREVIEW_LIMIT
        ? `${post.content.slice(0, PREVIEW_LIMIT).trimEnd()}…`
        : post.content;
    return `Pogledajte objavu korisnika ${post.authorName}: „${preview}”`;
  }

  if (post.poll) {
    return `Pogledajte anketu korisnika ${post.authorName}: „${post.poll.question}”`;
  }

  if (post.document) {
    return `Pogledajte dokument koji je podelio/la ${post.authorName}: „${post.document.name}”`;
  }

  return `Pogledajte objavu korisnika ${post.authorName}.`;
}

// Popup za slanje objave kao poruke jednoj od veza.
export function SendPostModal({
  post,
  currentUser,
  networkService,
  messageService,
  onClose,
}: SendPostModalProps) {
  const [sentToId, setSentToId] = useState<string | null>(null);

  const connections = useMemo<LawyerProfile[]>(
    () =>
      networkService
        .getDirectory()
        .filter((lawyer) => networkService.getConnectionStatus(lawyer.id) === "connected"),
    [networkService],
  );

  const handleSend = (lawyer: LawyerProfile) => {
    const conversation = messageService.startConversation(lawyer);
    messageService.sendMessage(conversation.id, currentUser.id, buildShareText(post));
    setSentToId(lawyer.id);
  };

  return (
    <Modal title="Pošalji objavu" onClose={onClose}>
      <div className="send-post-modal">
        {connections.length === 0 ? (
          <p className="send-post-modal__empty">
            Nemate nijednu vezu kojoj možete poslati objavu. Povežite se sa kolegama u Mreži.
          </p>
        ) : (
          <ul className="send-post-modal__list">
            {connections.map((lawyer) => (
              <li key={lawyer.id} className="send-post-modal__row">
                <Avatar initials={lawyer.avatarInitials} size="sm" />
                <div className="send-post-modal__info">
                  <p className="send-post-modal__name">
                    {lawyer.firstName} {lawyer.lastName}
                  </p>
                  <p className="send-post-modal__headline">{lawyer.headline}</p>
                </div>
                <button
                  type="button"
                  className="send-post-modal__send"
                  disabled={sentToId === lawyer.id}
                  onClick={() => handleSend(lawyer)}
                >
                  {sentToId === lawyer.id ? "Poslato" : "Pošalji"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}
