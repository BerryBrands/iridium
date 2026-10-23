import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { Theme } from '@radix-ui/themes';

import { CopyableMono } from '../src/index.js';

class ResizeObserverStub {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

vi.stubGlobal('ResizeObserver', ResizeObserverStub);
vi.stubGlobal(
  'matchMedia',
  vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
);

function renderMono(props: Partial<{ value: string; label: string; tooltip: string; displayValue?: string }> = {}) {
  return render(
    <Theme>
      <CopyableMono
        value={props.value ?? 'full-value-123'}
        label={props.label ?? 'ID'}
        tooltip={props.tooltip ?? 'console.user.copyId'}
        copiedLabel="common.copied"
        displayValue={props.displayValue}
      />
    </Theme>,
  );
}

describe('CopyableMono', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the label and the displayValue in monospace when displayValue is given', () => {
    renderMono({ label: 'External ID', value: 'abcdef12-3456-7890', displayValue: 'abcdef12' });

    expect(screen.queryByText('External ID')).not.toBeNull();
    expect(screen.queryByText('abcdef12')).not.toBeNull();
    expect(screen.queryByText('abcdef12-3456-7890')).toBeNull();
  });

  it('renders value itself when no displayValue is given', () => {
    renderMono({ label: 'ID', value: '42' });

    expect(screen.queryByText('ID')).not.toBeNull();
    expect(screen.queryByText('42')).not.toBeNull();
  });

  it('copies the full value (not displayValue) to the clipboard on click', async () => {
    renderMono({ value: 'full-value-123', displayValue: 'short' });

    fireEvent.click(screen.getByText('short').closest('button')!);

    await vi.waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith('full-value-123'));
    expect(navigator.clipboard.writeText).not.toHaveBeenCalledWith('short');
  });

  it('flips the icon to a checkmark on copy and reverts after 1.5s', async () => {
    renderMono({ value: 'full-value-123' });

    const button = screen.getByText('full-value-123').closest('button')!;
    const iconPathD = () => button.querySelector('svg path')?.getAttribute('d');

    expect(iconPathD()).toMatch(/^M1 9\.5/);

    fireEvent.click(button);

    await vi.waitFor(() => expect(iconPathD()).toMatch(/^M11\.4669/));

    vi.advanceTimersByTime(1500);

    await vi.waitFor(() => expect(iconPathD()).toMatch(/^M1 9\.5/));
  });

  it('shows the tooltip content on focus, and the copied confirmation after a click', async () => {
    vi.useRealTimers();
    renderMono({ tooltip: 'console.user.copyExternalId', value: 'full-value-123' });

    const button = screen.getByText('full-value-123').closest('button')!;

    fireEvent.focus(button);

    expect((await screen.findAllByText('console.user.copyExternalId')).length).toBeGreaterThan(0);

    fireEvent.click(button);

    await waitFor(() => expect(screen.getAllByText('common.copied').length).toBeGreaterThan(0));
  });
});
