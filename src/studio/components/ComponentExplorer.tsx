import { useState } from "react";
import {
  componentCategories,
  studioComponents,
  type ComponentCategory,
} from "../registry/components";

interface ComponentExplorerProps {
  selectedComponentId: string;
  onSelectComponent: (componentId: string) => void;
}

export function ComponentExplorer({
  selectedComponentId,
  onSelectComponent,
}: ComponentExplorerProps) {
  const [query, setQuery] = useState("");

  return (
    <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-[#080d1a] p-5 lg:block">
      <div className="mb-8">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500 font-bold text-white">
          B
        </div>
        <h2 className="text-xl font-semibold text-white">Component Explorer</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          CLI ile eklenen BambiUI komponentlerini canvas üzerinde incele.
        </p>
      </div>

      <label className="mb-6 block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Search
        </span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Button, input, card..."
          className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-violet-400"
        />
      </label>

      <div className="space-y-6">
        {componentCategories.map((category) => (
          <ComponentCategoryGroup
            key={category}
            category={category}
            query={query}
            selectedComponentId={selectedComponentId}
            onSelectComponent={onSelectComponent}
          />
        ))}
      </div>
    </aside>
  );
}

interface ComponentCategoryGroupProps extends ComponentExplorerProps {
  category: ComponentCategory;
  query: string;
}

function ComponentCategoryGroup({
  category,
  query,
  selectedComponentId,
  onSelectComponent,
}: ComponentCategoryGroupProps) {
  const normalizedQuery = query.trim().toLowerCase();
  const components = studioComponents.filter((component) => {
    if (component.category !== category) return false;
    if (!normalizedQuery) return true;

    return [component.name, component.description, component.category]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  });

  if (components.length === 0) return null;

  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        {category}
      </h3>
      <div className="space-y-2">
        {components.map((component) => {
          const isSelected = component.id === selectedComponentId;

          return (
            <button
              key={component.id}
              type="button"
              onClick={() => onSelectComponent(component.id)}
              className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                isSelected
                  ? "border-violet-400 bg-violet-500/15 text-white"
                  : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.06]"
              }`}
            >
              <span className="block text-sm font-medium">
                {component.name}
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                {component.tokenIds.length} editable token
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
