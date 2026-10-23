import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Theme } from '@radix-ui/themes';
import { CopyButton } from '../src/index.js';

let writeText: ReturnType<typeof vi.fn>;

function renderButton() {
  return render(
    <Theme>
      <CopyButton value="task_01" label="Copy ID" />
    </Theme>,
  );
}

beforeEach(() => {
  vi.useFakeTimers();
  writeText = vi.fn(() => Promise.resolve());
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('CopyButton', () => {
  it('copies the value and shows a check mark for a short time', async () => {
    const { container } = renderButton();
    const before = container.querySelector('svg')!.innerHTML;

    fireEvent.click(screen.getByRole('button', { name: 'Copy ID' }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(writeText).toHaveBeenCalledWith('task_01');
    expect(container.querySelector('svg')!.innerHTML).not.toBe(before);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1_500);
    });

    expect(container.querySelector('svg')!.innerHTML).toBe(before);
  });

  it('changes nothing when the clipboard refuses the write', async () => {
    writeText.mockImplementation(() => Promise.reject(new Error('denied')));

    const { container } = renderButton();
    const before = container.querySelector('svg')!.innerHTML;

    fireEvent.click(screen.getByRole('button', { name: 'Copy ID' }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(container.querySelector('svg')!.innerHTML).toBe(before);
  });
});
