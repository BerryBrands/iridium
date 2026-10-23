// @vitest-environment node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function cssFiles(path: string): string[] {
  return statSync(path).isDirectory()
    ? readdirSync(path).flatMap((name) => cssFiles(join(path, name)))
    : path.endsWith('.css')
      ? [path]
      : [];
}

describe('the stylesheets', () => {
  it('use logical properties only, so the console mirrors in a right-to-left document', () => {
    const files = cssFiles(join(process.cwd(), 'src'));
    const physical = /(?:^|[\s;{])(?:margin|padding|border)-(?:left|right)\b|(?:^|[\s;{])(?:left|right)\s*:|text-align:\s*(?:left|right)/m;

    expect(files.length).toBeGreaterThan(0);

    for (const file of files) expect(physical.test(readFileSync(file, 'utf8')), file).toBe(false);
  });

  it('use no colour literal outside the scrims, so the theme of the host applies', () => {
    for (const file of cssFiles(join(process.cwd(), 'src'))) {
      const literals = readFileSync(file, 'utf8').match(/#[0-9a-f]{3,8}\b|rgba?\((?!0 0 0 \/)/gi) ?? [];

      expect(literals, file).toEqual([]);
    }
  });
});
