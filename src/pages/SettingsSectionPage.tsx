import { useParams } from "react-router-dom";

export function SettingsSectionPage() {
  const { section } = useParams<{ section: string }>();
  return <h1>Podešavanja — {section}</h1>;
}
