import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { Theme } from '@radix-ui/themes';
import { FormSection } from '../src/index.js';

describe('FormSection', () => {
  it('names the section by its heading and renders the description beside the fields', () => {
    render(
      <Theme>
        <FormSection title="Workbook" description="Where the research goes.">
          <div>
            <input aria-label="first" />
            <input aria-label="second" />
          </div>
        </FormSection>
      </Theme>,
    );

    const section = screen.getByRole('region', { name: 'Workbook' });

    expect(within(section).getByRole('heading', { level: 3, name: 'Workbook' })).not.toBeNull();
    expect(within(section).getByText('Where the research goes.')).not.toBeNull();
    expect(within(section).getByLabelText('first')).not.toBeNull();
    expect(within(section).getByLabelText('second')).not.toBeNull();
  });

  it('omits the description when there is none', () => {
    const { container } = render(
      <Theme>
        <FormSection title="Brands">
          <input aria-label="brands" />
        </FormSection>
      </Theme>,
    );

    expect(container.querySelectorAll('p')).toHaveLength(0);
  });

  it('marks a compact section, and leaves the default section unmarked', () => {
    render(
      <Theme>
        <FormSection title="Providers" density="compact">
          <input aria-label="providers" />
        </FormSection>
        <FormSection title="Images">
          <input aria-label="images" />
        </FormSection>
      </Theme>,
    );

    expect(screen.getByRole('region', { name: 'Providers' }).getAttribute('data-density')).toBe('compact');
    expect(screen.getByRole('region', { name: 'Images' }).hasAttribute('data-density')).toBe(false);
  });
});
