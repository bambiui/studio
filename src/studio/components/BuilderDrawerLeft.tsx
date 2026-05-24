import type { PreviewScheme } from "../types";

interface BuilderDrawerLeftProps {
  previewScheme: PreviewScheme;
  onChangePreviewScheme: (scheme: PreviewScheme) => void;
  onSelectComponent: (componentId: string) => void;
}

const navigationGroups = [
  {
    label: "Studio",
    items: [{ label: "Overview", componentId: "button" }],
  },
  {
    label: "Foundations",
    items: [
      { label: "Colors", componentId: "badge" },
      { label: "Typography", componentId: "code" },
    ],
  },
  {
    label: "Actions",
    items: [{ label: "Button & Group", componentId: "button" }],
  },
  {
    label: "Inputs",
    items: [
      { label: "Input", componentId: "input" },
      { label: "Textarea", componentId: "textarea" },
      { label: "Switch", componentId: "switch" },
      { label: "Slider", componentId: "slider" },
    ],
  },
  {
    label: "Layout",
    items: [
      { label: "Card", componentId: "card" },
      { label: "Separator", componentId: "separator" },
    ],
  },
] as const;

export function BuilderDrawerLeft({
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
        <button
          type="button"
          onClick={() => onSelectComponent("button")}
          className="drawer-brand flex items-center gap-2"
        >
          <span className="brand-logo flex h-6 w-6 rounded-md bg-[var(--bambi-primary)]" />
          <span className="brand-name text-sm font-bold tracking-tight text-white">
            bambiui
          </span>
        </button>
      </div>

      <div className="bambi-sidebar-content min-h-0 flex-1 overflow-auto py-3">
        {navigationGroups.map((group) => (
          <div key={group.label} className="bambi-sidebar-group mb-5">
            <span className="bambi-sidebar-group-label mb-2 block px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              {group.label}
            </span>
            <ul className="bambi-sidebar-menu grid gap-1">
              {group.items.map((item) => (
                <li key={`${group.label}-${item.label}`}>
                  <button
                    type="button"
                    data-card={item.componentId}
                    onClick={() => onSelectComponent(item.componentId)}
                    className="nav-item w-full rounded-xl px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
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
            <button
              key={scheme}
              type="button"
              data-theme-val={scheme}
              onClick={() => onChangePreviewScheme(scheme)}
              className={`theme-btn rounded-lg px-3 py-2 text-xs font-medium capitalize transition ${
                previewScheme === scheme
                  ? "bg-white text-[#080d1a]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {scheme}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
