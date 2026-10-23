import { Button, Flex, Select, Text } from '@radix-ui/themes';
import { ChevronLeftIcon, ChevronRightIcon, DoubleArrowLeftIcon, DoubleArrowRightIcon } from '@radix-ui/react-icons';
import s from './table.module.css';
import shell from '../shell/shell.module.css';

/** The page sizes of the size picker. */
export const PAGE_SIZES: readonly number[] = [10, 25, 50, 100];

/** The props of {@link TablePagination}. */
export interface TablePaginationProps {
  /** The current page, from 1. */
  page: number;
  pageSize: number;
  /** The number of rows on all pages. */
  total: number;
  onPageChange: (page: number) => void;
  /** Called with the new size. The caller goes back to page 1. Without it, the picker does not show. */
  onPageSizeChange?: (pageSize: number) => void;
  /** The range summary, for example "1–25 of 210". */
  rangeLabel: string;
  /** The text of each size option. */
  perPageLabel: (size: number) => string;
  /** The text between the buttons. The default is `<page> / <pages>`. */
  pageLabel?: (page: number, totalPages: number) => string;
  /** The accessible names of the buttons. */
  firstLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
  lastLabel?: string;
}

/**
 * The pagination bar of a table: the range summary, a page-size picker, and first, previous, next and last buttons.
 * It only shows the page that the caller gives and reports the intent, so it serves client and server pagination.
 * A phone hides the first and last buttons, so the bar fits on one line.
 *
 * @param props - See {@link TablePaginationProps}.
 */
export function TablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  rangeLabel,
  perPageLabel,
  pageLabel = (current, pages) => `${current} / ${pages}`,
  firstLabel,
  previousLabel,
  nextLabel,
  lastLabel,
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canGoBack = page > 1;
  const canGoForward = page < totalPages;

  return (
    <Flex align="center" justify="between" mt="4" gap="3" wrap="wrap" className={s.footer}>
      <Flex align="center" gap="3">
        <Text size="2" color="gray">
          {rangeLabel}
        </Text>
        {onPageSizeChange && (
          <Select.Root value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))} size="1">
            <Select.Trigger variant="soft" color="gray" />
            <Select.Content>
              {PAGE_SIZES.map((size) => (
                <Select.Item key={size} value={String(size)}>
                  {perPageLabel(size)}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        )}
      </Flex>
      <Flex align="center" gap="1" className={s.pager}>
        <Button
          size="1"
          variant="soft"
          color="gray"
          data-page-edge=""
          disabled={!canGoBack}
          aria-label={firstLabel}
          onClick={() => onPageChange(1)}
          style={{ cursor: canGoBack ? 'pointer' : 'default' }}
        >
          <DoubleArrowLeftIcon className={shell.mirror} />
        </Button>
        <Button
          size="1"
          variant="soft"
          color="gray"
          disabled={!canGoBack}
          aria-label={previousLabel}
          onClick={() => onPageChange(page - 1)}
          style={{ cursor: canGoBack ? 'pointer' : 'default' }}
        >
          <ChevronLeftIcon className={shell.mirror} />
        </Button>
        <Text size="2" style={{ minWidth: 80, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
          {pageLabel(page, totalPages)}
        </Text>
        <Button
          size="1"
          variant="soft"
          color="gray"
          disabled={!canGoForward}
          aria-label={nextLabel}
          onClick={() => onPageChange(page + 1)}
          style={{ cursor: canGoForward ? 'pointer' : 'default' }}
        >
          <ChevronRightIcon className={shell.mirror} />
        </Button>
        <Button
          size="1"
          variant="soft"
          color="gray"
          data-page-edge=""
          disabled={!canGoForward}
          aria-label={lastLabel}
          onClick={() => onPageChange(totalPages)}
          style={{ cursor: canGoForward ? 'pointer' : 'default' }}
        >
          <DoubleArrowRightIcon className={shell.mirror} />
        </Button>
      </Flex>
    </Flex>
  );
}
