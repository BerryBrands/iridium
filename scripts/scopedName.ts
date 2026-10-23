import { basename } from 'node:path';

/**
 * The class name of a CSS module rule: `ir-<module>-<local>`, for example `ir-shell-search` for `.search` in
 * `shell.module.css`.
 *
 * @param local - The class name in the module.
 * @param filename - The path of the module.
 */
export function scopedName(local: string, filename: string): string {
  return `ir-${basename(filename).replace(/\.module\.css(\?.*)?$/, '')}-${local}`;
}
