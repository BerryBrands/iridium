import { useEffect, useRef } from 'react';
import { TextField } from '@radix-ui/themes';
import { Cross2Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons';

/** Props accepted by {@link DebouncedSearchField}. */
export interface DebouncedSearchFieldProps {
  /** Current text, owned by the parent so the field stays controlled. */
  value: string;
  /** Fired on every keystroke — update the controlled `value` from here. */
  onChange: (value: string) => void;
  /** Fired once the typing settles, with the trimmed text. Clearing fires it immediately. */
  onCommit: (value: string) => void;
  placeholder: string;
  /** Magnifying-glass slot on the leading edge. Off by default — one per toolbar reads better. */
  withIcon?: boolean;
  /** Accessible label for the clear button. */
  clearLabel: string;
  /** Cap on the field's width; it flexes below this. */
  maxWidth?: number;
  delayMs?: number;
}

/**
 * Search input that reports its value twice: immediately through `onChange`,
 * so the field stays responsive, and again through `onCommit` once typing
 * settles, so the caller can refetch without a request per keystroke.
 *
 * The pending timer is cancelled on unmount, so a field that disappears
 * mid-type cannot fire a commit into an unmounted parent.
 *
 * @param props - See {@link DebouncedSearchFieldProps}.
 */
export function DebouncedSearchField({
  value,
  onChange,
  onCommit,
  placeholder,
  withIcon = false,
  clearLabel,
  maxWidth = 200,
  delayMs = 300,
}: DebouncedSearchFieldProps) {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function handleChange(next: string) {
    onChange(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onCommit(next.trim()), delayMs);
  }

  function handleClear() {
    clearTimeout(timer.current);
    onChange('');
    onCommit('');
  }

  return (
    <TextField.Root
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      placeholder={placeholder}
      size="2"
      style={{ maxWidth, flex: `1 1 ${Math.round(maxWidth * 0.8)}px` }}
    >
      {withIcon && (
        <TextField.Slot side="left">
          <MagnifyingGlassIcon width={14} height={14} />
        </TextField.Slot>
      )}
      {value && (
        <TextField.Slot side="right">
          <button
            onClick={handleClear}
            aria-label={clearLabel}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', padding: 0 }}
          >
            <Cross2Icon width={12} height={12} />
          </button>
        </TextField.Slot>
      )}
    </TextField.Root>
  );
}
