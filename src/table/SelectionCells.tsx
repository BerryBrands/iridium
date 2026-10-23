import { Checkbox, Table } from '@radix-ui/themes';
import type { RowSelection } from './useRowSelection.js';

/**
 * The header cell with the select-all box, for a table that builds its own `Table.Root`.
 *
 * @param props - Every row that the table lists now, and the selection of the table.
 */
export function SelectAllCell<TRow>({ rows, selection }: { rows: readonly TRow[]; selection: RowSelection<TRow> }) {
  const allSelected = rows.length > 0 && rows.every((row) => selection.isSelected(row));

  return (
    <Table.ColumnHeaderCell data-cell="select" style={{ width: 40 }}>
      <Checkbox checked={allSelected} onCheckedChange={() => selection.toggleAll(rows)} />
    </Table.ColumnHeaderCell>
  );
}

/**
 * The body cell with the checkbox of one row. The click stops here, so the box adds to the selection while a click on
 * the row replaces it.
 *
 * @param props - The row of the cell, and the selection of the table.
 */
export function SelectRowCell<TRow>({ row, selection }: { row: TRow; selection: RowSelection<TRow> }) {
  return (
    <Table.Cell data-cell="select" onClick={(e) => e.stopPropagation()} style={{ verticalAlign: 'middle' }}>
      <Checkbox checked={selection.isSelected(row)} onCheckedChange={() => selection.toggle(row)} />
    </Table.Cell>
  );
}
