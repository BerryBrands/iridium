import { IconButton, Tooltip } from '@radix-ui/themes';
import { CheckIcon, CopyIcon } from '@radix-ui/react-icons';
import { useCopied } from './useCopied.js';

/** The props of {@link CopyButton}. */
export interface CopyButtonProps {
  /** The text to put on the clipboard. */
  value: string;
  /** The accessible name and the tooltip of the button. */
  label: string;
}

/**
 * A small icon button that copies `value` to the clipboard. It shows a check mark for a short time after a copy.
 *
 * @param props - See {@link CopyButtonProps}.
 */
export function CopyButton({ value, label }: CopyButtonProps) {
  const { copied, copy } = useCopied();

  return (
    <Tooltip content={label}>
      <IconButton size="1" variant="ghost" color="gray" onClick={() => copy(value)} style={{ cursor: 'pointer' }} aria-label={label}>
        {copied ? <CheckIcon /> : <CopyIcon />}
      </IconButton>
    </Tooltip>
  );
}
