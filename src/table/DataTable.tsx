import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { AlertDialog, Badge, Box, Button, Checkbox, Dialog, Flex, IconButton, Spinner, Table, Text, TextField } from '@radix-ui/themes';
import { Cross2Icon, MagnifyingGlassIcon, MixerHorizontalIcon, ReloadIcon, TrashIcon } from '@radix-ui/react-icons';
import { useIsMobileViewport } from '../state/useIsMobileViewport.js';
import { TablePagination } from './TablePagination.js';
import rt from './responsiveTable.module.css';
import s from './table.module.css';

/** The key of a row. */
export type RowId = string | number;

/**
 * The place of a column in the phone card of a row. `field` shows the cell as a label and value row. See
 * {@link tableClasses} for the layout.
 */
export type ColumnMobile = 'primary' | 'media' | 'actions' | 'hidden' | 'field';

/** One column of a {@link DataTable}. */
export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  /** The text that the search matches for this column. A column without it is not searched. */
  searchable?: (row: T) => string;
  align?: 'left' | 'right' | 'center';
  width?: number | string;
  /**
   * The place of the cell in the phone card. Without it the table selects one: `id` is hidden, `image` is the media,
   * `actions` (or `__actions`, or `links`) are the actions, and the first searchable column is the primary line.
   */
  mobile?: ColumnMobile;
}

/** Every string of a {@link DataTable}. Start from {@link englishDataTableLabels}. */
export interface DataTableLabels {
  searchPlaceholder: string;
  clearSearch: string;
  refresh: string;
  showFilters: string;
  filtersTitle: string;
  filtersDescription: string;
  close: string;
  /** The chip of a filter that came from the URL. */
  filterActive: (filter: string) => string;
  selected: (count: number) => string;
  delete: string;
  deleteTitle: string;
  deleteDescription: (count: number) => string;
  deleteConfirm: string;
  cancel: string;
  range: (start: number, end: number, total: number) => string;
  perPage: (size: number) => string;
  pageOf: (page: number, totalPages: number) => string;
  first: string;
  previous: string;
  next: string;
  last: string;
}

/** English strings for {@link DataTable}. */
export const englishDataTableLabels: DataTableLabels = {
  searchPlaceholder: 'Search',
  clearSearch: 'Clear search',
  refresh: 'Refresh',
  showFilters: 'Filters',
  filtersTitle: 'Filters',
  filtersDescription: 'Show only the rows that match.',
  close: 'Close',
  filterActive: (filter) => `Filtered: ${filter}`,
  selected: (count) => `${count} selected`,
  delete: 'Delete',
  deleteTitle: 'Delete the selected rows?',
  deleteDescription: (count) => `${count} ${count === 1 ? 'row' : 'rows'} will be deleted. You cannot undo this.`,
  deleteConfirm: 'Delete',
  cancel: 'Cancel',
  range: (start, end, total) => `${start}–${end} of ${total}`,
  perPage: (size) => `${size} per page`,
  pageOf: (page, totalPages) => `${page} / ${totalPages}`,
  first: 'First page',
  previous: 'Previous page',
  next: 'Next page',
  last: 'Last page',
};

/** The props of {@link DataTable}. */
export interface DataTableProps<T> {
  rows: readonly T[];
  columns: DataTableColumn<T>[];
  /** The strings of the table. Missing strings come from {@link englishDataTableLabels}. */
  labels?: Partial<DataTableLabels>;
  /** The text when no row matches. */
  emptyLabel: string;
  /** How to key a row. The default is its `id`. */
  getRowId?: (row: T) => RowId;
  /** While true, the table shows a spinner. */
  loading?: boolean;
  /** An error to show in place of the table. */
  error?: string | null;
  /** Shows a reload button on the toolbar. */
  onRefresh?: () => void;
  /** Controls that always show at the end of the toolbar, for example a view toggle. */
  toolbarActions?: ReactNode;
  /** The primary action, for example an "Add" button. A selection replaces it with the bulk actions. */
  primaryAction?: ReactNode;
  /** Bulk actions next to Delete while rows are selected. */
  bulkActions?: (ids: RowId[], clearSelection: () => void) => ReactNode;
  /** The search text at the start, for example a filter from the URL. It shows as a chip with `onClearFilter`. */
  initialFilter?: string;
  onClearFilter?: () => void;
  onRowClick?: (row: T) => void;
  /** Called when the person confirms the deletion of the selected rows. */
  onDeleteSelected?: (ids: RowId[]) => void | Promise<void>;
  /** Shows the selection checkboxes. */
  selectable?: boolean;
  /** Makes the selection controlled: the table shows these rows as selected and reports each change. */
  selectedRows?: T[];
  onSelectionChange?: (rows: T[]) => void;
  /** A change of this value clears the selection, for example after a mutation. */
  selectionResetKey?: unknown;
  /** Filters the rows before the search, for example from dropdown filters. */
  rowFilter?: (row: T) => boolean;
  /** `list` (the default) is the column table. `grid` shows `renderCard` for each row. */
  view?: 'list' | 'grid';
  /** The card of a row in the grid. A phone uses the grid when this is given. */
  renderCard?: (row: T) => ReactNode;
  /** Filter controls. They open in a dialog from a toolbar button, so the toolbar stays compact. */
  filters?: ReactNode;
  /** The number of active filters, as a badge on the filter button. */
  filtersActiveCount?: number;
  /** The first page size. The default is 25. */
  initialPageSize?: number;
  /** The toolbar icons. Each one has a default from `@radix-ui/react-icons`. */
  icons?: Partial<DataTableIcons>;
}

