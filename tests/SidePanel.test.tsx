import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderThemed } from './helpers.js';
import { ConsoleShell, FormShell, SidePanel, type ConsoleGroup } from '../src/index.js';
import { ReactRouterConsoleProvider as ConsoleProvider } from '../src/react-router.js';

describe('SidePanel', () => {
  it('shows a modal outside the shell', () => {
    renderThemed(
      <SidePanel open onOpenChange={() => {}} title="Edit item" closeLabel="Close">
        Body
      </SidePanel>,
    );

    expect(screen.getByRole('dialog', { name: 'Edit item' })).toBeInTheDocument();
  });

  it('opens in the slot of the shell and closes on Escape', () => {
    const onOpenChange = vi.fn();
    const groups: ConsoleGroup[] = [
      {
        id: 'g',
        slug: 'g',
        label: 'Group',
        icon: null,
        accent: 'gray',
        sections: [
          {
            id: 's',
            slug: 's',
            label: 'Section',
            icon: null,
            component: () => (
              <SidePanel open onOpenChange={onOpenChange} title="Edit item">
                Body
              </SidePanel>
            ),
          },
        ],
      },
    ];

    const { container } = renderThemed(
      <ConsoleProvider groups={groups}>
        <ConsoleShell group={groups[0]} section={groups[0].sections[0]} logo={null} />
      </ConsoleProvider>,
    );

    const panel = screen.getByRole('complementary', { name: 'Edit item' });

    expect(panel.parentElement).toBe(container.querySelector('[role="main"] + div'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe('FormShell', () => {
  it('submits and cancels', () => {
    const onSubmit = vi.fn();
    const onOpenChange = vi.fn();

    renderThemed(
      <FormShell
        open
        onOpenChange={onOpenChange}
        title="New item"
        error="Name is required"
        submitting={false}
        onSubmit={onSubmit}
        submitLabel="Save"
        cancelLabel="Cancel"
      >
        <input aria-label="Name" />
      </FormShell>,
    );

    expect(screen.getByText('Name is required')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onSubmit).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
