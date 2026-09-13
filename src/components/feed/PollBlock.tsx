import type { MouseEvent } from "react";
import type { Poll } from "../../models/Post";
import { pluralizeSr } from "../../utils/pluralizeSr";
import "./PollBlock.scss";

export interface PollBlockProps {
  poll: Poll;
  currentUserId: string;
  onVote: (optionId: string) => void;
}

// Prikazuje anketu unutar objave: pitanje, opcije i procenat glasova uživo.
export function PollBlock({ poll, currentUserId, onVote }: PollBlockProps) {
  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes.length, 0);
  const myChoiceId = poll.options.find((option) => option.votes.includes(currentUserId))?.id;

  const handleVote = (event: MouseEvent, optionId: string) => {
    event.stopPropagation();
    onVote(optionId);
  };

  return (
    <div className="poll-block">
      <p className="poll-block__question">{poll.question}</p>
      <div className="poll-block__options">
        {poll.options.map((option) => {
          const percent = totalVotes === 0 ? 0 : Math.round((option.votes.length / totalVotes) * 100);
          const isMine = option.id === myChoiceId;
          return (
            <button
              key={option.id}
              type="button"
              className={isMine ? "poll-block__option poll-block__option--mine" : "poll-block__option"}
              onClick={(event) => handleVote(event, option.id)}
            >
              <span className="poll-block__option-fill" style={{ width: `${percent}%` }} />
              <span className="poll-block__option-label">{option.label}</span>
              <span className="poll-block__option-percent">{percent}%</span>
            </button>
          );
        })}
      </div>
      <p className="poll-block__total">
        {totalVotes} {pluralizeSr(totalVotes, "glas", "glasa", "glasova")}
      </p>
    </div>
  );
}
