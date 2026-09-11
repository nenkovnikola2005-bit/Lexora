export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  sentAt: string;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantHeadline: string;
  participantInitials: string;
  lastMessagePreview: string;
  updatedAt: string;
}
