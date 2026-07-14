import { useEffect, useId, useRef } from "react";
import type { KeyboardEvent, ReactNode } from "react";

const focusableSelector =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector))
    .filter((element) => !element.hasAttribute("disabled"))
    .filter((element) => !element.getAttribute("aria-hidden"));
};

interface ConfigurationProps {
  isOpen: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}

export function Configuration({
  isOpen,
  title,
  description,
  onClose,
  children,
}: ConfigurationProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusables = getFocusableElements(dialog);
    const target = focusables[0] ?? dialog;
    target.focus();
  }, [isOpen]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
      return;
    }

    if (event.key !== "Tab") return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusables = getFocusableElements(dialog);
    if (focusables.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const activeElement = document.activeElement;

    if (event.shiftKey && activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close configuration"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="relative w-[min(520px,92%)] max-h-[85%] overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950/95 text-white shadow-2xl"
      >
        <div className="px-5 py-4 border-b border-white/10">
          <div className="text-sm uppercase tracking-[0.3em] text-white/40">
            Configuration
          </div>
          <div id={titleId} className="text-lg font-semibold text-white mt-1">
            {title}
          </div>
          {description ? (
            <p id={descriptionId} className="text-xs text-white/60 mt-1">
              {description}
            </p>
          ) : null}
        </div>
        <div className="px-5 py-4 space-y-4">{children}</div>
        <div className="px-5 py-4 border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
