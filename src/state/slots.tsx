import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type RefObject,
  type SetStateAction,
} from 'react';
import shell from '../shell/shell.module.css';

/*
 * Each slot below is split in two contexts: a view consumes only the stable setter, and the shell consumes only the
 * value. A single `{ value, setValue }` context would re-render the view that published the value. The view would then
 * create a new element, publish again, and the render loop would not stop.
 */

// ── Section actions ─────────────────────────────────────────────────

const SetActionsContext = createContext<Dispatch<SetStateAction<ReactNode>>>(() => {});
const ActionsContext = createContext<ReactNode>(null);

/**
 * Lets a page put its primary controls in the section header that the shell renders, so the title and its actions
 * sit on one row.
 */
export function ConsoleSectionActionsProvider({ children }: { children: ReactNode }) {
  const [actions, setActions] = useState<ReactNode>(null);

  return (
    <SetActionsContext.Provider value={setActions}>
      <ActionsContext.Provider value={actions}>{children}</ActionsContext.Provider>
    </SetActionsContext.Provider>
  );
}

/**
 * Renders the controls that the open page published. It is a leaf component and not a hook of the header, because
 * the header also renders the page: a subscription there would re-render the page on each publish.
 */
export function ConsoleSectionActionsOutlet() {
  return useContext(ActionsContext);
}

/**
 * Publishes the primary controls of the calling page into the section header while the page is mounted.
 *
 * @param actions - The node to render. Memoise it, because a new element registers again on each render.
 */
export function useRegisterConsoleSectionActions(actions: ReactNode): void {
  const setActions = useContext(SetActionsContext);

  useEffect(() => {
    setActions(actions);

    return () => setActions(null);
  }, [actions, setActions]);
}

// ── Full page ───────────────────────────────────────────────────────

const SetFullPageContext = createContext<Dispatch<SetStateAction<number>>>(() => {});
const FullPageContext = createContext(false);

/**
 * Lets a view take the whole content pane, for example the page of one record. The pane then shows no section header
 * and no padding, and the view gives its own top bar. The value is a count of the views that ask, so two views that
 * ask and stop in any order give the right state.
 */
export function ConsoleFullPageProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  return (
    <SetFullPageContext.Provider value={setCount}>
      <FullPageContext.Provider value={count > 0}>{children}</FullPageContext.Provider>
    </SetFullPageContext.Provider>
  );
}

/**
 * Whether a view takes the whole content pane now.
 *
 * @returns True while a view asks for the whole content pane.
 */
export function useConsoleFullPage(): boolean {
  return useContext(FullPageContext);
}

/**
 * Asks for the whole content pane while `active` is true and the caller is mounted. Outside the shell it does nothing.
 *
 * @param active - True while the view needs the whole content pane.
 */
export function useRequestConsoleFullPage(active: boolean): void {
  const setCount = useContext(SetFullPageContext);

  useEffect(() => {
    if (!active) return;

    setCount((count) => count + 1);

    return () => setCount((count) => count - 1);
  }, [active, setCount]);
}

// ── Breadcrumb trail ────────────────────────────────────────────────

/** One crumb that a view adds to the breadcrumb bar. The last crumb of a trail is text. */
export interface ConsoleTrailCrumb {
  key: string;
  label: ReactNode;
  /** The console path of the crumb, with an optional query string. A crumb without one is text. */
  to?: string;
}

/** The part of the breadcrumb bar that a view gives: the crumbs after the group, and controls at the end of the bar. */
export interface ConsoleTrail {
  /** The crumbs after the group. Without them, the bar keeps its own crumbs of the section and the tab. */
  crumbs?: ConsoleTrailCrumb[];
  /** Controls at the end of the bar, for example a status badge. */
  end?: ReactNode;
}

const SetTrailContext = createContext<Dispatch<SetStateAction<ConsoleTrail | null>> | null>(null);
const TrailContext = createContext<ConsoleTrail | null>(null);

/** Lets a view give the crumbs and the end controls of the breadcrumb bar, so the page shows one breadcrumb only. */
export function ConsoleBreadcrumbTrailProvider({ children }: { children: ReactNode }) {
  const [trail, setTrail] = useState<ConsoleTrail | null>(null);

  return (
    <SetTrailContext.Provider value={setTrail}>
      <TrailContext.Provider value={trail}>{children}</TrailContext.Provider>
    </SetTrailContext.Provider>
  );
}

/**
 * The trail that a view gives now.
 *
 * @returns The trail, or null when no view gives one.
 */
export function useConsoleBreadcrumbTrail(): ConsoleTrail | null {
  return useContext(TrailContext);
}

/**
 * Gives the trail of the calling view to the breadcrumb bar while `trail` is not null and the view is mounted.
 *
 * @param trail - The trail, or null when the view shows its own breadcrumb. Memoise it.
 * @returns False outside the shell. The view must then show its own breadcrumb.
 */
