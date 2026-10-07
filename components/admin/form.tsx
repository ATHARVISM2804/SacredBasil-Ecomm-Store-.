"use client";

import { startTransition, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import type { ActionState } from "@/lib/admin/types";
import { inputCls, labelCls } from "./styles";

/**
 * useActionState for forms that must keep their input after submitting
 * (React resets uncontrolled fields after a `<form action>` submission,
 * which would wipe the user's input when validation fails).
 * Pass `pending` to SubmitButton, since useFormStatus does not see it.
 */
export function useFormSubmit(
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>,
  initial: ActionState,
) {
  const [state, formAction, pending] = useActionState(action, initial);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => formAction(fd));
  };
  return [state, onSubmit, pending] as const;
}

export function SubmitButton({
  children,
  pendingLabel = "Saving…",
  className,
  variant = "primary",
  pending: pendingProp,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  variant?: "primary" | "ghost";
  pending?: boolean;
}) {
  const status = useFormStatus();
  const pending = pendingProp ?? status.pending;
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={cn(
        "btn min-h-10 px-5 text-[0.65rem] tracking-[0.18em] hover:translate-y-0 disabled:cursor-wait disabled:opacity-60",
        variant === "primary" ? "btn-primary" : "border border-[var(--line)] text-cocoa hover:bg-cream",
        className,
      )}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

/** Live region that announces an action's result. */
export function FormMessage({ state }: { state: ActionState }) {
  return (
    <p
      aria-live="polite"
      className={cn("text-sm", !state.message && "sr-only", state.ok ? "text-[#4f5a3f]" : "text-terracotta")}
    >
      {state.message}
    </p>
  );
}

type FieldProps = {
  label: string;
  name: string;
  error?: string;
  hint?: React.ReactNode;
  className?: string;
};

export function TextField({
  label,
  name,
  error,
  hint,
  className,
  id: idProp,
  ...rest
}: FieldProps & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name">) {
  const id = idProp ?? `f-${name}`;
  return (
    <div className={className}>
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${id}-desc` : undefined}
        className={inputCls}
        {...rest}
      />
      <FieldNote id={`${id}-desc`} error={error} hint={hint} />
    </div>
  );
}

export function TextAreaField({
  label,
  name,
  error,
  hint,
  className,
  id: idProp,
  ...rest
}: FieldProps & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "name">) {
  const id = idProp ?? `f-${name}`;
  return (
    <div className={className}>
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        rows={4}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${id}-desc` : undefined}
        className={inputCls}
        {...rest}
      />
      <FieldNote id={`${id}-desc`} error={error} hint={hint} />
    </div>
  );
}

export function SelectField({
  label,
  name,
  error,
  hint,
  className,
  options,
  id: idProp,
  ...rest
}: FieldProps & { options: { value: string; label: string }[] } & Omit<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    "name"
  >) {
  const id = idProp ?? `f-${name}`;
  return (
    <div className={className}>
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
      <select
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${id}-desc` : undefined}
        className={inputCls}
        {...rest}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <FieldNote id={`${id}-desc`} error={error} hint={hint} />
    </div>
  );
}

export function CheckboxField({
  label,
  name,
  hint,
  className,
  id: idProp,
  ...rest
}: Omit<FieldProps, "error"> & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name" | "type">) {
  const id = idProp ?? `f-${name}`;
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <input id={id} name={name} type="checkbox" className="mt-1 size-4 accent-chocolate" {...rest} />
      <div>
        <label htmlFor={id} className="text-sm text-cocoa">
          {label}
        </label>
        {hint && <p className="text-xs text-cocoa/60">{hint}</p>}
      </div>
    </div>
  );
}

function FieldNote({ id, error, hint }: { id: string; error?: string; hint?: React.ReactNode }) {
  if (!error && !hint) return null;
  return (
    <p id={id} className={cn("mt-1 text-xs", error ? "text-terracotta" : "text-cocoa/55")}>
      {error ?? hint}
    </p>
  );
}
