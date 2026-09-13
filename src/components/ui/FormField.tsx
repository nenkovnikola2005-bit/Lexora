import type { ChangeEvent, ReactNode } from "react";
import "./FormField.scss";

export type FormFieldVariant = "text" | "email" | "password" | "select" | "textarea";

export interface FormFieldOption {
  value: string;
  label: string;
}

export interface FormFieldProps {
  id: string;
  name?: string;
  label: string;
  variant?: FormFieldVariant;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  required?: boolean;
  disabled?: boolean;
  options?: FormFieldOption[];
  rows?: number;
}

// Obeleženo polje forme: naziv velikim slovima iznad uokvirenog unosa,
// prema Figma sheetu forme za registraciju.
export function FormField({
  id,
  name,
  label,
  variant = "text",
  value,
  onChange,
  placeholder,
  helperText,
  errorText,
  required,
  disabled,
  options = [],
  rows = 4,
}: FormFieldProps) {
  const hasError = Boolean(errorText);
  const messageId = errorText || helperText ? `${id}-message` : undefined;

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    onChange(event.target.value);
  };

  const controlClassName = ["form-field__control", hasError && "form-field__control--error"]
    .filter(Boolean)
    .join(" ");

  const renderControl = (): ReactNode => {
    if (variant === "select") {
      return (
        <select
          id={id}
          name={name}
          className={controlClassName}
          value={value}
          onChange={handleChange}
          required={required}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={messageId}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    if (variant === "textarea") {
      return (
        <textarea
          id={id}
          name={name}
          className={controlClassName}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows}
          aria-invalid={hasError || undefined}
          aria-describedby={messageId}
        />
      );
    }

    return (
      <input
        id={id}
        name={name}
        type={variant}
        className={controlClassName}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        aria-invalid={hasError || undefined}
        aria-describedby={messageId}
      />
    );
  };

  return (
    <div className="form-field">
      <label htmlFor={id} className="form-field__label">
        {label}
      </label>
      {renderControl()}
      {errorText ? (
        <p id={messageId} className="form-field__message form-field__message--error" role="alert">
          {errorText}
        </p>
      ) : helperText ? (
        <p id={messageId} className="form-field__message">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