/** The icons of the {@link DataTable} toolbar. */
export interface DataTableIcons {
  filters: ReactNode;
  delete: ReactNode;
  refresh: ReactNode;
}

const DEFAULT_ICONS: DataTableIcons = {
  filters: <MixerHorizontalIcon />,
  delete: <TrashIcon />,
  refresh: <ReloadIcon />,
};

/** The keys of the columns that hold the row buttons. */
const ACTION_KEYS = new Set(['actions', '__actions']);

/**
 * Gives each column its place in the phone card. Explicit values come first. The primary, media and actions places
 * get one column each at most, because two cells in one grid area overlap.
 *
 * @param columns - The columns of the table.
 */
function resolveMobileCells<T>(columns: DataTableColumn<T>[]): ColumnMobile[] {
  const result: (ColumnMobile | undefined)[] = columns.map((col) => col.mobile);
  const taken = new Set<ColumnMobile | undefined>(
    result.filter((value) => value === 'primary' || value === 'media' || value === 'actions'),
  );

  function assign(slot: ColumnMobile, match: (col: DataTableColumn<T>) => boolean) {
    if (taken.has(slot)) return;

    const index = columns.findIndex((col, i) => result[i] === undefined && match(col));

    if (index === -1) return;
    result[index] = slot;
    taken.add(slot);
  }

  columns.forEach((col, i) => {
    if (result[i] === undefined && col.key === 'id') result[i] = 'hidden';
  });
  assign('media', (col) => col.key === 'image');
  assign('actions', (col) => ACTION_KEYS.has(col.key));
  assign('actions', (col) => col.key === 'links');
  assign('primary', (col) => col.searchable !== undefined);

  return result.map((value) => value ?? 'field');
}

function defaultRowId(row: unknown): RowId {
  return (row as { id: RowId }).id;
}

/**
 * The common table of a console page: a toolbar with a search, filters and actions; the rows as a table or a card
 * grid; and the pagination bar. The search matches the columns with a `searchable` extractor, on the client.
 *
 * The selection checkboxes, the filter chip and the bulk delete dialog render only when their props are set, so a
 * simple table stays simple. Below the mobile breakpoint each row is a card.
 *
 * The table does not load data. Give it the rows, and set `loading` and `error` while they load.
 *
 * @param props - See {@link DataTableProps}.
 */
