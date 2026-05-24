import type { CSSProperties } from "react";

export type StudioStyle = CSSProperties & Record<`--${string}`, string>;
export type ExportFormat = "css" | "json" | "preset";
export type PreviewScheme = "light" | "dark";
