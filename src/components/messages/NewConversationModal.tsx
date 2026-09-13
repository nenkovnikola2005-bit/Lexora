import { useMemo } from "react";
import { Avatar } from "../ui/Avatar";
import { Modal } from "../ui/Modal";
import type { LawyerProfile } from "../../models/Lawyer";
import type { MessageService } from "../../services/MessageService";
import type { NetworkService } from "../../services/NetworkService";
import "./NewConversationModal.scss";

export interface NewConversationModalProps {
  networkService: NetworkService;
  messageService: MessageService;
  currentUserId: string;
  onClose: () => void;
  onStart: (conversationId: string) => void;
}

// Popup za započinjanje novog razgovora sa jednom od veza.
export function NewConversationModal({
  networkService,
  messageService,
  currentUserId,
  onClose,
  onStart,
}: NewConversationModalProps) {
  const connections = useMemo<LawyerProfile[]>(
    () =>
      networkService
        .getDirectory(undefined, currentUserId)
        .filter(
          (lawyer) => networkService.getConnectionStatus(lawyer.id, currentUserId) === "connected",
        ),
    [networkService, currentUserId],
  );

  const handleSelect = (lawyer: LawyerProfile) => {
    const conversation = messageService.startConversation(lawyer);
    onStart(conversation.id);
  };

  return (
    <Modal title="Nova poruka" onClose={onClose}>
      <div className="new-conversation-modal">
        {connections.length === 0 ? (
          <p className="new-conversation-modal__empty">
            Nemate nijednu vezu kojoj možete poslati poruku. Povežite se sa kolegama u Mreži.
          </p>
        ) : (
          <ul className="new-conversation-modal__list">
            {connections.map((lawyer) => (
              <li key={lawyer.id}>
                <button
                  type="button"
                  className="new-conversation-modal__row"
                  onClick={() => handleSelect(lawyer)}
                >
                  <Avatar initials={lawyer.avatarInitials} size="sm" />
                  <div className="new-conversation-modal__info">
                    <p className="new-conversation-modal__name">
                      {lawyer.firstName} {lawyer.lastName}
                    </p>
                    <p className="new-conversation-modal__headline">{lawyer.headline}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}
