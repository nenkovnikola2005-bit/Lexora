import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ConversationListItem } from "../components/messages/ConversationListItem";
import { NewConversationModal } from "../components/messages/NewConversationModal";
import { Avatar } from "../components/ui/Avatar";
import { PaperclipIcon } from "../components/ui/icons/PaperclipIcon";
import { PlusIcon } from "../components/ui/icons/PlusIcon";
import { SearchIcon } from "../components/ui/icons/SearchIcon";
import { SmileIcon } from "../components/ui/icons/SmileIcon";
import { useAuth } from "../context/AuthContext";
import { MessageService } from "../services/MessageService";
import { NetworkService } from "../services/NetworkService";
import type { Conversation, Message } from "../models/Message";
import "./MessagesPage.scss";

type ConversationFilter = "all" | "unread" | "connections";

function formatDayLabel(isoDate: string): string {
  const date = new Date(isoDate);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  if (isSameDay(date, today)) return "Danas";
  if (isSameDay(date, yesterday)) return "Juče";
  return date.toLocaleDateString("sr-Latn-RS", { day: "numeric", month: "long", year: "numeric" });
}

function formatClockTime(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString("sr-Latn-RS", { hour: "2-digit", minute: "2-digit" });
}

export function MessagesPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const messageService = useMemo(() => new MessageService(), []);
  const networkService = useMemo(() => new NetworkService(), []);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ConversationFilter>("all");
  const [showNewConversation, setShowNewConversation] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const refreshConversations = () => setConversations(messageService.listConversations());

  useEffect(() => {
    messageService.seedIfEmpty();
    networkService.seedIfEmpty();
    refreshConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageService, networkService]);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    setMessages(messageService.listMessages(conversationId));
    messageService.markRead(conversationId);
    refreshConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const activeParticipant = activeConversation
    ? networkService.getById(activeConversation.participantId)
    : null;

  const sendDraft = () => {
    const trimmed = draft.trim();
    if (!trimmed || !conversationId) return;

    messageService.sendMessage(conversationId, user.id, trimmed);
    setDraft("");
    setMessages(messageService.listMessages(conversationId));
    refreshConversations();
  };

  const handleSend = (event: FormEvent) => {
    event.preventDefault();
    sendDraft();
  };

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendDraft();
    }
  };

  const handleStartConversation = (newConversationId: string) => {
    setShowNewConversation(false);
    refreshConversations();
    navigate(`/messages/${newConversationId}`);
  };

  const visibleConversations = conversations
    .filter((conversation) =>
      search.trim() ? conversation.participantName.toLowerCase().includes(search.trim().toLowerCase()) : true,
    )
    .filter((conversation) => {
      if (filter === "unread") return Boolean(conversation.unread);
      if (filter === "connections") {
        return networkService.getConnectionStatus(conversation.participantId) === "connected";
      }
      return true;
    });

  let lastDayLabel = "";

  return (
    <div className="messages-page">
      <aside className="messages-page__list">
        <div className="messages-page__list-header">
          <p className="messages-page__list-title">Poruke</p>
          <button
            type="button"
            className="messages-page__new-btn"
            onClick={() => setShowNewConversation(true)}
            aria-label="Nova poruka"
          >
            <PlusIcon />
          </button>
        </div>

        <div className="messages-page__search">
          <SearchIcon />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Pretraži poruke"
            aria-label="Pretraži poruke"
          />
        </div>

        <div className="messages-page__filters" role="radiogroup" aria-label="Filter razgovora">
          <button
            type="button"
            role="radio"
            aria-checked={filter === "all"}
            className={filter === "all" ? "messages-page__filter messages-page__filter--active" : "messages-page__filter"}
            onClick={() => setFilter("all")}
          >
            Sve
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={filter === "unread"}
            className={
              filter === "unread" ? "messages-page__filter messages-page__filter--active" : "messages-page__filter"
            }
            onClick={() => setFilter("unread")}
          >
            Nepročitano
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={filter === "connections"}
            className={
              filter === "connections"
                ? "messages-page__filter messages-page__filter--active"
                : "messages-page__filter"
            }
            onClick={() => setFilter("connections")}
          >
            Moje veze
          </button>
        </div>

        <div className="messages-page__list-scroll">
          {visibleConversations.length === 0 ? (
            <p className="messages-page__empty-list">Nema razgovora koji odgovaraju pretrazi.</p>
          ) : (
            visibleConversations.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                active={conversation.id === conversationId}
              />
            ))
          )}
        </div>
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
              <Avatar initials={activeConversation.participantInitials} size="md" />
              <div className="messages-page__thread-info">
                <h2 className="messages-page__thread-name">
                  {activeConversation.participantName}
                  {activeParticipant && (
                    <span className="messages-page__thread-level"> · {activeParticipant.connectionLevel}. nivo</span>
                  )}
                </h2>
                <p className="messages-page__thread-headline">
                  {activeConversation.participantHeadline}
                </p>
              </div>
              <Link to={`/network/${activeConversation.participantId}`} className="messages-page__profile-btn">
                Otvori profil
              </Link>
            </header>

            <div className="messages-page__messages">
              {messages.map((message) => {
                const isOwn = message.senderId === user.id;
                const dayLabel = formatDayLabel(message.sentAt);
                const showDivider = dayLabel !== lastDayLabel;
                lastDayLabel = dayLabel;

                return (
                  <div key={message.id} className="messages-page__message-group">
                    {showDivider && (
                      <div className="messages-page__day-divider">
                        <span />
                        <p>{dayLabel}</p>
                        <span />
                      </div>
                    )}
                    <div
                      className={
                        isOwn
                          ? "messages-page__row messages-page__row--own"
                          : "messages-page__row"
                      }
                    >
                      <Avatar
                        initials={isOwn ? user.avatarInitials : activeConversation.participantInitials}
                        size="sm"
                      />
                      <div
                        className={
                          isOwn
                            ? "messages-page__bubble messages-page__bubble--own"
                            : "messages-page__bubble"
                        }
                      >
                        <p className="messages-page__bubble-text">{message.text}</p>
                        <p className="messages-page__bubble-time">{formatClockTime(message.sentAt)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <form className="messages-page__composer" onSubmit={handleSend}>
              <div className="messages-page__composer-pill">
                <textarea
                  className="messages-page__composer-input"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={handleComposerKeyDown}
                  placeholder="Napišite poruku…"
                  aria-label="Napišite poruku"
                  rows={1}
                />
                <span className="messages-page__composer-icon" aria-hidden="true">
                  <PaperclipIcon />
                </span>
                <span className="messages-page__composer-icon" aria-hidden="true">
                  <SmileIcon />
                </span>
                <button type="submit" className="messages-page__send-btn" disabled={!draft.trim()}>
                  Pošalji
                </button>
              </div>
              <p className="messages-page__composer-hint">
                Enter šalje poruku · Shift + Enter za novi red
              </p>
            </form>
          </>
        )}
      </section>

      {showNewConversation && (
        <NewConversationModal
          networkService={networkService}
          messageService={messageService}
          onClose={() => setShowNewConversation(false)}
          onStart={handleStartConversation}
        />
      )}
    </div>
  );
}
