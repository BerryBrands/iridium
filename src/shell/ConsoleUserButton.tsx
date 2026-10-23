import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { Button, Text } from '@radix-ui/themes';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import s from './shell.module.css';

/** The props of {@link ConsoleUserButton}. Other props go to the Radix `Button`. */
export interface ConsoleUserButtonProps extends Omit<ComponentPropsWithoutRef<typeof Button>, 'children'> {
  /** The avatar of the viewer, about 24 px. */
  avatar: ReactNode;
  /** The name of the viewer. It is also the accessible name, because a phone shows the avatar only. */
  name: string;
}

/**
 * The trigger of the user menu at the end of the header: the avatar, the name and a chevron. On a phone it shows the
 * avatar only, with a 44 px touch target. Put it in a `DropdownMenu.Trigger` of Radix Themes.
 */
export const ConsoleUserButton = forwardRef<HTMLButtonElement, ConsoleUserButtonProps>(function ConsoleUserButton(
  { avatar, name, className, style, ...props },
  ref,
) {
  return (
    <Button
      ref={ref}
      variant="ghost"
      color="gray"
      size="2"
      {...props}
      className={[s.userMenuTrigger, className].filter(Boolean).join(' ')}
      style={{ cursor: 'pointer', ...style }}
      aria-label={name}
    >
      {avatar}
      <Text size="2" weight="medium" className={s.userMenuName} style={{ maxWidth: 160 }} truncate>
        {name}
      </Text>
      <ChevronDownIcon className={s.userMenuChevron} />
    </Button>
  );
});
