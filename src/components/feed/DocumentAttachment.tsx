import { DocumentPostIcon } from "../ui/icons/DocumentPostIcon";
import type { PostDocument } from "../../models/Post";
import "./DocumentAttachment.scss";

export interface DocumentAttachmentProps {
  document: PostDocument;
}

// Kartica priloženog dokumenta uz objavu — omogućava preuzimanje pravog fajla.
export function DocumentAttachment({ document }: DocumentAttachmentProps) {
  return (
    <a
      className="document-attachment"
      href={document.dataUrl}
      download={document.name}
      onClick={(event) => event.stopPropagation()}
    >
      <span className="document-attachment__icon">
        <DocumentPostIcon />
      </span>
      <span className="document-attachment__meta">
        <span className="document-attachment__name">{document.name}</span>
        <span className="document-attachment__size">{document.sizeLabel} · Preuzmi</span>
      </span>
    </a>
  );
}
