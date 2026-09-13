import { seedConversations, seedMessages } from "../data/seedMessages";
import type { Conversation, Message } from "../models/Message";
import type { LawyerProfile } from "../models/Lawyer";
import { StorageService } from "./StorageService";

const CONVERSATIONS_KEY = "lexora_conversations";
const MESSAGES_KEY = "lexora_messages";

export class MessageService {
  private conversationsStorage: StorageService<Conversation[]>;
  private messagesStorage: StorageService<Message[]>;

  constructor() {
    this.conversationsStorage = new StorageService<Conversation[]>(CONVERSATIONS_KEY);
    this.messagesStorage = new StorageService<Message[]>(MESSAGES_KEY);
  }

  seedIfEmpty(): void {
    const existing = this.conversationsStorage.get();
    if (!existing || existing.length === 0) {
      this.conversationsStorage.set(seedConversations);
      this.messagesStorage.set(seedMessages);
    }
  }

  listConversations(): Conversation[] {
    const conversations = this.conversationsStorage.get() ?? [];
    return [...conversations].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }

  getConversation(id: string): Conversation | null {
    const conversations = this.conversationsStorage.get() ?? [];
    return conversations.find((conversation) => conversation.id === id) ?? null;
  }

  listMessages(conversationId: string): Message[] {
    const messages = this.messagesStorage.get() ?? [];
    return messages
      .filter((message) => message.conversationId === conversationId)
      .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
  }

  startConversation(lawyer: LawyerProfile): Conversation {
    const conversations = this.conversationsStorage.get() ?? [];
    const existing = conversations.find(
      (conversation) => conversation.participantId === lawyer.id,
    );
    if (existing) return existing;

    const conversation: Conversation = {
      id: crypto.randomUUID(),
      participantId: lawyer.id,
      participantName: `${lawyer.firstName} ${lawyer.lastName}`,
      participantHeadline: lawyer.headline,
      participantInitials: lawyer.avatarInitials,
      lastMessagePreview: "",
      updatedAt: new Date().toISOString(),
    };
    conversations.push(conversation);
    this.conversationsStorage.set(conversations);
    return conversation;
  }

  markRead(conversationId: string): void {
    const conversations = this.conversationsStorage.get() ?? [];
    const index = conversations.findIndex((conversation) => conversation.id === conversationId);
    if (index === -1 || !conversations[index].unread) return;
    conversations[index] = { ...conversations[index], unread: false };
    this.conversationsStorage.set(conversations);
  }

  sendMessage(conversationId: string, senderId: string, text: string): Message {
    const messages = this.messagesStorage.get() ?? [];
    const message: Message = {
      id: crypto.randomUUID(),
      conversationId,
      senderId,
      text,
      sentAt: new Date().toISOString(),
    };
    messages.push(message);
    this.messagesStorage.set(messages);

    const conversations = this.conversationsStorage.get() ?? [];
    const index = conversations.findIndex(
      (conversation) => conversation.id === conversationId,
    );
    if (index !== -1) {
      conversations[index] = {
        ...conversations[index],
        lastMessagePreview: text,
        updatedAt: message.sentAt,
      };
      this.conversationsStorage.set(conversations);
    }

    return message;
  }
}
