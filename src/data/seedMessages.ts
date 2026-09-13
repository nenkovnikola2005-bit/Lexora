import type { Conversation, Message } from "../models/Message";
import { DEMO_USER_ID } from "../services/AuthService";

export const seedConversations: Conversation[] = [
  {
    id: "conv-01",
    participantId: "lw-02",
    participantName: "Jelena Petrović",
    participantHeadline: "Advokatica · Radno pravo",
    participantInitials: "JP",
    lastMessagePreview: "Naravno, pošaljite mi dokumentaciju pa da pogledam.",
    updatedAt: "2026-09-08T15:42:00.000Z",
    unread: true,
  },
  {
    id: "conv-02",
    participantId: "lw-04",
    participantName: "Milica Đorđević",
    participantHeadline: "Advokatica · Nekretnine",
    participantInitials: "MĐ",
    lastMessagePreview: "Hvala, javljam se čim dobijem izvod iz katastra.",
    updatedAt: "2026-09-07T11:20:00.000Z",
  },
  {
    id: "conv-03",
    participantId: "lw-08",
    participantName: "Tijana Nikolić",
    participantHeadline: "Advokatica · Porodično i nasledno pravo",
    participantInitials: "TN",
    lastMessagePreview: "Odlično, javi mi kad budeš imala vremena za poziv.",
    updatedAt: "2026-09-05T09:05:00.000Z",
    unread: true,
  },
];

export const seedMessages: Message[] = [
  // conv-01 — Jelena Petrović
  {
    id: "msg-01-1",
    conversationId: "conv-01",
    senderId: "lw-02",
    text: "Pozdrav Ana, imam klijenta sa spornim otkazom — da li se baviš i radnim pravom ili mogu da te zamolim za preporuku?",
    sentAt: "2026-09-08T15:10:00.000Z",
  },
  {
    id: "msg-01-2",
    conversationId: "conv-01",
    senderId: DEMO_USER_ID,
    text: "Zdravo Jelena! Ja se pretežno bavim porodičnim pravom, ali rado ću ti pomoći oko preporuke ako treba drugo mišljenje.",
    sentAt: "2026-09-08T15:25:00.000Z",
  },
  {
    id: "msg-01-3",
    conversationId: "conv-01",
    senderId: "lw-02",
    text: "Naravno, pošaljite mi dokumentaciju pa da pogledam.",
    sentAt: "2026-09-08T15:42:00.000Z",
  },
  // conv-02 — Milica Đorđević
  {
    id: "msg-02-1",
    conversationId: "conv-02",
    senderId: DEMO_USER_ID,
    text: "Milice, imam klijentkinju koja nasleđuje stan i treba joj provera tereta pre prodaje. Da li primaš nove predmete ovog meseca?",
    sentAt: "2026-09-07T10:50:00.000Z",
  },
  {
    id: "msg-02-2",
    conversationId: "conv-02",
    senderId: "lw-04",
    text: "Hvala, javljam se čim dobijem izvod iz katastra.",
    sentAt: "2026-09-07T11:20:00.000Z",
  },
  // conv-03 — Tijana Nikolić
  {
    id: "msg-03-1",
    conversationId: "conv-03",
    senderId: "lw-08",
    text: "Ana, videla sam tvoj profil — bilo bi lepo da razmenimo iskustva oko ostavinskih postupaka nekom prilikom.",
    sentAt: "2026-09-05T08:40:00.000Z",
  },
  {
    id: "msg-03-2",
    conversationId: "conv-03",
    senderId: DEMO_USER_ID,
    text: "Svakako, rado! Mogu ove nedelje ako ti odgovara kratak poziv.",
    sentAt: "2026-09-05T08:55:00.000Z",
  },
  {
    id: "msg-03-3",
    conversationId: "conv-03",
    senderId: "lw-08",
    text: "Odlično, javi mi kad budeš imala vremena za poziv.",
    sentAt: "2026-09-05T09:05:00.000Z",
  },
];
