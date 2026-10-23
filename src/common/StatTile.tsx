import { Card, Flex, Text } from '@radix-ui/themes';
import s from './statTile.module.css';

/** The props of {@link StatTile}. */
export interface StatTileProps {
  /** What the figure counts, in sentence case. */
  label: string;
  /** The formatted figure. */
  value: string;
  /** The full figure, when `value` is compact. */
  title?: string;
  /** A line that explains the figure. */
  caption?: string;
  /** Shows the value smaller, for a narrow panel. */
  compact?: boolean;
}

/**
 * One headline figure: a short label above a large value, with an optional caption. The tile shows no colour, because
 * a figure has no good or bad direction.
 *
 * @param props - See {@link StatTileProps}.
 */
export function StatTile({ label, value, title, caption, compact = false }: StatTileProps) {
  return (
    <Card className={s.tile} data-stat-tile="">
      <Flex direction="column" gap="1">
        <Text as="p" size="1" color="gray">
          {label}
        </Text>
        <Text as="p" size={compact ? '4' : '6'} className={s.value} title={title}>
          {value}
        </Text>
        {caption && (
          <Text as="p" size="1" color="gray">
            {caption}
          </Text>
        )}
      </Flex>
    </Card>
  );
}
