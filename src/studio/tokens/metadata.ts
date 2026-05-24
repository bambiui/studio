export type TokenKind = "color" | "radius" | "space" | "shadow" | "opacity";
export type TokenGroup = "Primitive" | "Semantic" | "Intent" | "Component";

export interface TokenDefinition {
  id: string;
  label: string;
  group: TokenGroup;
  kind: TokenKind;
  description: string;
}

export const tokenDefinitions: TokenDefinition[] = [
  {
    id: "--bambi-primary",
    label: "Primary",
    group: "Semantic",
    kind: "color",
    description: "Main brand color used by primary actions and focus states.",
  },
  {
    id: "--bambi-primary-foreground",
    label: "Primary foreground",
    group: "Semantic",
    kind: "color",
    description: "Text and icon color rendered on primary surfaces.",
  },
  {
    id: "--bambi-secondary",
    label: "Secondary",
    group: "Semantic",
    kind: "color",
    description: "Secondary action and neutral fill color.",
  },
  {
    id: "--bambi-danger",
    label: "Danger",
    group: "Semantic",
    kind: "color",
    description: "Destructive action and error color.",
  },
  {
    id: "--bambi-success",
    label: "Success",
    group: "Semantic",
    kind: "color",
    description: "Positive status color.",
  },
  {
    id: "--bambi-warning",
    label: "Warning",
    group: "Semantic",
    kind: "color",
    description: "Cautionary status color.",
  },
  {
    id: "--bambi-card",
    label: "Card background",
    group: "Semantic",
    kind: "color",
    description: "Surface color for cards and grouped content.",
  },
  {
    id: "--bambi-card-foreground",
    label: "Card foreground",
    group: "Semantic",
    kind: "color",
    description: "Text color on card surfaces.",
  },
  {
    id: "--bambi-border",
    label: "Border",
    group: "Semantic",
    kind: "color",
    description: "Default border color.",
  },
  {
    id: "--bambi-ring",
    label: "Focus ring",
    group: "Semantic",
    kind: "color",
    description: "Focus indication color.",
  },
  {
    id: "--bambi-muted",
    label: "Muted",
    group: "Semantic",
    kind: "color",
    description: "Subtle fill color for inactive states.",
  },
  {
    id: "--bambi-input",
    label: "Input border",
    group: "Component",
    kind: "color",
    description: "Input border token.",
  },
  {
    id: "--bambi-input-background",
    label: "Input background",
    group: "Component",
    kind: "color",
    description: "Input surface token.",
  },
  {
    id: "--bambi-input-foreground",
    label: "Input foreground",
    group: "Component",
    kind: "color",
    description: "Input text token.",
  },
  {
    id: "--bambi-input-placeholder",
    label: "Input placeholder",
    group: "Component",
    kind: "color",
    description: "Placeholder text token.",
  },
  {
    id: "--bambi-intent-primary-bg",
    label: "Primary intent background",
    group: "Intent",
    kind: "color",
    description: "Primary intent fill color.",
  },
  {
    id: "--bambi-intent-primary-fg",
    label: "Primary intent foreground",
    group: "Intent",
    kind: "color",
    description: "Text on primary intent surfaces.",
  },
  {
    id: "--bambi-intent-primary-hover-bg",
    label: "Primary intent hover",
    group: "Intent",
    kind: "color",
    description: "Hover fill color for primary intent controls.",
  },
  {
    id: "--bambi-radius-sm",
    label: "Radius sm",
    group: "Primitive",
    kind: "radius",
    description: "Small component radius.",
  },
  {
    id: "--bambi-radius-md",
    label: "Radius md",
    group: "Primitive",
    kind: "radius",
    description: "Default control radius.",
  },
  {
    id: "--bambi-radius-lg",
    label: "Radius lg",
    group: "Primitive",
    kind: "radius",
    description: "Large surface radius.",
  },
  {
    id: "--bambi-radius-full",
    label: "Radius full",
    group: "Primitive",
    kind: "radius",
    description: "Fully rounded controls.",
  },
  {
    id: "--bambi-shadow-sm",
    label: "Shadow sm",
    group: "Primitive",
    kind: "shadow",
    description: "Subtle elevation shadow.",
  },
  {
    id: "--bambi-state-disabled-opacity",
    label: "Disabled opacity",
    group: "Intent",
    kind: "opacity",
    description: "Opacity applied to disabled controls.",
  },
];

export const tokenDefinitionMap = new Map(
  tokenDefinitions.map((definition) => [definition.id, definition]),
);
