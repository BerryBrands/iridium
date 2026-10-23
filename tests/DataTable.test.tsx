import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderThemed } from './helpers.js';
import { DataTable, actionsColumn, type DataTableColumn } from '../src/index.js';

interface Row {
  id: number;
  name: string;
  image: string;
}

const ROWS: Row[] = Array.from({ length: 30 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}`, image: `img-${i + 1}` }));

const COLUMNS: DataTableColumn<Row>[] = [
  { key: 'id', header: 'ID', render: (row) => row.id },
  { key: 'image', header: 'Image', render: (row) => row.image },
  { key: 'name', header: 'Name', render: (row) => row.name, searchable: (row) => row.name },
  actionsColumn<Row>('Actions', () => <button type="button">Edit</button>),
];

function bodyRows() {
  return screen.getAllByRole('row').slice(1);
}

describe('DataTable', () => {
  it('shows the first page and the range', () => {
    renderThemed(<DataTable rows={ROWS} columns={COLUMNS} emptyLabel="None" />);

    expect(bodyRows()).toHaveLength(25);
    expect(screen.getByText('1–25 of 30')).toBeInTheDocument();
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });

  it('goes to the next page', async () => {
    renderThemed(<DataTable rows={ROWS} columns={COLUMNS} emptyLabel="None" />);

    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));

    expect(bodyRows()).toHaveLength(5);
    expect(screen.getByText('26–30 of 30')).toBeInTheDocument();
  });

  it('searches the searchable columns and shows the empty label when nothing matches', async () => {
    renderThemed(<DataTable rows={ROWS} columns={COLUMNS} emptyLabel="None" />);

    await userEvent.type(screen.getByRole('textbox', { name: 'Search' }), 'Item 3');

    expect(bodyRows().map((row) => within(row).getAllByRole('cell')[2].textContent)).toEqual(['Item 3', 'Item 30']);

    await userEvent.type(screen.getByRole('textbox', { name: 'Search' }), 'x');

    expect(screen.getByText('None')).toBeInTheDocument();
  });

  it('gives each cell its place in the phone card', () => {
    renderThemed(<DataTable rows={ROWS.slice(0, 1)} columns={COLUMNS} emptyLabel="None" />);

    const cells = within(bodyRows()[0]).getAllByRole('cell');

    expect(cells.map((cell) => cell.getAttribute('data-cell'))).toEqual(['hidden', 'media', 'primary', 'actions']);
    expect(cells[2]).toHaveAttribute('data-label', 'Name');
  });

  it('selects rows and deletes them after a confirmation', async () => {
    const onDeleteSelected = vi.fn();

    renderThemed(<DataTable rows={ROWS.slice(0, 3)} columns={COLUMNS} emptyLabel="None" selectable onDeleteSelected={onDeleteSelected} />);

    const boxes = screen.getAllByRole('checkbox');

    await userEvent.click(boxes[1]);
    await userEvent.click(boxes[3]);

    expect(screen.getByText('2 selected')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Delete/ }));
    await userEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Delete' }));

    expect(onDeleteSelected).toHaveBeenCalledWith([1, 3]);
    expect(screen.queryByText('2 selected')).not.toBeInTheDocument();
  });

  it('opens a row on a click, but not on a click in the actions column', async () => {
    const onRowClick = vi.fn();

    renderThemed(<DataTable rows={ROWS.slice(0, 1)} columns={COLUMNS} emptyLabel="None" onRowClick={onRowClick} />);

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));

    expect(onRowClick).not.toHaveBeenCalled();

    await userEvent.click(screen.getByText('Item 1'));

    expect(onRowClick).toHaveBeenCalledWith(ROWS[0]);
  });

  it('clears the selection when the reset key changes', async () => {
    const { rerender } = renderThemed(
      <DataTable rows={ROWS.slice(0, 2)} columns={COLUMNS} emptyLabel="None" selectable selectionResetKey={0} />,
    );

    await userEvent.click(screen.getAllByRole('checkbox')[1]);

    expect(screen.getByText('1 selected')).toBeInTheDocument();

    rerender(<DataTable rows={ROWS.slice(0, 2)} columns={COLUMNS} emptyLabel="None" selectable selectionResetKey={1} />);

    expect(screen.queryByText('1 selected')).not.toBeInTheDocument();
  });

  it('uses a filter from the caller as the search text, and shows its chip', async () => {
    const onClearFilter = vi.fn();

    renderThemed(<DataTable rows={ROWS} columns={COLUMNS} emptyLabel="None" initialFilter="Item 7" onClearFilter={onClearFilter} />);

    expect(screen.getByRole('textbox', { name: 'Search' })).toHaveValue('Item 7');
    expect(bodyRows()).toHaveLength(1);

    await userEvent.click(screen.getByText('Filtered: Item 7'));

    expect(onClearFilter).toHaveBeenCalled();
  });

  it('shows a spinner while loading, and an error', () => {
    const { rerender } = renderThemed(<DataTable rows={[]} columns={COLUMNS} emptyLabel="None" loading />);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();

    rerender(<DataTable rows={[]} columns={COLUMNS} emptyLabel="None" error="Failed to load" />);

    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });

  it('takes translated labels', () => {
    renderThemed(
      <DataTable
        rows={ROWS}
        columns={COLUMNS}
        emptyLabel="Yok"
        labels={{ range: (a, b, c) => `${a}-${b} / ${c}`, searchPlaceholder: 'Ara' }}
      />,
    );

    expect(screen.getByText('1-25 / 30')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Ara' })).toBeInTheDocument();
  });
});
