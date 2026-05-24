import type { PointerEvent, RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import { CANVAS_STORAGE_KEY } from "../constants";
import {
  studioComponents,
  type StudioComponentDefinition,
} from "../registry/components";
import type { StudioStyle } from "../types";

interface CanvasProps {
  selectedComponentId: string;
  onSelectComponent: (componentId: string) => void;
  previewStyle: StudioStyle;
}

interface CanvasItem {
  id: string;
  componentId: string;
  x: number;
  y: number;
  width?: number;
}

interface ActiveDrag {
  itemId: string;
  offsetX: number;
  offsetY: number;
}

export function Canvas({
  selectedComponentId,
  onSelectComponent,
  previewStyle,
}: CanvasProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [canvasMode, setCanvasMode] = useState<"showcase" | "board">(
    "showcase",
  );
  const [viewMode, setViewMode] = useState<"all" | "selected">("all");
  const [zoom, setZoom] = useState(1);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [hasLoadedItems, setHasLoadedItems] = useState(false);
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null);
  const visibleComponents =
    viewMode === "selected"
      ? studioComponents.filter(
          (component) => component.id === selectedComponentId,
        )
      : studioComponents;

  useEffect(() => {
    try {
      const storedItems = window.localStorage.getItem(CANVAS_STORAGE_KEY);
      if (storedItems) setItems(JSON.parse(storedItems) as CanvasItem[]);
    } finally {
      setHasLoadedItems(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedItems) return;
    window.localStorage.setItem(CANVAS_STORAGE_KEY, JSON.stringify(items));
  }, [hasLoadedItems, items]);

  const addSelectedToBoard = () => {
    const itemId = `item-${Date.now()}`;
    setCanvasMode("board");
    setSelectedItemId(itemId);
    setItems((current) => [
      ...current,
      {
        id: itemId,
        componentId: selectedComponentId,
        x: 32 + current.length * 24,
        y: 32 + current.length * 24,
        width: 384,
      },
    ]);
  };

  const updateItem = (itemId: string, updates: Partial<CanvasItem>) => {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item,
      ),
    );
  };

  const moveItem = (itemId: string, x: number, y: number) => {
    const nextX = snapToGrid ? snapValue(x, 32) : x;
    const nextY = snapToGrid ? snapValue(y, 32) : y;
    updateItem(itemId, { x: Math.max(0, nextX), y: Math.max(0, nextY) });
  };

  const handleBoardPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!activeDrag || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    moveItem(
      activeDrag.itemId,
      (event.clientX - rect.left) / zoom - activeDrag.offsetX,
      (event.clientY - rect.top) / zoom - activeDrag.offsetY,
    );
  };

  return (
    <section className="min-h-0 flex-1 overflow-auto p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-violet-200">Free canvas</p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                İlk fazda canvas, seçilebilir component showcase olarak
                çalışıyor. Sonraki fazlarda drag/drop, zoom ve layout editing bu
                katmanın üzerine eklenecek.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="lg:hidden">
                <span className="sr-only">Select component</span>
                <select
                  value={selectedComponentId}
                  onChange={(event) => onSelectComponent(event.target.value)}
                  className="rounded-full border border-white/10 bg-[#050814] px-3 py-2 text-xs font-medium text-slate-200 outline-none focus:border-violet-400"
                >
                  {studioComponents.map((component) => (
                    <option key={component.id} value={component.id}>
                      {component.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex rounded-full border border-white/10 bg-black/20 p-1">
                {(["showcase", "board"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setCanvasMode(mode)}
                    className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition ${
                      canvasMode === mode
                        ? "bg-violet-500 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              {canvasMode === "showcase" ? (
                <div className="flex rounded-full border border-white/10 bg-black/20 p-1">
                  {(["all", "selected"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setViewMode(mode)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                        viewMode === mode
                          ? "bg-violet-500 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {mode === "all" ? "All" : "Selected"}
                    </button>
                  ))}
                </div>
              ) : null}
              <button
                type="button"
                onClick={addSelectedToBoard}
                className="rounded-full bg-violet-500 px-3 py-2 text-xs font-medium text-white transition hover:bg-violet-400"
              >
                Add selected
              </button>
            </div>
          </div>
        </div>

        {canvasMode === "showcase" ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {visibleComponents.map((component) => (
              <CanvasCard
                key={component.id}
                component={component}
                isSelected={component.id === selectedComponentId}
                onSelect={() => onSelectComponent(component.id)}
                previewStyle={previewStyle}
              />
            ))}
          </div>
        ) : (
          <CanvasBoard
            boardRef={boardRef}
            items={items}
            selectedItemId={selectedItemId}
            previewStyle={previewStyle}
            zoom={zoom}
            snapToGrid={snapToGrid}
            onZoomChange={setZoom}
            onSnapToGridChange={setSnapToGrid}
            onSelectItem={(itemId, componentId) => {
              setSelectedItemId(itemId);
              onSelectComponent(componentId);
            }}
            onClear={() => {
              setItems([]);
              setSelectedItemId(null);
            }}
            onImportItems={(nextItems) => {
              setItems(nextItems);
              setSelectedItemId(nextItems[0]?.id ?? null);
              if (nextItems[0]) onSelectComponent(nextItems[0].componentId);
            }}
            onResize={(itemId, width) => updateItem(itemId, { width })}
            onMove={(itemId, x, y) => moveItem(itemId, x, y)}
            onDuplicate={(itemId) => {
              setItems((current) => duplicateItem(current, itemId));
              const duplicated = items.find((item) => item.id === itemId);
              if (duplicated) onSelectComponent(duplicated.componentId);
            }}
            onReorder={(itemId, direction) => {
              setItems((current) => reorderItems(current, itemId, direction));
            }}
            onRemove={(itemId) => {
              setItems((current) =>
                current.filter((item) => item.id !== itemId),
              );
              setSelectedItemId((current) =>
                current === itemId ? null : current,
              );
            }}
            onPointerMove={handleBoardPointerMove}
            onPointerUp={() => setActiveDrag(null)}
            onStartDrag={(itemId, offsetX, offsetY) =>
              setActiveDrag({ itemId, offsetX, offsetY })
            }
          />
        )}
      </div>
    </section>
  );
}

function snapValue(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

function duplicateItem(items: CanvasItem[], itemId: string): CanvasItem[] {
  const item = items.find((candidate) => candidate.id === itemId);
  if (!item) return items;

  return [
    ...items,
    {
      ...item,
      id: `item-${Date.now()}`,
      x: item.x + 24,
      y: item.y + 24,
    },
  ];
}

function reorderItems(
  items: CanvasItem[],
  itemId: string,
  direction: "forward" | "backward",
): CanvasItem[] {
  const index = items.findIndex((item) => item.id === itemId);
  if (index === -1) return items;

  const targetIndex = direction === "forward" ? index + 1 : index - 1;
  if (targetIndex < 0 || targetIndex >= items.length) return items;

  const nextItems = [...items];
  const [item] = nextItems.splice(index, 1);
  if (!item) return items;
  nextItems.splice(targetIndex, 0, item);
  return nextItems;
}

interface CanvasBoardProps {
  boardRef: RefObject<HTMLDivElement | null>;
  items: CanvasItem[];
  selectedItemId: string | null;
  previewStyle: StudioStyle;
  zoom: number;
  snapToGrid: boolean;
  onZoomChange: (zoom: number) => void;
  onSnapToGridChange: (enabled: boolean) => void;
  onSelectItem: (itemId: string, componentId: string) => void;
  onClear: () => void;
  onImportItems: (items: CanvasItem[]) => void;
  onResize: (itemId: string, width: number) => void;
  onMove: (itemId: string, x: number, y: number) => void;
  onDuplicate: (itemId: string) => void;
  onReorder: (itemId: string, direction: "forward" | "backward") => void;
  onRemove: (itemId: string) => void;
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerUp: () => void;
  onStartDrag: (itemId: string, offsetX: number, offsetY: number) => void;
}

function CanvasBoard({
  boardRef,
  items,
  selectedItemId,
  previewStyle,
  zoom,
  snapToGrid,
  onZoomChange,
  onSnapToGridChange,
  onSelectItem,
  onClear,
  onImportItems,
  onResize,
  onMove,
  onDuplicate,
  onReorder,
  onRemove,
  onPointerMove,
  onPointerUp,
  onStartDrag,
}: CanvasBoardProps) {
  const selectedItem = items.find((item) => item.id === selectedItemId);
  const selectedWidth = selectedItem?.width ?? 384;
  const zoomPercent = Math.round(zoom * 100);

  const exportBoard = () => {
    const file = new Blob([JSON.stringify({ version: 1, items }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bambiui-studio-canvas.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const importBoard = async (file: File) => {
    const source = await file.text();
    const payload = JSON.parse(source) as
      | { items?: CanvasItem[] }
      | CanvasItem[];
    const nextItems = Array.isArray(payload) ? payload : payload.items;
    if (!Array.isArray(nextItems)) return;

    onImportItems(
      nextItems
        .filter((item) =>
          studioComponents.some(
            (component) => component.id === item.componentId,
          ),
        )
        .map((item, index) => ({
          id: item.id || `imported-${Date.now()}-${index}`,
          componentId: item.componentId,
          x: Number.isFinite(item.x) ? item.x : 32,
          y: Number.isFinite(item.y) ? item.y : 32,
          width: Number.isFinite(item.width) ? item.width : 384,
        })),
    );
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-2">
        <div>
          <h3 className="text-sm font-semibold text-white">Board canvas</h3>
          <p className="mt-1 text-xs text-slate-500">
            Drag handles or use arrow keys to move selected items. Hold Shift
            for larger steps.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-400">
            Zoom
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={zoom}
              onChange={(event) => onZoomChange(Number(event.target.value))}
              className="w-24 accent-violet-400"
            />
            <span className="w-10 text-right">{zoomPercent}%</span>
          </label>
          <button
            type="button"
            onClick={() => onZoomChange(1)}
            className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-slate-300 transition hover:bg-white/10"
          >
            100%
          </button>
          <label className="flex items-center gap-2 text-xs text-slate-400">
            <input
              type="checkbox"
              checked={snapToGrid}
              onChange={(event) => onSnapToGridChange(event.target.checked)}
              className="accent-violet-500"
            />
            Snap 32px
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-400">
            Width
            <input
              type="range"
              min="260"
              max="640"
              step="20"
              disabled={!selectedItem}
              value={selectedWidth}
              onChange={(event) =>
                selectedItem &&
                onResize(selectedItem.id, Number(event.target.value))
              }
              className="w-28 accent-violet-400 disabled:opacity-40"
            />
            <span className="w-10 text-right">{selectedWidth}px</span>
          </label>
          <button
            type="button"
            onClick={exportBoard}
            className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-slate-300 transition hover:bg-white/10"
          >
            Export board
          </button>
          <label className="cursor-pointer rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-slate-300 transition hover:bg-white/10">
            Import board
            <input
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void importBoard(file);
                event.currentTarget.value = "";
              }}
            />
          </label>
          <button
            type="button"
            onClick={onClear}
            className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-slate-300 transition hover:bg-white/10"
          >
            Clear board
          </button>
        </div>
      </div>
      {items.length > 0 ? (
        <div className="mb-3 grid gap-2 rounded-2xl border border-white/10 bg-black/20 p-3">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Layers
            </h4>
            <span className="text-xs text-slate-600">
              Front is rendered last
            </span>
          </div>
          <div className="grid gap-2">
            {items.map((item, index) => {
              const component = studioComponents.find(
                (candidate) => candidate.id === item.componentId,
              );
              const isSelected = item.id === selectedItemId;

              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 ${
                    isSelected
                      ? "border-violet-400 bg-violet-500/10"
                      : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      component && onSelectItem(item.id, component.id)
                    }
                    className="min-w-0 flex-1 text-left text-xs font-medium text-slate-200"
                  >
                    <span className="mr-2 text-slate-500">{index + 1}</span>
                    {component?.name ?? item.componentId}
                  </button>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => onDuplicate(item.id)}
                      className="rounded-full px-2 py-1 text-xs text-slate-400 transition hover:bg-white/10 hover:text-white"
                    >
                      Copy
                    </button>
                    <button
                      type="button"
                      onClick={() => onReorder(item.id, "backward")}
                      className="rounded-full px-2 py-1 text-xs text-slate-400 transition hover:bg-white/10 hover:text-white"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => onReorder(item.id, "forward")}
                      className="rounded-full px-2 py-1 text-xs text-slate-400 transition hover:bg-white/10 hover:text-white"
                    >
                      Front
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
      <div
        ref={boardRef}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        className="relative min-h-[34rem] overflow-hidden rounded-[1.25rem] border border-dashed border-white/15 bg-[#050814] bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px]"
      >
        {items.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center p-8 text-center text-sm text-slate-500">
            Select a component and click Add selected to place it on the board.
          </div>
        ) : null}
        {items.map((item) => {
          const component = studioComponents.find(
            (candidate) => candidate.id === item.componentId,
          );
          if (!component) return null;
          const isSelected = item.id === selectedItemId;
          const width = item.width ?? 384;

          return (
            <div
              key={item.id}
              className={`absolute max-w-[calc(100%-2rem)] rounded-2xl border bg-[#080d1a] p-2 shadow-2xl shadow-black/30 ${
                isSelected ? "border-violet-400" : "border-white/10"
              }`}
              style={{
                width,
                transform: `translate(${item.x * zoom}px, ${item.y * zoom}px) scale(${zoom})`,
                transformOrigin: "top left",
              }}
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => onSelectItem(item.id, component.id)}
                onKeyDown={(event) => {
                  const step = event.shiftKey ? 24 : 8;
                  if (event.key === "ArrowRight") {
                    event.preventDefault();
                    onMove(item.id, item.x + step, item.y);
                  } else if (event.key === "ArrowLeft") {
                    event.preventDefault();
                    onMove(item.id, item.x - step, item.y);
                  } else if (event.key === "ArrowDown") {
                    event.preventDefault();
                    onMove(item.id, item.x, item.y + step);
                  } else if (event.key === "ArrowUp") {
                    event.preventDefault();
                    onMove(item.id, item.x, item.y - step);
                  } else if (
                    event.key === "Delete" ||
                    event.key === "Backspace"
                  ) {
                    event.preventDefault();
                    onRemove(item.id);
                  }
                }}
                onPointerDown={(event) => {
                  event.currentTarget.setPointerCapture(event.pointerId);
                  onSelectItem(item.id, component.id);
                  const rect = boardRef.current?.getBoundingClientRect();
                  const pointerX = rect
                    ? (event.clientX - rect.left) / zoom
                    : item.x;
                  const pointerY = rect
                    ? (event.clientY - rect.top) / zoom
                    : item.y;
                  onStartDrag(item.id, pointerX - item.x, pointerY - item.y);
                }}
                className="mb-2 flex cursor-grab items-center justify-between gap-2 rounded-xl bg-white/5 px-3 py-2 text-left active:cursor-grabbing"
              >
                <span className="text-xs font-semibold text-white">
                  {component.name}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDuplicate(item.id);
                    }}
                    className="rounded-full px-2 py-1 text-xs text-slate-400 transition hover:bg-white/10 hover:text-white"
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onRemove(item.id);
                    }}
                    className="rounded-full px-2 py-1 text-xs text-slate-400 transition hover:bg-white/10 hover:text-white"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div
                className="rounded-xl border border-slate-200 bg-[var(--bambi-background)] p-4 text-[var(--bambi-foreground)]"
                style={previewStyle}
              >
                {component.preview}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface CanvasCardProps {
  component: StudioComponentDefinition;
  isSelected: boolean;
  onSelect: () => void;
  previewStyle: StudioStyle;
}

function CanvasCard({
  component,
  isSelected,
  onSelect,
  previewStyle,
}: CanvasCardProps) {
  return (
    <article
      className={`rounded-3xl border p-2 transition ${
        isSelected
          ? "border-violet-400 bg-violet-400/10 shadow-2xl shadow-violet-950/30"
          : "border-white/10 bg-white/[0.03] hover:border-white/20"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="block w-full rounded-[1.25rem] p-4 text-left"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-white">
              {component.name}
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              {component.description}
            </p>
          </div>
          {isSelected ? (
            <span className="rounded-full bg-violet-500 px-3 py-1 text-xs font-medium text-white">
              Selected
            </span>
          ) : null}
        </div>
      </button>
      <div
        className="bambi-preview rounded-[1.25rem] border border-slate-200 bg-[var(--bambi-background)] p-6 text-[var(--bambi-foreground)]"
        style={previewStyle}
      >
        {component.preview}
        {component.statePreview ? (
          <div className="mt-5 border-t border-[var(--bambi-border)] pt-5">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-[var(--bambi-muted-foreground)]">
              States
            </p>
            {component.statePreview}
          </div>
        ) : null}
      </div>
    </article>
  );
}
