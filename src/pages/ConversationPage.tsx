import { useParams } from "react-router-dom";

export function ConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  return <h1>Razgovor #{conversationId}</h1>;
}
