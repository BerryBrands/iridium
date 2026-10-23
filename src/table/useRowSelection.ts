import { useCallback, useMemo, useState, type Dispatch, type SetStateAction } from 'react';

/** Anything a row can be keyed by. */
export type RowKey = string | number;

/** The row selection of one table, and the edit target that it gives. */
export interface RowSelection<TRow> {
  selection: TRow[];
  /** Keys of the selected rows, for membership tests. */
  ids: Set<RowKey>;
  /** How this table keys its rows. */
  idOf: (row: TRow) => RowKey;
  /** React setter, so callers can update from the previous selection. */
  setSelection: Dispatch<SetStateAction<TRow[]>>;
  /** Adds or removes one row — what a checkbox does. */
  toggle: (row: TRow) => void;
  /** Replaces the selection with one row — what a row click does. */
  selectOnly: (row: TRow) => void;
  toggleAll: (rows: readonly TRow[]) => void;
  clear: () => void;
  isSelected: (row: TRow) => boolean;
  /** The one selected row, or `null` when none or several are. */
  editTarget: TRow | null;
}

function defaultIdOf(row: unknown): RowKey {
  return (row as { id: RowKey }).id;
}

/**
 * The row selection of a table, and the edit target that it gives.
 *
 * Selecting is the gesture that opens the editor: exactly one selected row is
 * something to edit; none or several are not, so the editor closes — with
 * several, there is no one row the form could be about.
 *
 * The two ways to select mean different things, which is why they are separate
 * functions. Clicking a row body means "this one" and replaces the selection
 * ({@link RowSelection.selectOnly}), so moving between rows keeps the editor
 * following along instead of piling up a multi-selection. The checkbox means
 * "this one as well" and adds to it ({@link RowSelection.toggle}), which is how
 * a bulk action gets built up. Clicking the row that is already the only
 * selection clears it, so the same gesture that opened the editor closes it.
 *
 * @param getId - How to key a row, for tables whose identifier is not `id`
 *   (for example a record keyed on `external_id`).
 */
export function useRowSelection<TRow extends { id: RowKey }>(): RowSelection<TRow>;

export function useRowSelection<TRow>(getId: (row: TRow) => RowKey): RowSelection<TRow>;

export function useRowSelection<TRow>(getId?: (row: TRow) => RowKey): RowSelection<TRow> {
  const [selection, setSelection] = useState<TRow[]>([]);
  const idOf = getId ?? (defaultIdOf as (row: TRow) => RowKey);
  const ids = useMemo(() => new Set(selection.map(idOf)), [selection, idOf]);

  const toggle = useCallback(
    (row: TRow) => {
      setSelection((prev) => (prev.some((r) => idOf(r) === idOf(row)) ? prev.filter((r) => idOf(r) !== idOf(row)) : [...prev, row]));
    },
    [idOf],
  );

  const selectOnly = useCallback(
    (row: TRow) => {
      setSelection((prev) => (prev.length === 1 && idOf(prev[0]) === idOf(row) ? [] : [row]));
    },
    [idOf],
  );

  const toggleAll = useCallback(
    (rows: readonly TRow[]) => {
      setSelection((prev) => (rows.every((row) => prev.some((r) => idOf(r) === idOf(row))) ? [] : [...rows]));
    },
    [idOf],
  );

  const clear = useCallback(() => setSelection([]), []);

  return {
    selection,
    ids,
    idOf,
    setSelection,
    toggle,
    selectOnly,
    toggleAll,
    clear,
    isSelected: (row: TRow) => ids.has(idOf(row)),
    editTarget: selection.length === 1 ? selection[0] : null,
  };
}

/**
 * Props to spread on a table row so clicking its body selects it — the click
 * target being the row, not just a checkbox — and a selected row is tinted.
 *
 * @param row - The row the props are for.
 * @param selection - The table's selection state.
 */
export function selectableRowProps<TRow>(row: TRow, selection: RowSelection<TRow>) {
  return {
    onClick: () => selection.selectOnly(row),
    style: { cursor: 'pointer', background: selection.isSelected(row) ? 'var(--accent-a3)' : undefined },
  };
}
