import { Button } from "@/src/components/ui/button";
import { componentCategories, studioComponents } from "../registry/components";
import type { PreviewScheme } from "../types";

interface BuilderDrawerLeftProps {
  selectedComponentId: string;
  previewScheme: PreviewScheme;
  onChangePreviewScheme: (scheme: PreviewScheme) => void;
  onSelectComponent: (componentId: string) => void;
}

const navigationGroups = [
  {
    label: "Studio",
    items: [{ label: "Overview", componentId: "hero" }],
  },
  {
    label: "Foundations",
    items: [
      { label: "Colors", componentId: "colors" },
      { label: "Typography", componentId: "typography" },
    ],
  },
  ...componentCategories.map((category) => ({
    label: category,
    items: studioComponents
      .filter((component) => component.category === category)
      .map((component) => ({
        label: component.name,
        componentId: component.id,
      })),
  })),
];

export function BuilderDrawerLeft({
  selectedComponentId,
  previewScheme,
  onChangePreviewScheme,
  onSelectComponent,
}: BuilderDrawerLeftProps) {
  return (
    <aside
      id="drawer-left"
      className="fixed bottom-0 left-0 top-0 z-30 hidden w-[220px] flex-col border-r border-white/10 bg-[#080d1a] p-3 text-slate-100 lg:flex"
    >
      <div className="bambi-sidebar-header px-2 py-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() => onSelectComponent("hero")}
          className="drawer-brand flex items-center gap-2"
        >
          <span className="brand-logo flex h-6 w-6 rounded-md bg-[var(--bambi-primary)]" />
          <span className="brand-name text-sm font-bold tracking-tight text-white">
            bambiui
          </span>
        </Button>
      </div>

      <div className="bambi-sidebar-content min-h-0 flex-1 overflow-auto py-3">
        {navigationGroups.map((group) => (
          <div key={group.label} className="bambi-sidebar-group mb-5">
            <span className="bambi-sidebar-group-label mb-2 block px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              {group.label}
            </span>
            <ul className="bambi-sidebar-menu grid gap-1">
              {group.items.map((item) => {
                const isActive = item.componentId === selectedComponentId;

                return (
                  <li key={`${group.label}-${item.label}`}>
                    <Button
                      type="button"
                      variant={isActive ? "primary" : "ghost"}
                      data-card={item.componentId}
                      onClick={() => onSelectComponent(item.componentId)}
                      className={`nav-item w-full rounded-xl px-3 py-2 text-left text-sm ${
                        isActive ? "text-violet-100" : "text-slate-300"
                      }`}
                    >
                      {item.label}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="drawer-footer border-t border-white/10 pt-3">
        <span className="drawer-footer-label mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Theme
        </span>
        <div className="theme-switcher grid grid-cols-2 gap-1 rounded-xl bg-white/5 p-1">
          {(["light", "dark"] as const).map((scheme) => (
            <Button
              key={scheme}
              type="button"
              variant={previewScheme === scheme ? "secondary" : "ghost"}
              size="sm"
              data-theme-val={scheme}
              onClick={() => onChangePreviewScheme(scheme)}
              className={`theme-btn rounded-lg px-3 py-2 text-xs font-medium capitalize ${
                previewScheme === scheme ? "text-[#080d1a]" : "text-slate-400"
              }`}
            >
              {scheme}
            </Button>
          ))}
        </div>
      </div>
    </aside>
  );
}
