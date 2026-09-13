import "./SkillEndorsement.scss";

export interface SkillEndorsementProps {
  skill: string;
  summary: string;
  hasEndorsed: boolean;
  onToggle: () => void;
}

// Red jedne veštine sa brojem potvrda kolega i dugmetom za potvrđivanje.
export function SkillEndorsement({ skill, summary, hasEndorsed, onToggle }: SkillEndorsementProps) {
  return (
    <div className="skill-endorsement">
      <div className="skill-endorsement__info">
        <p className="skill-endorsement__name">{skill}</p>
        <p className="skill-endorsement__summary">{summary}</p>
      </div>
      <button
        type="button"
        className={
          hasEndorsed ? "skill-endorsement__btn skill-endorsement__btn--active" : "skill-endorsement__btn"
        }
        onClick={onToggle}
      >
        {hasEndorsed ? "Potvrđeno" : "Potvrdi"}
      </button>
    </div>
  );
}
