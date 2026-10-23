// Configuration and model
export { ConsoleProvider, useConsoleConfig, useOptionalConsoleConfig } from './ConsoleProvider.js';
export type { ConsoleConfig, ConsoleProviderProps } from './ConsoleProvider.js';
export { englishConsoleLabels } from './labels.js';
export { isActivePath, useBrowserConsoleRouter } from './router.js';
export type { ConsoleLinkComponent, ConsoleLinkProps, ConsoleRouter } from './router.js';
export type {
  ConsoleAccent,
  ConsoleGroup,
  ConsoleGroupNavProps,
  ConsoleIcons,
  ConsoleLabels,
  ConsoleSearchResult,
  ConsoleSearchSource,
  ConsoleSection,
  ConsoleTab,
} from './types.js';
export { findGroupBySlug, findSectionBySlug, groupPath, isInGroup, sectionPath, toSlug } from './paths.js';

// Shell
export { ConsoleShell } from './shell/ConsoleShell.js';
export type { ConsoleShellProps } from './shell/ConsoleShell.js';
export { ConsoleGroupNav, ConsoleGroupView } from './shell/ConsoleGroupView.js';
export type { ConsoleGroupViewProps } from './shell/ConsoleGroupView.js';
export { ConsoleRail, ConsoleRailLabel, ConsoleRailLink, ConsoleRailSection, ConsoleRailSubLink } from './shell/ConsoleRail.js';
export type { ConsoleRailLinkProps, ConsoleRailProps } from './shell/ConsoleRail.js';
export { ConsoleSearch } from './shell/ConsoleSearch.js';
export { ConsoleRecentBar } from './shell/ConsoleRecentBar.js';
export type { ConsoleRecentBarProps } from './shell/ConsoleRecentBar.js';
export { ConsoleLink, ConsoleNavLink } from './shell/links.js';
export type { ConsoleLinkElementProps, ConsoleNavLinkProps } from './shell/links.js';
export { ConsoleSwitcher } from './shell/ConsoleSwitcher.js';
export { ConsoleBreadcrumbBar } from './shell/ConsoleBreadcrumbBar.js';
export type { ConsoleBreadcrumbBarProps } from './shell/ConsoleBreadcrumbBar.js';
export { ConsoleMenuButton } from './shell/ConsoleMenuButton.js';
export { ConsoleGroupCard, ConsoleHome } from './shell/ConsoleHome.js';
export type { ConsoleGroupCardProps, ConsoleHomeProps, ConsoleHomeSection } from './shell/ConsoleHome.js';
export { ConsoleUserButton } from './shell/ConsoleUserButton.js';
export type { ConsoleUserButtonProps } from './shell/ConsoleUserButton.js';

// Slots and state
export {
  CONSOLE_GROUP_NAV_ID,
  ConsoleBreadcrumbTrailProvider,
  ConsoleFocusModeProvider,
  ConsoleFullPageProvider,
  ConsoleNavDrawerProvider,
  ConsoleSectionActionsOutlet,
  ConsoleSectionActionsProvider,
  ConsoleSidePanelProvider,
  ConsoleSidePanelSlot,
  useConsoleBreadcrumbTrail,
  useConsoleFocusMode,
  useConsoleFocusModeState,
  useConsoleFullPage,
  useConsoleNavDrawer,
  useConsoleSidePanelHost,
  useRegisterConsoleBreadcrumbTrail,
  useRegisterConsoleSectionActions,
  useRequestConsoleFullPage,
} from './state/slots.js';
export type { ConsoleFocusMode, ConsoleNavDrawer, ConsoleTrail, ConsoleTrailCrumb } from './state/slots.js';
export { RECENT_GROUPS_LIMIT, useConsoleFavourites, useConsoleRecentGroups, useConsoleSidebar } from './state/preferences.js';
export type { RecentConsoleGroup } from './state/preferences.js';
export { MOBILE_VIEWPORT_QUERY, useIsMobileViewport } from './state/useIsMobileViewport.js';

// Panels
export { SidePanel } from './panel/SidePanel.js';
export type { SidePanelProps } from './panel/SidePanel.js';
export { FormShell } from './panel/FormShell.js';
export type { FormShellProps, FormShellVariant } from './panel/FormShell.js';

// Tables
export { DataTable, englishDataTableLabels } from './table/DataTable.js';
export type { ColumnMobile, DataTableColumn, DataTableIcons, DataTableLabels, DataTableProps, RowId } from './table/DataTable.js';
export { PAGE_SIZES, TablePagination } from './table/TablePagination.js';
export type { TablePaginationProps } from './table/TablePagination.js';
export { SortableColumnHeader } from './table/SortableColumnHeader.js';
export type { SortableColumnHeaderProps } from './table/SortableColumnHeader.js';
export { actionsColumn, RowActions, RowActionsMenu } from './table/RowActions.js';
export type { RowActionsProps, RowMenuItem } from './table/RowActions.js';
export { SelectAllCell, SelectRowCell } from './table/SelectionCells.js';
export { selectableRowProps, useRowSelection } from './table/useRowSelection.js';
export type { RowKey, RowSelection } from './table/useRowSelection.js';
export { DebouncedSearchField } from './table/DebouncedSearchField.js';
export type { DebouncedSearchFieldProps } from './table/DebouncedSearchField.js';
export { tableClasses } from './table/classes.js';

// Common
export { FormSection } from './common/FormSection.js';
export type { FormSectionProps } from './common/FormSection.js';
export { LabelledField } from './common/LabelledField.js';
export type { LabelledFieldProps } from './common/LabelledField.js';
export { StatTile } from './common/StatTile.js';
export type { StatTileProps } from './common/StatTile.js';
export { CopyButton } from './common/CopyButton.js';
export type { CopyButtonProps } from './common/CopyButton.js';
export { CopyableMono } from './common/CopyableMono.js';
export type { CopyableMonoProps } from './common/CopyableMono.js';
