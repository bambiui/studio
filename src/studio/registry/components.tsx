import type { ReactNode } from "react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Checkbox,
  CheckboxIndicator,
  CheckboxLabel,
} from "@/src/components/ui/checkbox";
import { Input } from "@/src/components/ui/input";
import { Switch, SwitchLabel, SwitchThumb } from "@/src/components/ui/switch";

export type ComponentCategory = "Actions" | "Inputs" | "Display";

export interface StudioComponentDefinition {
  id: string;
  name: string;
  category: ComponentCategory;
  description: string;
  tokenIds: string[];
  preview: ReactNode;
}

export const studioComponents: StudioComponentDefinition[] = [
  {
    id: "button",
    name: "Button",
    category: "Actions",
    description: "Primary user actions with intent, size, loading and disabled states.",
    tokenIds: [
      "--bambi-intent-primary-bg",
      "--bambi-intent-primary-fg",
      "--bambi-intent-primary-hover-bg",
      "--bambi-radius-md",
      "--bambi-state-disabled-opacity",
    ],
    preview: (
      <div className="flex flex-wrap items-center gap-3">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="danger">Danger</Button>
      </div>
    ),
  },
  {
    id: "card",
    name: "Card",
    category: "Display",
    description: "A surface for grouped content, actions and supporting metadata.",
    tokenIds: [
      "--bambi-card",
      "--bambi-card-foreground",
      "--bambi-border",
      "--bambi-radius-lg",
      "--bambi-shadow-sm",
    ],
    preview: (
      <Card size="md" className="max-w-sm">
        <CardHeader>
          <CardTitle>Theme Preview</CardTitle>
          <CardDescription>Inspect how surfaces react to token overrides.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Cards inherit semantic surface, border, radius and shadow tokens.</p>
        </CardContent>
        <CardFooter>
          <Button size="sm">Apply</Button>
        </CardFooter>
      </Card>
    ),
  },
  {
    id: "input",
    name: "Input",
    category: "Inputs",
    description: "Text input with background, border, ring and placeholder tokens.",
    tokenIds: [
      "--bambi-input-background",
      "--bambi-input-foreground",
      "--bambi-input-placeholder",
      "--bambi-input",
      "--bambi-ring",
    ],
    preview: (
      <div className="grid max-w-sm gap-3">
        <Input placeholder="studio@bambiui.com" />
        <Input invalid placeholder="Invalid state" />
      </div>
    ),
  },
  {
    id: "badge",
    name: "Badge",
    category: "Display",
    description: "Compact status labels using semantic intent colors.",
    tokenIds: [
      "--bambi-primary",
      "--bambi-secondary",
      "--bambi-danger",
      "--bambi-success",
      "--bambi-warning",
    ],
    preview: (
      <div className="flex flex-wrap items-center gap-2">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="danger">Danger</Badge>
      </div>
    ),
  },
  {
    id: "switch",
    name: "Switch",
    category: "Inputs",
    description: "Boolean control for preference and setting surfaces.",
    tokenIds: [
      "--bambi-primary",
      "--bambi-muted",
      "--bambi-border",
      "--bambi-radius-full",
      "--bambi-state-disabled-opacity",
    ],
    preview: (
      <div className="flex flex-col gap-3">
        <Switch defaultChecked ariaLabel="Enable generated theme">
          <SwitchThumb />
          <SwitchLabel>Generated theme</SwitchLabel>
        </Switch>
        <Switch ariaLabel="Publish theme">
          <SwitchThumb />
          <SwitchLabel>Publish to gallery</SwitchLabel>
        </Switch>
      </div>
    ),
  },
  {
    id: "checkbox",
    name: "Checkbox",
    category: "Inputs",
    description: "Selection control with checked, disabled and invalid states.",
    tokenIds: [
      "--bambi-primary",
      "--bambi-primary-foreground",
      "--bambi-border",
      "--bambi-ring",
      "--bambi-radius-sm",
    ],
    preview: (
      <div className="flex flex-col gap-3">
        <Checkbox defaultChecked ariaLabel="Use semantic tokens">
          <CheckboxIndicator>✓</CheckboxIndicator>
          <CheckboxLabel>Use semantic tokens</CheckboxLabel>
        </Checkbox>
        <Checkbox ariaLabel="Sync with CLI">
          <CheckboxIndicator>✓</CheckboxIndicator>
          <CheckboxLabel>Sync with CLI</CheckboxLabel>
        </Checkbox>
      </div>
    ),
  },
];

export const componentCategories: ComponentCategory[] = ["Actions", "Inputs", "Display"];
