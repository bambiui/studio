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
    <aside id="drawer-left" className="studio-drawer-left">
      <div className="studio-drawer-header">
        <Button
          type="button"
          variant="ghost"
          onClick={() => onSelectComponent(studioComponents[0]?.id ?? "")}
          className="studio-brand"
        >
          <img
            className="studio-brand-logo"
            src="https://bambiui.com/registry/assets/favicon.svg"
            alt=""
            width="24"
            height="24"
          />
          <span className="studio-brand-name">bambiui</span>
        </Button>
      </div>

      <div className="studio-drawer-content">
        {navigationGroups.map((group) => (
          <div key={group.label} className="studio-nav-group">
            <span className="studio-group-label">{group.label}</span>
            <ul className="studio-nav-list">
              {group.items.map((item) => {
                const isActive = item.componentId === selectedComponentId;

                return (
                  <li key={`${group.label}-${item.label}`}>
                    <Button
                      type="button"
                      variant={isActive ? "primary" : "ghost"}
                      data-component={item.componentId}
                      onClick={() => onSelectComponent(item.componentId)}
                      className={`studio-nav-button ${
                        isActive
                          ? "studio-nav-button-active"
                          : "studio-nav-button-inactive"
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

      <div className="studio-drawer-footer">
        <span className="studio-footer-label">Theme</span>
        <div className="studio-theme-switcher">
          {(["light", "dark"] as const).map((scheme) => (
            <Button
              key={scheme}
              type="button"
              variant={previewScheme === scheme ? "secondary" : "ghost"}
              size="sm"
              data-theme-val={scheme}
              onClick={() => onChangePreviewScheme(scheme)}
              className={`studio-theme-button ${
                previewScheme === scheme
                  ? "studio-theme-button-active"
                  : "studio-theme-button-inactive"
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
