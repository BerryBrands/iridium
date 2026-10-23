import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { ConsoleFocusModeProvider, useConsoleFocusMode, useConsoleFocusModeState } from '../src/index.js';

describe('console focus mode', () => {
  it('is off and does nothing outside the console', () => {
    const { result } = renderHook(() => useConsoleFocusMode());

    expect(result.current.focused).toBe(false);
    expect(() => result.current.setFocused(true)).not.toThrow();
    expect(result.current.focused).toBe(false);
  });

  it('starts with the full chrome and turns the mode on', () => {
    const { result } = renderHook(() => useConsoleFocusModeState());

    expect(result.current.focused).toBe(false);

    act(() => result.current.setFocused(true));

    expect(result.current.focused).toBe(true);
  });

  it('lets a panel inside the provider set the mode', () => {
    let shell: ReturnType<typeof useConsoleFocusModeState> | null = null;

    function Wrapper({ children }: { children: ReactNode }) {
      shell = useConsoleFocusModeState();

      return <ConsoleFocusModeProvider value={shell}>{children}</ConsoleFocusModeProvider>;
    }

    const { result } = renderHook(() => useConsoleFocusMode(), { wrapper: Wrapper });

    act(() => result.current.setFocused(true));

    expect(result.current.focused).toBe(true);
    expect(shell!.focused).toBe(true);
  });
});
