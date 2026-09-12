import { useParams } from "react-router-dom";

export function NetworkProfilePage() {
  const { lawyerId } = useParams<{ lawyerId: string }>();
  return <h1>Profil advokata #{lawyerId}</h1>;
}
