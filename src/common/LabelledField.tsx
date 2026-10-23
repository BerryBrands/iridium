import type { ReactNode } from 'react';
import { Flex, Text } from '@radix-ui/themes';

/** The props of {@link LabelledField}. */
export interface LabelledFieldProps {
  label: string;
  /** A line under the control. An `error` replaces it. */
  hint?: string;
  error?: string;
  /** Shows the label as a caption, for a group of controls that have their own labels. */
  asGroup?: boolean;
  children: ReactNode;
}

/**
 * A form control with its label and a hint or error line.
 *
 * @param props - See {@link LabelledFieldProps}.
 */
export function LabelledField({ label, hint, error, asGroup = false, children }: LabelledFieldProps) {
  const caption = (
    <Text size="2" weight="medium">
      {label}
    </Text>
  );
  const note = (error ?? hint) && (
    <Text size="1" color={error ? 'red' : 'gray'}>
      {error ?? hint}
    </Text>
  );

  // The note is outside the <label>, so the accessible name of the control is the label only. The options of a group
  // are a list of their own, so they get a full step of space; a single input sits close under its label.
  return asGroup ? (
    <Flex direction="column" gap="2" role="group" aria-label={label}>
      {caption}
      {children}
      {note}
    </Flex>
  ) : (
    <Flex direction="column" gap="1">
      <Flex direction="column" gap="1" asChild>
        <label>
          {caption}
          {children}
        </label>
      </Flex>
      {note}
    </Flex>
  );
}
