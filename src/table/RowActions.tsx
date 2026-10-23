import { DropdownMenu, Flex, IconButton, Tooltip } from '@radix-ui/themes';
import { DotsHorizontalIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import type { DataTableColumn } from './DataTable.js';

/** The props of {@link RowActions}. */
export interface RowActionsProps<TRow> {
  row: TRow;
  /** Without it, the edit button does not show. */
  onEdit?: (row: TRow) => void;
  onDelete: (row: TRow) => void;
  editLabel: string;
  deleteLabel: string;
}

/**
 * The edit and delete icon buttons at the end of a row.
 *
 * @param props - See {@link RowActionsProps}.
 */
export function RowActions<TRow>({ row, onEdit, onDelete, editLabel, deleteLabel }: RowActionsProps<TRow>) {
  return (
    <Flex gap="2" justify="end">
      {onEdit && (
        <Tooltip content={editLabel}>
          <IconButton
            size="1"
            variant="ghost"
            color="gray"
            aria-label={editLabel}
            onClick={() => onEdit(row)}
            style={{ cursor: 'pointer' }}
          >
            <Pencil1Icon />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip content={deleteLabel}>
        <IconButton
          size="1"
          variant="ghost"
          color="red"
          aria-label={deleteLabel}
          onClick={() => onDelete(row)}
          style={{ cursor: 'pointer' }}
        >
          <TrashIcon />
        </IconButton>
      </Tooltip>
    </Flex>
  );
}

/** One entry of a {@link RowActionsMenu}. */
export interface RowMenuItem {
  id: string;
  label: string;
  onSelect: () => void;
  /** Shows the entry in red, for a destructive action. */
  danger?: boolean;
}

/**
 * A menu of row actions behind a "more" button at the end of a row. It renders nothing without items.
 *
 * @param props - The items and the accessible name of the button.
 */
export function RowActionsMenu({ items, label }: { items: readonly RowMenuItem[]; label: string }) {
  if (items.length === 0) return null;

  return (
    <Flex justify="end">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton size="1" variant="ghost" color="gray" aria-label={label} style={{ cursor: 'pointer' }}>
            <DotsHorizontalIcon />
          </IconButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end" size="1">
          {items.map((item) => (
            <DropdownMenu.Item key={item.id} color={item.danger ? 'red' : undefined} onSelect={item.onSelect}>
              {item.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </Flex>
  );
}

/**
 * The column at the end of a {@link DataTable} with the content of `render`. A click in it does not reach the row, so
 * an action does not also open the row.
 *
 * @param header - The header of the column.
 * @param render - The actions of a row.
 * @param width - The width of the column. The default is 90 px.
 */
export function actionsColumn<TRow>(
  header: string,
  render: (row: TRow) => React.ReactNode,
  width: number | string = 90,
): DataTableColumn<TRow> {
  return {
    key: '__actions',
    header,
    align: 'right',
    width,
    mobile: 'actions',
    render: (row) => <span onClick={(event) => event.stopPropagation()}>{render(row)}</span>,
  };
}
