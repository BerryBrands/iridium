# Changelog

This project follows [Semantic Versioning](https://semver.org/). Before 1.0.0, a minor version can break the API, and
this file names each break.

## 0.1.0-rc.3

- **Breaking:** the class names include the module name: `ir-<module>-<local>`, for example `ir-shell-navItem` in place
  of `ir-navItem`. Two modules had a class with the same name (`search`), so the max width of the table search
  applied to the header search.
- `ConsoleRailLink`, `ConsoleRailSubLink` and `ConsoleNavLink` take `active`, which overrides the match on the path.

## 0.1.0-rc.2

- The loading spinners of `DataTable` and of a lazy page have `role="status"`.
- The section header has the `data-console-section-header` attribute, so a host or a test can find it.

## 0.1.0-rc.1

The first release candidate.

- The console shell: `ConsoleProvider`, `ConsoleShell`, `ConsoleHome`, `ConsoleRail` and its links, `ConsoleSearch`,
  `ConsoleRecentBar`, `ConsoleSwitcher`, `ConsoleBreadcrumbBar`, `ConsoleMenuButton` and `ConsoleUserButton`.
- An injectable router (`ConsoleRouter`), with a History API default and a React Router 7 adapter at
  `@berrybrands/iridium/react-router`.
- The slots for pages: section actions, the breadcrumb trail, the full page, the focus mode and the side panel.
- Groups with `href` (links out of the console), a `searchSource` for the header search, `children` as the content
  pane of the open group, and the `areaBar` and `switcher` options of the shell.
- The panels: `SidePanel` and `FormShell`.
- The tables: `DataTable`, `TablePagination`, `SortableColumnHeader`, `RowActions`, `RowActionsMenu`, `actionsColumn`,
  `SelectAllCell`, `SelectRowCell`, `useRowSelection`, `DebouncedSearchField` and `tableClasses`.
- The common parts: `FormSection`, `LabelledField`, `StatTile`, `CopyButton` and `CopyableMono`.