export function DataTable<T>({
  rows,
  columns,
  labels: labelOverrides,
  emptyLabel,
  getRowId = defaultRowId,
  loading = false,
  error = null,
  onRefresh,
  toolbarActions,
  primaryAction,
  bulkActions,
  initialFilter,
  onClearFilter,
  onRowClick,
  onDeleteSelected,
  selectable = false,
  selectedRows,
  onSelectionChange,
  selectionResetKey,
  rowFilter,
  view = 'list',
  renderCard,
  filters,
  filtersActiveCount = 0,
  initialPageSize = 25,
  icons: iconOverrides,
}: DataTableProps<T>) {
  const labels = { ...englishDataTableLabels, ...labelOverrides };
  const icons = { ...DEFAULT_ICONS, ...iconOverrides };
  const isMobile = useIsMobileViewport();
  const [query, setQuery] = useState(initialFilter ?? '');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [ownSelection, setOwnSelection] = useState<T[]>([]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [appliedFilter, setAppliedFilter] = useState(initialFilter);

  // A new filter from the caller replaces the search text. The state changes during the render and not in an effect,
  // so the table does not render the old search first.
  if (appliedFilter !== initialFilter) {
    setAppliedFilter(initialFilter);
    setQuery(initialFilter ?? '');
    setPage(1);
  }

  const selection = selectedRows ?? ownSelection;
  const selected = useMemo(() => new Set(selection.map(getRowId)), [selection, getRowId]);

  const applySelection = useCallback(
    (next: T[]) => {
      if (selectedRows == null) setOwnSelection(next);

      onSelectionChange?.(next);
    },
    [selectedRows, onSelectionChange],
  );

  // The refs let the reset below run without a memoised `onSelectionChange` from the caller.
  const selectionRef = useRef(selection);
  const applyRef = useRef(applySelection);

  selectionRef.current = selection;
  applyRef.current = applySelection;

  useEffect(() => {
    if (selectionRef.current.length > 0) applyRef.current([]);
  }, [selectionResetKey]);

  const filtered = useMemo(() => {
    const base = rowFilter ? rows.filter(rowFilter) : rows;
    const q = query.trim().toLowerCase();

    if (!q) return base;

    return base.filter((row) => columns.some((col) => col.searchable?.(row).toLowerCase().includes(q) ?? false));
  }, [rows, query, columns, rowFilter]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = total === 0 ? 0 : (safePage - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const visible = filtered.slice(start, end);
  const rangeStart = total === 0 ? 0 : start + 1;

  const allVisibleSelected = visible.length > 0 && visible.every((row) => selected.has(getRowId(row)));
  const mobileCells = useMemo(() => resolveMobileCells(columns), [columns]);
  // A phone has no space for a wide table, so the cards replace it when the caller gives them.
  const effectiveView = isMobile && renderCard ? 'grid' : view;

  function toggleRow(row: T) {
    const id = getRowId(row);

    applySelection(selected.has(id) ? selection.filter((r) => getRowId(r) !== id) : [...selection, row]);
  }

  function toggleAll() {
    const visibleIds = new Set(visible.map(getRowId));
    const others = selection.filter((r) => !visibleIds.has(getRowId(r)));

    applySelection(allVisibleSelected ? others : [...others, ...visible]);
  }

  async function handleDeleteSelected() {
    if (!onDeleteSelected || selected.size === 0) return;
    setDeleting(true);

    try {
      await onDeleteSelected([...selected]);
      applySelection([]);
      setDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  }

  function handleCardKeyDown(event: KeyboardEvent, row: T) {
    if (event.target !== event.currentTarget || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    onRowClick?.(row);
  }

  if (loading) {
    return (
      <Flex align="center" justify="center" py="9" style={{ height: '100%' }}>
        <Spinner />
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex align="center" justify="center" direction="column" gap="3" py="9" style={{ height: '100%' }}>
        <Text color="red" size="2">
          {error}
        </Text>
      </Flex>
    );
  }

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <Flex align="center" gap="3" mb="3" wrap="wrap" className={s.toolbar}>
        <TextField.Root
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder={labels.searchPlaceholder}
          aria-label={labels.searchPlaceholder}
          size="2"
          className={s.search}
        >
          <TextField.Slot side="left">
            <MagnifyingGlassIcon width={14} height={14} />
          </TextField.Slot>
          {query && (
            <TextField.Slot side="right">
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setPage(1);
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', padding: 0 }}
                aria-label={labels.clearSearch}
              >
                <Cross2Icon width={12} height={12} />
              </button>
            </TextField.Slot>
          )}
        </TextField.Root>

        {filters && (
          <Button size="2" variant="soft" color="gray" onClick={() => setFiltersOpen(true)} style={{ cursor: 'pointer' }}>
            {icons.filters}
            {labels.showFilters}
            {filtersActiveCount > 0 && (
              <Badge size="1" variant="solid" color="blue" radius="full">
                {filtersActiveCount}
              </Badge>
            )}
          </Button>
        )}

        {initialFilter && onClearFilter && (
          <Badge size="2" variant="surface" color="blue" style={{ cursor: 'pointer', gap: 4 }} onClick={onClearFilter}>
            {labels.filterActive(initialFilter)}
            <Cross2Icon width={10} height={10} />
          </Badge>
        )}

        <Flex gap="2" align="center" wrap="wrap" className={s.toolbarEnd}>
          {toolbarActions}
          {selectable && selected.size > 0 ? (
            <>
              <Text size="2" color="gray">
                {labels.selected(selected.size)}
              </Text>
              {bulkActions?.([...selected], () => applySelection([]))}
              {onDeleteSelected && (
                <Button size="2" variant="soft" color="red" onClick={() => setDeleteOpen(true)} style={{ cursor: 'pointer' }}>
                  {icons.delete} {labels.delete}
                </Button>
              )}
            </>
          ) : (
            <>
              {onRefresh && (
                <IconButton
                  size="2"
                  variant="soft"
                  color="gray"
                  onClick={onRefresh}
                  aria-label={labels.refresh}
                  style={{ cursor: 'pointer' }}
                >
                  {icons.refresh}
                </IconButton>
              )}
              {primaryAction}
            </>
          )}
        </Flex>
      </Flex>

      {total === 0 ? (
        <Flex direction="column" align="center" justify="center" gap="3" style={{ flex: 1, minHeight: 0 }}>
          <Text size="2" color="gray">
            {emptyLabel}
          </Text>
        </Flex>
      ) : (
        <>
          <Box style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
            {effectiveView === 'grid' && renderCard ? (
              <Box className={s.grid}>
                {visible.map((row) =>
                  onRowClick ? (
                    <Box
                      key={getRowId(row)}
                      role="button"
                      tabIndex={0}
                      className={s.card}
                      onClick={() => onRowClick(row)}
                      onKeyDown={(e) => handleCardKeyDown(e, row)}
                    >
                      {renderCard(row)}
                    </Box>
                  ) : (
                    <Box key={getRowId(row)}>{renderCard(row)}</Box>
                  ),
                )}
              </Box>
            ) : (
              <Box style={{ overflowX: 'auto' }}>
                <Table.Root variant="surface" size="2" className={rt.stack}>
                  <Table.Header>
                    <Table.Row>
                      {selectable && (
                        <Table.ColumnHeaderCell data-cell="select" style={{ width: 40 }}>
                          <Checkbox checked={allVisibleSelected} onCheckedChange={toggleAll} />
                        </Table.ColumnHeaderCell>
                      )}
                      {columns.map((col) => (
                        <Table.ColumnHeaderCell key={col.key} style={{ width: col.width, textAlign: col.align ?? 'left' }}>
                          {col.header}
                        </Table.ColumnHeaderCell>
                      ))}
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {visible.map((row) => {
                      const id = getRowId(row);

                      return (
                        <Table.Row
                          key={id}
                          // A selected row shows twice, by its checkbox and by a tint, so the selection reads at a glance.
                          style={{
                            cursor: onRowClick ? 'pointer' : undefined,
                            background: selected.has(id) ? 'var(--accent-a3)' : undefined,
                          }}
                          onClick={() => onRowClick?.(row)}
                        >
                          {selectable && (
                            <Table.Cell data-cell="select" onClick={(e) => e.stopPropagation()} style={{ verticalAlign: 'middle' }}>
                              <Checkbox checked={selected.has(id)} onCheckedChange={() => toggleRow(row)} />
                            </Table.Cell>
                          )}
                          {columns.map((col, index) => (
                            <Table.Cell
                              key={col.key}
                              data-cell={mobileCells[index] === 'field' ? undefined : mobileCells[index]}
                              data-label={col.header}
                              style={{
                                verticalAlign: 'middle',
                                textAlign: col.align ?? 'left',
                                fontVariantNumeric: col.align === 'right' ? 'tabular-nums' : undefined,
                              }}
                            >
                              {col.render(row)}
                            </Table.Cell>
                          ))}
                        </Table.Row>
                      );
                    })}
                  </Table.Body>
                </Table.Root>
              </Box>
            )}
          </Box>

          <TablePagination
            page={safePage}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            rangeLabel={labels.range(rangeStart, end, total)}
            perPageLabel={labels.perPage}
            pageLabel={labels.pageOf}
            firstLabel={labels.first}
            previousLabel={labels.previous}
            nextLabel={labels.next}
            lastLabel={labels.last}
          />
        </>
      )}

      {filters && (
        <Dialog.Root open={filtersOpen} onOpenChange={setFiltersOpen}>
          <Dialog.Content maxWidth="440px">
            <Dialog.Title>{labels.filtersTitle}</Dialog.Title>
            <Dialog.Description size="2" color="gray" mb="4">
              {labels.filtersDescription}
            </Dialog.Description>
            <Flex direction="column" gap="4">
              {filters}
            </Flex>
            <Flex justify="end" mt="4">
              <Dialog.Close>
                <Button variant="soft" color="gray" style={{ cursor: 'pointer' }}>
                  {labels.close}
                </Button>
              </Dialog.Close>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>
      )}

      {selectable && onDeleteSelected && (
        <AlertDialog.Root open={deleteOpen} onOpenChange={(open) => !open && setDeleteOpen(false)}>
          <AlertDialog.Content maxWidth="420px">
            <AlertDialog.Title>{labels.deleteTitle}</AlertDialog.Title>
            <AlertDialog.Description size="2">{labels.deleteDescription(selected.size)}</AlertDialog.Description>
            <Flex gap="3" mt="4" justify="end">
              <AlertDialog.Cancel>
                <Button variant="soft" color="gray" style={{ cursor: 'pointer' }}>
                  {labels.cancel}
                </Button>
              </AlertDialog.Cancel>
              <Button
                color="red"
                variant="solid"
                onClick={() => void handleDeleteSelected()}
                loading={deleting}
                style={{ cursor: 'pointer' }}
              >
                {labels.deleteConfirm}
              </Button>
            </Flex>
          </AlertDialog.Content>
        </AlertDialog.Root>
      )}
    </Box>
  );
}
