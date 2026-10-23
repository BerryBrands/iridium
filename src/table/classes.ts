import rt from './responsiveTable.module.css';

/**
 * The class names of the responsive table layout, for a hand-built Radix `Table.Root`.
 *
 * - `stack`: below the mobile breakpoint each body row is a card. A cell selects its place in the card with
 *   `data-cell` (`primary`, `media`, `select`, `actions`, `hidden`). Another cell shows as a label and value row, with
 *   the label from `data-label`.
 * - `stickyFirst`: below the breakpoint the table scrolls sideways and the first column stays in view.
 */
export const tableClasses: { readonly stack: string; readonly stickyFirst: string } = {
  stack: rt.stack,
  stickyFirst: rt.stickyFirst,
};
