import { IconButton } from '@radix-ui/themes';
import { useConsoleConfig } from '../ConsoleProvider.js';
import { CONSOLE_GROUP_NAV_ID, useConsoleNavDrawer } from '../state/slots.js';
import s from './shell.module.css';

/**
 * The menu button that opens the group navigation drawer on a phone. It takes the place of the logo at the start of
 * the header, so the phone layout has one row of chrome only.
 */
export function ConsoleMenuButton() {
  const { labels, icons } = useConsoleConfig();
  const { open, toggle, toggleRef } = useConsoleNavDrawer();

  return (
    <IconButton
      ref={toggleRef}
      variant="ghost"
      color="gray"
      size="3"
      className={s.headerMenu}
      onClick={toggle}
      aria-expanded={open}
      aria-controls={CONSOLE_GROUP_NAV_ID}
      aria-label={open ? labels.closeMenu : labels.openMenu}
    >
      {icons.menu}
    </IconButton>
  );
}
