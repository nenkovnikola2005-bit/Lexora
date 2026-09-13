import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useParams } from "react-router-dom";
import { ConversationListItem } from "../components/messages/ConversationListItem";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { MessageService } from "../services/MessageService";
import type { Conversation, Message } from "../models/Message";
import { formatRelativeTime } from "../utils/formatRelativeTime";
import "./MessagesPage.scss";

export function MessagesPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const messageService = useMemo(() => new MessageService(), []);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messageService.seedIfEmpty();
    setConversations(messageService.listConversations());
  }, [messageService]);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    setMessages(messageService.listMessages(conversationId));
  }, [conversationId, messageService]);

  // Skroluje na poslednju poruku pri promeni razgovora ili slanju nove.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!user) {
    return null;
  }

  const activeConversation = conversationId
    ? conversations.find((conversation) => conversation.id === conversationId) ?? null
    : null;

  const handleSend = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || !conversationId) return;

    messageService.sendMessage(conversationId, user.id, trimmed);
    setDraft("");
    setMessages(messageService.listMessages(conversationId));
    setConversations(messageService.listConversations());
  };

  return (
    <div className="messages-page">
      <aside className="messages-page__list">
        {conversations.length === 0 ? (
          <p className="messages-page__empty-list">Nemate razgovora.</p>
        ) : (
          conversations.map((conversation) => (
            <ConversationListItem
              key={conversation.id}
              conversation={conversation}
              active={conversation.id === conversationId}
            />
          ))
        )}
      </aside>

      <section className="messages-page__thread">
        {!conversationId ? (
          <div className="messages-page__empty-thread">
            <p>Izaberite razgovor sa leve strane da biste videli poruke.</p>
          </div>
        ) : !activeConversation ? (
          <div className="messages-page__empty-thread">
            <p>Ovaj razgovor ne postoji.</p>
          </div>
        ) : (
          <>
            <header className="messages-page__thread-header">
              <h2 className="messages-page__thread-name">
                {activeConversation.participantName}
              </h2>
              <p className="messages-page__thread-headline">
                {activeConversation.participantHeadline}
              </p>
            </header>

            <div className="messages-page__messages">
              {messages.map((message) => {
                const isOwn = message.senderId === user.id;
                return (
                  <div
                    key={message.id}
                    className={
                      isOwn
                        ? "messages-page__bubble messages-page__bubble--own"
                        : "messages-page__bubble"
                    }
                  >
                    <p className="messages-page__bubble-text">{message.text}</p>
                    <p className="messages-page__bubble-time">
                      {formatRelativeTime(message.sentAt)}
                    </p>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <form className="messages-page__composer" onSubmit={handleSend}>
              <input
                className="messages-page__composer-input"
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Napišite poruku..."
                aria-label="Napišite poruku"
              />
              <Button type="submit" disabled={!draft.trim()}>
                Pošalji
              </Button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
