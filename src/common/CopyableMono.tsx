import type { MouseEvent } from 'react';
import { Tooltip } from '@radix-ui/themes';
import { CheckIcon, CopyIcon } from '@radix-ui/react-icons';
import { useCopied } from './useCopied.js';
import s from './copyableMono.module.css';

/** The props of {@link CopyableMono}. */
export interface CopyableMonoProps {
  /** The text to copy. */
  value: string;
  /** A short caption before the value, for example `ID`. */
  label: string;
  /** The tooltip before a copy. */
  tooltip: string;
  /** The tooltip after a copy. */
  copiedLabel: string;
  /** A shorter form of the value to show, for example the first part of a UUID. */
  displayValue?: string;
}

/**
 * A compact label and value row in monospace. A click copies `value`, and the icon and the tooltip show a
 * confirmation for a short time.
 *
 * @param props - See {@link CopyableMonoProps}.
 */
export function CopyableMono({ value, label, tooltip, copiedLabel, displayValue }: CopyableMonoProps) {
  const { copied, copy } = useCopied();

  function handleCopy(event: MouseEvent) {
    // The row is often in a menu or a link, which must not also act on the click.
    event.preventDefault();
    event.stopPropagation();
    copy(value);
  }

  return (
    <Tooltip content={copied ? copiedLabel : tooltip}>
      <button type="button" onClick={handleCopy} className={s.copy}>
        <span className={s.copyLabel}>{label}</span>
        <span className={s.copyValue}>{displayValue ?? value}</span>
        {copied ? <CheckIcon width={10} height={10} /> : <CopyIcon width={10} height={10} />}
      </button>
    </Tooltip>
  );
}
