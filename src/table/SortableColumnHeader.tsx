import { Text } from '@radix-ui/themes';

/** The props of {@link SortableColumnHeader}. */
export interface SortableColumnHeaderProps {
  label: string;
  /** Whether the table sorts by this column now. */
  active: boolean;
  /** The direction to show. Only read when `active`. */
  direction: 'asc' | 'desc';
  onSort: () => void;
}

/**
 * A column header that sorts the table on a click, with an arrow on the active column. Put it in a
 * `Table.ColumnHeaderCell`. On a phone, a stacked table keeps the sort buttons in its header row.
 *
 * @param props - See {@link SortableColumnHeaderProps}.
 */
export function SortableColumnHeader({ label, active, direction, onSort }: SortableColumnHeaderProps) {
  return (
    <button
      type="button"
      onClick={onSort}
      aria-sort={active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', font: 'inherit', padding: 0 }}
    >
      <Text size="2" weight="bold">
        {label}
        {active ? (direction === 'asc' ? ' ↑' : ' ↓') : ''}
      </Text>
    </button>
  );
}
