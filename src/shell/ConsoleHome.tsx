import { useMemo, type ReactNode } from 'react';
import { Heading, IconButton, Text } from '@radix-ui/themes';
import { StarFilledIcon, StarIcon } from '@radix-ui/react-icons';
import { useConsoleConfig } from '../ConsoleProvider.js';
import { groupPath } from '../paths.js';
import { useConsoleFavourites } from '../state/preferences.js';
import type { ConsoleGroup } from '../types.js';
import { ConsoleLink } from './links.js';
import s from './shell.module.css';

/** The props of {@link ConsoleGroupCard}. */
export interface ConsoleGroupCardProps {
  group: ConsoleGroup;
  /** Whether the group is a favourite. Without `onToggleStar`, the card shows no star. */
  starred?: boolean;
  onToggleStar?: (group: ConsoleGroup) => void;
}

/**
 * A group as a card: the icon tile, the name, what the group is for, and a star.
 *
 * @param props - See {@link ConsoleGroupCardProps}.
 */
export function ConsoleGroupCard({ group, starred = false, onToggleStar }: ConsoleGroupCardProps) {
  const { basePath, labels } = useConsoleConfig();

  return (
    <div className={s.homeCard} data-ir-accent={group.accent}>
      <ConsoleLink to={groupPath(basePath, group)} href={group.href} className={s.homeCardLink}>
        <span className={s.homeCardIcon} data-ir-accent={group.accent}>
          {group.icon}
        </span>
        <span className={s.homeCardBody}>
          <span className={s.homeCardTitle}>{group.label}</span>
          {group.description != null && <span className={s.homeCardMeta}>{group.description}</span>}
        </span>
      </ConsoleLink>
      {onToggleStar && (
        <IconButton
          size="1"
          variant="ghost"
          color={starred ? 'amber' : 'gray'}
          className={s.homeCardStar}
          aria-pressed={starred}
          aria-label={starred ? labels.removeFavourite : labels.addFavourite}
          onClick={() => onToggleStar(group)}
        >
          {starred ? <StarFilledIcon /> : <StarIcon />}
        </IconButton>
      )}
    </div>
  );
}

/** A titled set of groups on the entrance page. */
export interface ConsoleHomeSection {
  id: string;
  /** The heading of the set. */
  label: ReactNode;
  /** The ids of the groups in the set. A group can be in more than one set. */
  groupIds: readonly string[];
}

/** The props of {@link ConsoleHome}. */
export interface ConsoleHomeProps {
  /** The heading of the page. The default is the `console` label. */
  title?: ReactNode;
  /** A sentence under the heading. */
  description?: ReactNode;
  /**
   * The sets of cards, in order. Without them the page shows all groups in one grid. A group that is in no set does not
   * show, except as a favourite.
   */
  sections?: readonly ConsoleHomeSection[];
  /** Turns the favourite stars off. */
  hideFavourites?: boolean;
  /** Content between the description and the cards, for example notes or a status banner. */
  children?: ReactNode;
}

/**
 * The entrance page of the console: a card for each group that the viewer can open, with the favourite groups first.
 * The cards sort by their label in the locale of the provider.
 *
 * Render it in `<ConsoleShell>` at the base path.
 *
 * @param props - See {@link ConsoleHomeProps}.
 */
export function ConsoleHome({ title, description, sections, hideFavourites = false, children }: ConsoleHomeProps) {
  const { groups, labels, locale } = useConsoleConfig();
  const { isFavourite, toggleFavourite } = useConsoleFavourites();
  const sorted = useMemo(() => {
    const collator = new Intl.Collator(locale, { sensitivity: 'base' });

    return groups
      .filter((group) => group.href != null || group.sections.length > 0 || group.landing != null)
      .sort((a, b) => collator.compare(a.label, b.label));
  }, [groups, locale]);
  const favourites = hideFavourites ? [] : sorted.filter((group) => isFavourite(group.id));
  const sets = sections ?? [{ id: 'all', label: null, groupIds: sorted.map((group) => group.id) }];
  const toggle = hideFavourites ? undefined : (group: ConsoleGroup) => toggleFavourite(group.id);

  return (
    <div className={s.home}>
      <Heading size="6" mb="1">
        {title ?? labels.console}
      </Heading>
      {description != null && (
        <Text size="2" color="gray" as="p" mb="5">
          {description}
        </Text>
      )}

      {children}

      {favourites.length > 0 && (
        <div className={s.homeGroup}>
          <Heading as="h2" size="4" mb="3">
            {labels.favourites}
          </Heading>
          <div className={s.homeGrid}>
            {favourites.map((group) => (
              <ConsoleGroupCard key={group.id} group={group} starred onToggleStar={toggle} />
            ))}
          </div>
        </div>
      )}

      {sets.map((set) => {
        const setGroups = sorted.filter((group) => set.groupIds.includes(group.id));

        if (setGroups.length === 0) return null;

        const headingId = `console-section-${set.id}`;

        return (
          <section key={set.id} className={s.homeGroup} aria-labelledby={set.label != null ? headingId : undefined}>
            {set.label != null && (
              <Heading id={headingId} as="h2" size="4" mb="3">
                {set.label}
              </Heading>
            )}
            <div className={s.homeGrid}>
              {setGroups.map((group) => (
                <ConsoleGroupCard key={group.id} group={group} starred={isFavourite(group.id)} onToggleStar={toggle} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
