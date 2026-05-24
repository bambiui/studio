// Installed by bambiui. Do not edit by hand.

export interface BambiBehavior {
  sync(): void;
  update?(options?: unknown): void;
  destroy(): void;
}

export function getAttr(el: Element, name: string, fallback: string): string {
  return el.getAttribute(name) ?? fallback;
}

export function setAttr(el: Element, name: string, value: string | null): void {
  if (value === null) el.removeAttribute(name);
  else el.setAttribute(name, value);
}

export function getBoolAttr(el: Element, name: string): boolean {
  return el.getAttribute(name) === "true";
}

export function dispatchBambiEvent<Detail>(
  element: Element,
  name: string,
  detail: Detail,
): void {
  element.dispatchEvent(
    new CustomEvent<Detail>(name, {
      bubbles: true,
      cancelable: false,
      composed: false,
      detail,
    }),
  );
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export interface RovingFocusOptions {
  /** Arrow-key axes to handle. Default: "horizontal". */
  orientation?: "horizontal" | "vertical" | "both";
  /** Wrap focus from last → first and first → last. Default: true. */
  loop?: boolean;
  /** Returns the current set of candidate items on each keydown. */
  getItems: () => Element[];
  /** Return true to skip an item during navigation. */
  isDisabled?: (item: Element) => boolean;
  /** Called with the item that should receive focus. */
  onFocus: (item: Element) => void;
  /**
   * Called when the currently focused item should be activated (Enter / Space).
   * If omitted, Enter and Space are not handled.
   */
  onActivate?: (item: Element) => void;
}

export interface RovingFocus {
  destroy(): void;
}

/**
 * Attaches a roving-focus keydown handler to `container`.
 *
 * Handles ArrowLeft/Right/Up/Down (per orientation), Home, End, and optionally
 * Enter/Space. Disabled items are skipped. Focus wrapping is configurable.
 *
 * This primitive is framework-free and copies cleanly into user projects.
 * It does NOT manage tabindex or ARIA — the caller (controller) owns those.
 */
export function createRovingFocus(
  container: Element,
  options: RovingFocusOptions,
): RovingFocus {
  const abort = new AbortController();
  const { signal } = abort;
  const loop = options.loop ?? true;
  const orientation = options.orientation ?? "horizontal";

  const isHorizontal = orientation === "horizontal" || orientation === "both";
  const isVertical = orientation === "vertical" || orientation === "both";

  container.addEventListener(
    "keydown",
    (event: Event) => {
      const e = event as KeyboardEvent;
      const items = options
        .getItems()
        .filter((item) => !(options.isDisabled?.(item) ?? false));

      if (items.length === 0) return;

      const focused = items.findIndex((item) => item === document.activeElement);
      if (focused === -1) return;

      let next: Element | undefined;

      if (
        (isHorizontal && e.key === "ArrowRight") ||
        (isVertical && e.key === "ArrowDown")
      ) {
        e.preventDefault();
        const nextIndex = loop
          ? (focused + 1) % items.length
          : Math.min(focused + 1, items.length - 1);
        next = items[nextIndex];
      } else if (
        (isHorizontal && e.key === "ArrowLeft") ||
        (isVertical && e.key === "ArrowUp")
      ) {
        e.preventDefault();
        const prevIndex = loop
          ? (focused - 1 + items.length) % items.length
          : Math.max(focused - 1, 0);
        next = items[prevIndex];
      } else if (e.key === "Home") {
        e.preventDefault();
        next = items[0];
      } else if (e.key === "End") {
        e.preventDefault();
        next = items[items.length - 1];
      } else if ((e.key === "Enter" || e.key === " ") && options.onActivate) {
        e.preventDefault();
        const item = items[focused];
        if (item) options.onActivate(item);
        return;
      }

      if (next) options.onFocus(next);
    },
    { signal },
  );

  return {
    destroy() {
      abort.abort();
    },
  };
}

export interface LayerHandle {
  id: number;
  node: Element;
  modal: boolean;
  isTopLayer(): boolean;
  destroy(): void;
}

let layerId = 0;
const layers: LayerHandle[] = [];

export function createLayerHandle(node: Element, modal = false): LayerHandle {
  const handle: LayerHandle = {
    id: ++layerId,
    node,
    modal,
    isTopLayer() {
      return layers[layers.length - 1] === handle;
    },
    destroy() {
      const index = layers.indexOf(handle);
      if (index !== -1) layers.splice(index, 1);
    },
  };
  layers.push(handle);
  return handle;
}

export function getTopLayer(): LayerHandle | undefined {
  return layers[layers.length - 1];
}

export function isInLayerStack(node: Node): boolean {
  return layers.some((layer) => layer.node.contains(node));
}

export interface DismissableLayerEventDetail {
  originalEvent: Event;
}

export type DismissableLayerEvent = CustomEvent<DismissableLayerEventDetail>;

export interface DismissableLayerOptions {
  enabled?: boolean;
  modal?: boolean;
  branches?: Element[];
  onPointerDownOutside?: (event: DismissableLayerEvent) => void;
  onFocusOutside?: (event: DismissableLayerEvent) => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onDismiss?: (event: Event) => void;
}

export interface DismissableLayer {
  destroy(): void;
}

function composedPathContains(event: Event, element: Element): boolean {
  return event.composedPath().includes(element);
}

function isInsideLayer(
  event: Event,
  element: Element,
  branches: Element[],
): boolean {
  const path = event.composedPath();
  return (
    path.includes(element) || branches.some((branch) => path.includes(branch))
  );
}

function createDismissableLayerEvent(
  type: string,
  originalEvent: Event,
): DismissableLayerEvent {
  return new CustomEvent<DismissableLayerEventDetail>(type, {
    bubbles: false,
    cancelable: true,
    composed: false,
    detail: { originalEvent },
  });
}

export function createDismissableLayer(
  element: Element,
  options: DismissableLayerOptions = {},
): DismissableLayer {
  const abort = new AbortController();
  const { signal } = abort;
  const enabled = options.enabled ?? true;
  if (!enabled || typeof document === "undefined")
    return { destroy: () => abort.abort() };

  const ownerDocument = element.ownerDocument;
  const branches = options.branches ?? [];
  const layer: LayerHandle = createLayerHandle(element, options.modal ?? false);

  ownerDocument.addEventListener(
    "pointerdown",
    (event) => {
      if (!layer.isTopLayer()) return;
      if (isInsideLayer(event, element, branches)) return;
      const layerEvent = createDismissableLayerEvent(
        "bambi:pointer-down-outside",
        event,
      );
      options.onPointerDownOutside?.(layerEvent);
      if (!layerEvent.defaultPrevented) options.onDismiss?.(event);
    },
    { capture: true, signal },
  );

  ownerDocument.addEventListener(
    "focusin",
    (event) => {
      if (!layer.isTopLayer()) return;
      if (isInsideLayer(event, element, branches)) return;
      const layerEvent = createDismissableLayerEvent(
        "bambi:focus-outside",
        event,
      );
      options.onFocusOutside?.(layerEvent);
      if (
        options.modal &&
        !layerEvent.defaultPrevented &&
        element instanceof HTMLElement
      ) {
        event.preventDefault();
        element.focus({ preventScroll: true });
        return;
      }
      if (!layerEvent.defaultPrevented) options.onDismiss?.(event);
    },
    { signal },
  );

  ownerDocument.addEventListener(
    "keydown",
    (event) => {
      if (event.key !== "Escape" || !layer.isTopLayer()) return;
      options.onEscapeKeyDown?.(event);
      if (!event.defaultPrevented) options.onDismiss?.(event);
    },
    { signal },
  );

  return {
    destroy() {
      abort.abort();
      layer.destroy();
    },
  };
}

export interface FocusScopeOptions {
  enabled?: boolean;
  trapped?: boolean;
  loop?: boolean;
  restoreFocus?: boolean;
  autofocus?: boolean;
  containers?: Element[];
}

export interface FocusScope {
  focusFirst(): void;
  destroy(): void;
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "details > summary:first-of-type",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function isFocusable(element: Element): element is HTMLElement {
  if (!(element instanceof HTMLElement)) return false;
  if (element.hidden) return false;
  if (element.getAttribute("aria-hidden") === "true") return false;
  const style = element.ownerDocument.defaultView?.getComputedStyle(element);
  if (style?.display === "none" || style?.visibility === "hidden") return false;
  return true;
}

export function getFocusableElements(container: Element): HTMLElement[] {
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    isFocusable,
  );
}

export function createFocusScope(
  container: HTMLElement,
  options: FocusScopeOptions = {},
): FocusScope {
  const abort = new AbortController();
  const { signal } = abort;
  const enabled = options.enabled ?? true;
  const trapped = options.trapped ?? false;
  const loop = options.loop ?? true;
  const restoreFocus = options.restoreFocus ?? true;
  const previouslyFocused =
    typeof document === "undefined"
      ? null
      : container.ownerDocument.activeElement;
  const containers = [container, ...(options.containers ?? [])];
  const containsTarget = (target: Element) =>
    containers.some((candidate) => candidate.contains(target));

  const focusFirst = () => {
    const first = getFocusableElements(container)[0] ?? container;
    first.focus({ preventScroll: true });
  };

  if (enabled && !container.hasAttribute("tabindex")) container.tabIndex = -1;

  if (enabled && options.autofocus) {
    queueMicrotask(focusFirst);
  }

  if (enabled && trapped) {
    container.addEventListener(
      "keydown",
      (event) => {
        if (event.key !== "Tab") return;
        const focusables = getFocusableElements(container);
        if (focusables.length === 0) {
          event.preventDefault();
          container.focus({ preventScroll: true });
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = container.ownerDocument.activeElement;
        if (event.shiftKey && active === first) {
          event.preventDefault();
          if (loop) last?.focus({ preventScroll: true });
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          if (loop) first?.focus({ preventScroll: true });
        }
      },
      { signal },
    );

    container.ownerDocument.addEventListener(
      "focusin",
      (event) => {
        const target = event.target;
        if (!(target instanceof Element) || containsTarget(target)) return;
        event.preventDefault();
        focusFirst();
      },
      { signal },
    );
  }

  return {
    focusFirst,
    destroy() {
      abort.abort();
      if (
        restoreFocus &&
        previouslyFocused instanceof HTMLElement &&
        previouslyFocused.isConnected
      ) {
        previouslyFocused.focus({ preventScroll: true });
      }
    },
  };
}

export interface ScrollLock {
  destroy(): void;
}

let lockCount = 0;
let previousOverflow = "";
let previousPaddingRight = "";

export function createScrollLock(
  ownerDocument: Document = document,
): ScrollLock {
  const body = ownerDocument.body;
  if (lockCount === 0) {
    previousOverflow = body.style.overflow;
    previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = ownerDocument.defaultView
      ? ownerDocument.defaultView.innerWidth -
        ownerDocument.documentElement.clientWidth
      : 0;
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
  }
  lockCount += 1;

  return {
    destroy() {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        body.style.overflow = previousOverflow;
        body.style.paddingRight = previousPaddingRight;
      }
    },
  };
}
