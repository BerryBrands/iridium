import { useCallback, useEffect, useRef, useState } from 'react';

/** How long a copy control shows its confirmation. */
export const COPIED_FEEDBACK_MS = 1500;

/**
 * Copies text to the clipboard and keeps a flag true for a short time after a successful copy.
 *
 * @returns The flag and the copy function. A refused clipboard write changes nothing.
 */
export function useCopied(): { copied: boolean; copy: (value: string) => void } {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = useCallback((value: string) => {
    navigator.clipboard.writeText(value).then(
      () => {
        setCopied(true);

        if (timer.current) clearTimeout(timer.current);

        timer.current = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
      },
      () => undefined,
    );
  }, []);

  return { copied, copy };
}
