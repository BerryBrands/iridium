import { describe, expect, it } from 'vitest';
import { findGroupBySlug, findSectionBySlug, groupPath, isInGroup, sectionPath, toSlug } from '../src/index.js';

const section = {
  slug: 'products',
  tabs: [
    { id: 'list', slug: 'list' },
    { id: 'sheets', slug: 'sheets' },
  ],
};

describe('paths', () => {
  it('builds group and section paths', () => {
    expect(groupPath('/console', { slug: 'catalogue' })).toBe('/console/catalogue');
    expect(sectionPath('/console', { slug: 'catalogue' }, section)).toBe('/console/catalogue/products');
  });

  it('gives the default tab the section path and the other tabs a segment', () => {
    expect(sectionPath('/console', { slug: 'catalogue' }, section, section.tabs[0])).toBe('/console/catalogue/products');
    expect(sectionPath('/console', { slug: 'catalogue' }, section, section.tabs[1])).toBe('/console/catalogue/products/sheets');
  });

  it('knows whether a pathname is inside a group', () => {
    expect(isInGroup('/console/catalogue', '/console', { slug: 'catalogue' })).toBe(true);
    expect(isInGroup('/console/catalogue/products', '/console', { slug: 'catalogue' })).toBe(true);
    expect(isInGroup('/console/catalogue-old', '/console', { slug: 'catalogue' })).toBe(false);
  });

  it('converts camel-case ids to slugs', () => {
    expect(toSlug('sheetsIntegration')).toBe('sheets-integration');
    expect(toSlug('roleSets2Fa')).toBe('role-sets2-fa');
  });

  it('finds groups and sections by slug', () => {
    const groups = [{ slug: 'a', sections: [{ slug: 'x' }] }] as never[];

    expect(findGroupBySlug(groups, 'a')).toBe(groups[0]);
    expect(findGroupBySlug(groups, undefined)).toBeUndefined();
    expect(findSectionBySlug({ sections: [{ slug: 'x' }] } as never, 'x')).toEqual({ slug: 'x' });
  });
});
