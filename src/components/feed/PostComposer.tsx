import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { DocumentPostIcon } from "../ui/icons/DocumentPostIcon";
import { EventIcon } from "../ui/icons/EventIcon";
import { ImagePostIcon } from "../ui/icons/ImagePostIcon";
import { PollIcon } from "../ui/icons/PollIcon";
import type { PostDocument } from "../../models/Post";
import type { User } from "../../models/User";
import { PostService } from "../../services/PostService";
import { formatFileSize } from "../../utils/formatFileSize";
import "./PostComposer.scss";

export interface PostComposerProps {
  user: User;
  postService: PostService;
  onPostCreated: () => void;
}

type ComposerMode = "objava" | "dokument" | "anketa";

// localStorage ima ograničen prostor, pa fajl mora biti mali da ne bi istisnuo ostale podatke.
const MAX_FILE_BYTES = 1.5 * 1024 * 1024;
const MIN_POLL_OPTIONS = 2;
const MAX_POLL_OPTIONS = 4;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// Polje za kreiranje nove objave: tekst, dokument ili anketa.
export function PostComposer({ user, postService, onPostCreated }: PostComposerProps) {
  const [mode, setMode] = useState<ComposerMode>("objava");
  const [content, setContent] = useState("");
  const [documentDraft, setDocumentDraft] = useState<PostDocument | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [eventNotice, setEventNotice] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetComposer = () => {
    setMode("objava");
    setContent("");
    setDocumentDraft(null);
    setFileError(null);
    setPollQuestion("");
    setPollOptions(["", ""]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleModeChange = (nextMode: ComposerMode) => {
    setMode(nextMode);
    setEventNotice(false);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_BYTES) {
      setFileError("Fajl je prevelik. Maksimalna veličina je 1,5 MB.");
      setDocumentDraft(null);
      event.target.value = "";
      return;
    }

    setFileError(null);
    const dataUrl = await readFileAsDataUrl(file);
    setDocumentDraft({ name: file.name, sizeLabel: formatFileSize(file.size), dataUrl });
  };

  const handlePollOptionChange = (index: number, value: string) => {
    setPollOptions((current) => current.map((option, i) => (i === index ? value : option)));
  };

  const handleAddPollOption = () => {
    setPollOptions((current) => (current.length < MAX_POLL_OPTIONS ? [...current, ""] : current));
  };

  const handleRemovePollOption = (index: number) => {
    setPollOptions((current) =>
      current.length > MIN_POLL_OPTIONS ? current.filter((_, i) => i !== index) : current,
    );
  };

  const trimmedPollOptions = pollOptions.map((option) => option.trim()).filter(Boolean);
  const canSubmit =
    mode === "objava"
      ? Boolean(content.trim())
      : mode === "dokument"
        ? Boolean(documentDraft)
        : Boolean(pollQuestion.trim()) && trimmedPollOptions.length >= MIN_POLL_OPTIONS;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    if (mode === "dokument" && documentDraft) {
      postService.create(user, content.trim(), { document: documentDraft });
    } else if (mode === "anketa") {
      postService.create(user, content.trim(), {
        poll: {
          question: pollQuestion.trim(),
          options: trimmedPollOptions.map((label) => ({
            id: crypto.randomUUID(),
            label,
            votes: [],
          })),
        },
      });
    } else {
      postService.create(user, content.trim());
    }

    resetComposer();
    onPostCreated();
  };

  return (
    <form className="post-composer" onSubmit={handleSubmit}>
      <div className="post-composer__row">
        <Avatar initials={user.avatarInitials} size="md" />
        <textarea
          className="post-composer__input"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder={
            mode === "objava"
              ? "Podelite mišljenje o presudi, pitanje ili iskustvo iz prakse…"
              : "Dodajte opis (opciono)…"
          }
          aria-label="Tekst objave"
          rows={1}
        />
      </div>

      {mode === "dokument" && (
        <div className="post-composer__extra">
          <input
            ref={fileInputRef}
            type="file"
            id="composer-file"
            className="post-composer__file-input"
            onChange={handleFileChange}
          />
          <label htmlFor="composer-file" className="post-composer__file-label">
            {documentDraft ? "Zameni fajl" : "Izaberite fajl"}
          </label>
          {documentDraft && (
            <div className="post-composer__file-preview">
              <span className="post-composer__file-name">{documentDraft.name}</span>
              <span className="post-composer__file-size">{documentDraft.sizeLabel}</span>
              <button
                type="button"
                className="post-composer__file-remove"
                onClick={() => {
                  setDocumentDraft(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                Ukloni
              </button>
            </div>
          )}
          {fileError && (
            <p className="post-composer__file-error" role="alert">
              {fileError}
            </p>
          )}
        </div>
      )}

      {mode === "anketa" && (
        <div className="post-composer__extra">
          <input
            className="post-composer__poll-question"
            value={pollQuestion}
            onChange={(event) => setPollQuestion(event.target.value)}
            placeholder="Postavite pitanje za anketu…"
            aria-label="Pitanje ankete"
          />
          {pollOptions.map((option, index) => (
            <div className="post-composer__poll-option-row" key={index}>
              <input
                className="post-composer__poll-option"
                value={option}
                onChange={(event) => handlePollOptionChange(index, event.target.value)}
                placeholder={`Opcija ${index + 1}`}
                aria-label={`Opcija ${index + 1}`}
              />
              {pollOptions.length > MIN_POLL_OPTIONS && (
                <button
                  type="button"
                  className="post-composer__poll-option-remove"
                  onClick={() => handleRemovePollOption(index)}
                  aria-label={`Ukloni opciju ${index + 1}`}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {pollOptions.length < MAX_POLL_OPTIONS && (
            <button type="button" className="post-composer__poll-add" onClick={handleAddPollOption}>
              + Dodaj opciju
            </button>
          )}
        </div>
      )}

      <div className="post-composer__types">
        <button
          type="button"
          className={
            mode === "objava" ? "post-composer__type post-composer__type--active" : "post-composer__type"
          }
          onClick={() => handleModeChange("objava")}
        >
          <ImagePostIcon />
          Objava
        </button>
        <button
          type="button"
          className={
            mode === "dokument" ? "post-composer__type post-composer__type--active" : "post-composer__type"
          }
          onClick={() => handleModeChange("dokument")}
        >
          <DocumentPostIcon />
          Dokument
        </button>
        <button
          type="button"
          className={
            mode === "anketa" ? "post-composer__type post-composer__type--active" : "post-composer__type"
          }
          onClick={() => handleModeChange("anketa")}
        >
          <PollIcon />
          Anketa
        </button>
        <button type="button" className="post-composer__type" onClick={() => setEventNotice(true)}>
          <EventIcon />
          Događaj
        </button>
      </div>

      {eventNotice && (
        <p className="post-composer__notice" role="status">
          Objave tipa „Događaj” još uvek nisu dostupne.
        </p>
      )}

      <div className="post-composer__submit-row">
        <Button type="submit" size="small" disabled={!canSubmit}>
          Objavi
        </Button>
      </div>
    </form>
  );
}
