import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Theme } from '@radix-ui/themes';
import { StatTile } from '../src/index.js';

describe('StatTile', () => {
  it('shows the label, the value with its full title, and the caption', () => {
    render(
      <Theme>
        <StatTile label="Published" value="1.2k" title="1,234" caption="Last 7 days" />
      </Theme>,
    );

    const tile = screen.getByText('Published').closest('[data-stat-tile]');

    expect(tile).not.toBeNull();
    expect(screen.getByText('1.2k').getAttribute('title')).toBe('1,234');
    expect(screen.getByText('Last 7 days')).not.toBeNull();
  });
});