export function useRegisterConsoleBreadcrumbTrail(trail: ConsoleTrail | null): boolean {
  const setTrail = useContext(SetTrailContext);

  useEffect(() => {
    if (!setTrail || !trail) return;

    setTrail(trail);

    return () => setTrail(null);
  }, [trail, setTrail]);

  return setTrail != null;
}

// ── Navigation drawer ───────────────────────────────────────────────

/** The DOM id of the group navigation. The menu button names it in `aria-controls`. */
export const CONSOLE_GROUP_NAV_ID = 'console-group-nav';

/** The state of the group navigation drawer on a phone, and its controls. */
export interface ConsoleNavDrawer {
  /** Whether the drawer is open. The value has an effect only below the mobile breakpoint. */
  open: boolean;
  toggle: () => void;
  close: () => void;
  /** The menu button that opens the drawer. Focus goes back to it when the drawer closes. */
  toggleRef: RefObject<HTMLButtonElement | null>;
}

const NavDrawerContext = createContext<ConsoleNavDrawer>({ open: false, toggle: () => {}, close: () => {}, toggleRef: { current: null } });

/** Holds the open state of the phone drawer. Each visit starts with the drawer closed, because it covers the page. */
export function ConsoleNavDrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const toggle = useCallback(() => setOpen((value) => !value), []);
  const close = useCallback(() => setOpen(false), []);
  const value = useMemo(() => ({ open, toggle, close, toggleRef }), [open, toggle, close]);

  return <NavDrawerContext.Provider value={value}>{children}</NavDrawerContext.Provider>;
}

/**
 * The phone drawer of the group navigation.
 *
 * @returns The open flag, the toggle and close actions, and the ref of the menu button.
 */
export function useConsoleNavDrawer(): ConsoleNavDrawer {
  return useContext(NavDrawerContext);
}

// ── Side panel ──────────────────────────────────────────────────────

interface SidePanelHost {
  element: HTMLElement | null;
  setElement: (element: HTMLElement | null) => void;
}

const HostContext = createContext<SidePanelHost>({ element: null, setElement: () => {} });

/**
 * Makes the side panel slot of the layout available to the pages, so an editor can render as a column beside the
 * content. The context carries a DOM node, and panels portal into it: the editor keeps its place in the React tree,
 * and only its DOM position moves.
 */
export function ConsoleSidePanelProvider({ children }: { children: ReactNode }) {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const value = useMemo(() => ({ element, setElement }), [element]);

  return <HostContext.Provider value={value}>{children}</HostContext.Provider>;
}

/**
 * The DOM node to portal a side panel into, or `null` outside the shell. A caller then shows a modal.
 *
 * @returns The node of the slot, or null.
 */
export function useConsoleSidePanelHost(): HTMLElement | null {
  return useContext(HostContext).element;
}

/**
 * The place where side panels land: a flex item after the content pane. The slot, and not the panel in it, opens and
 * closes, so the column animates on a change of width and not on each new panel. Empty, it has no width.
 * {@link ConsoleGroupView} renders it; render it yourself only in a layout of your own.
 */
export function ConsoleSidePanelSlot() {
  const { setElement } = useContext(HostContext);

  return <div className={shell.sidePanelSlot} ref={setElement} />;
}

// ── Focus mode ──────────────────────────────────────────────────────

/** The focus mode of the shell, and its control. */
export interface ConsoleFocusMode {
  /** Whether the shell hides its chrome, so that the open page fills the window. */
  focused: boolean;
  setFocused: (focused: boolean) => void;
}

const FocusModeContext = createContext<ConsoleFocusMode>({ focused: false, setFocused: () => {} });

/**
 * The state of a focus mode, for a host that renders {@link ConsoleFocusModeProvider} with a `value` and also reads
 * the flag itself.
 *
 * @returns The focus flag and its setter.
 */
export function useConsoleFocusModeState(): ConsoleFocusMode {
  const [focused, setFocused] = useState(false);

  return useMemo(() => ({ focused, setFocused }), [focused]);
}

/**
 * Holds the focus mode of the shell. A page sets it, for example an editor that maximises. Each visit starts with
 * the full chrome.
 *
 * @param props - The children, and an optional `value` from {@link useConsoleFocusModeState} to control the mode.
 */
export function ConsoleFocusModeProvider({ value, children }: { value?: ConsoleFocusMode; children: ReactNode }) {
  const own = useConsoleFocusModeState();

  return <FocusModeContext.Provider value={value ?? own}>{children}</FocusModeContext.Provider>;
}

/**
 * The focus mode of the shell. Outside the shell the value is off and the setter does nothing.
 *
 * @returns The focus flag and its setter.
 */
export function useConsoleFocusMode(): ConsoleFocusMode {
  return useContext(FocusModeContext);
}
