export interface ThemePreset {
  id: string;
  name: string;
  color: string;
}

export const themePresets: ThemePreset[] = [
  { id: "bambi", name: "Bambi", color: "#7c3aed" },
  { id: "ocean", name: "Ocean", color: "#0ea5e9" },
  { id: "forest", name: "Forest", color: "#10b981" },
  { id: "rose", name: "Rose", color: "#f43f5e" },
  { id: "amber", name: "Amber", color: "#f59e0b" },
];
