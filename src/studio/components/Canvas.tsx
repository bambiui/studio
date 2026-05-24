import { useState } from "react";
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

export function Canvas({
  selectedComponentId,
  onSelectComponent,
  previewStyle,
}: CanvasProps) {
  const [viewMode, setViewMode] = useState<"all" | "selected">("all");
  const visibleComponents =
    viewMode === "selected"
      ? studioComponents.filter(
          (component) => component.id === selectedComponentId,
        )
      : studioComponents;

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
          </div>
        </div>

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
      </div>
    </section>
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
      </div>
    </article>
  );
}
