import type { ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import {
  AspectRatio,
  AspectRatioContent,
} from "@/src/components/ui/aspect-ratio";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Callout,
  CalloutDescription,
  CalloutIcon,
  CalloutTitle,
} from "@/src/components/ui/callout";
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
import { Code } from "@/src/components/ui/code";
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/src/components/ui/combobox";
import { Container } from "@/src/components/ui/container";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Input } from "@/src/components/ui/input";
import { Kbd } from "@/src/components/ui/kbd";
import { Label } from "@/src/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import {
  RadioGroup,
  RadioGroupIndicator,
  RadioGroupItem,
  RadioGroupLabel,
} from "@/src/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectTrigger,
  SelectValuePart,
  SelectViewport,
} from "@/src/components/ui/select";
import { Separator } from "@/src/components/ui/separator";
import {
  Slider,
  SliderRange,
  SliderThumb,
  SliderTrack,
} from "@/src/components/ui/slider";
import { Spinner } from "@/src/components/ui/spinner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import { Switch, SwitchLabel, SwitchThumb } from "@/src/components/ui/switch";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";

export type ComponentCategory = "Actions" | "Inputs" | "Display";

export interface StudioComponentDefinition {
  id: string;
  name: string;
  category: ComponentCategory;
  description: string;
  tokenIds: string[];
  preview: ReactNode;
  statePreview?: ReactNode;
}

const CORE_COMPONENT_IDS = new Set([
  "accordion",
  "button",
  "card",
  "checkbox",
  "combobox",
  "dialog",
  "dropdown-menu",
  "input",
  "popover",
  "radio-group",
  "select",
  "slider",
  "switch",
  "tabs",
  "textarea",
]);

const allStudioComponents: StudioComponentDefinition[] = [
  {
    id: "button",
    name: "Button",
    category: "Actions",
    description:
      "Primary user actions with intent, size, loading and disabled states.",
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
    statePreview: (
      <div className="flex flex-wrap items-center gap-3">
        <Button>Default</Button>
        <Button loading>Loading</Button>
        <Button disabled>Disabled</Button>
      </div>
    ),
  },
  {
    id: "card",
    name: "Card",
    category: "Display",
    description:
      "A surface for grouped content, actions and supporting metadata.",
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
          <CardDescription>
            Inspect how surfaces react to token overrides.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Cards inherit semantic surface, border, radius and shadow tokens.
          </p>
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
    description:
      "Text input with background, border, ring and placeholder tokens.",
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
    statePreview: (
      <div className="grid max-w-sm gap-3">
        <Input placeholder="Default" />
        <Input invalid placeholder="Invalid" />
        <Input disabled placeholder="Disabled" />
      </div>
    ),
  },
  {
    id: "textarea",
    name: "Textarea",
    category: "Inputs",
    description:
      "Multi-line input using shared input surface and focus tokens.",
    tokenIds: [
      "--bambi-input-background",
      "--bambi-input-foreground",
      "--bambi-input-placeholder",
      "--bambi-input",
      "--bambi-radius-md",
      "--bambi-ring",
    ],
    preview: (
      <div className="grid max-w-sm gap-3">
        <Textarea placeholder="Describe the generated theme..." resize="none" />
        <Textarea invalid placeholder="Invalid feedback" resize="none" />
      </div>
    ),
    statePreview: (
      <div className="grid max-w-sm gap-3">
        <Textarea placeholder="Default" resize="none" />
        <Textarea invalid placeholder="Invalid" resize="none" />
        <Textarea disabled placeholder="Disabled" resize="none" />
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
    statePreview: (
      <div className="flex flex-wrap items-center gap-2">
        <Badge>Default</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="danger">Danger</Badge>
      </div>
    ),
  },
  {
    id: "code",
    name: "Code",
    category: "Display",
    description: "Inline and block code snippets for documentation surfaces.",
    tokenIds: [
      "--bambi-muted",
      "--bambi-foreground",
      "--bambi-radius-sm",
      "--bambi-space-4",
    ],
    preview: (
      <div className="grid gap-3">
        <p>
          Install with <Code>npx bambiui add button</Code>
        </p>
        <Code variant="block">{`const theme = createBambiTheme(tokens);`}</Code>
      </div>
    ),
  },
  {
    id: "separator",
    name: "Separator",
    category: "Display",
    description: "A visual divider that follows the semantic border token.",
    tokenIds: ["--bambi-border", "--bambi-space-4"],
    preview: (
      <div className="grid max-w-sm gap-4">
        <div className="flex items-center justify-between gap-4">
          <span>Light</span>
          <Separator />
          <span>Dark</span>
        </div>
        <Separator decorative />
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
    id: "slider",
    name: "Slider",
    category: "Inputs",
    description: "Range input for numeric token and setting controls.",
    tokenIds: [
      "--bambi-primary",
      "--bambi-secondary",
      "--bambi-background",
      "--bambi-ring",
      "--bambi-radius-full",
      "--bambi-shadow-sm",
    ],
    preview: (
      <div className="grid gap-4">
        <Slider
          defaultValue={[64]}
          min={0}
          max={100}
          step={1}
          aria-label="Opacity"
        >
          <SliderTrack>
            <SliderRange />
          </SliderTrack>
          <SliderThumb />
        </Slider>
        <Slider
          defaultValue={[28]}
          min={0}
          max={100}
          step={1}
          aria-label="Radius"
        >
          <SliderTrack>
            <SliderRange />
          </SliderTrack>
          <SliderThumb />
        </Slider>
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
  {
    id: "accordion",
    name: "Accordion",
    category: "Display",
    description:
      "Collapsible sections with keyboard navigation and state tokens.",
    tokenIds: [
      "--bambi-border",
      "--bambi-foreground",
      "--bambi-muted-foreground",
    ],
    preview: (
      <Accordion
        type="single"
        defaultValue="tokens"
        collapsible
        className="w-full max-w-md"
      >
        <AccordionItem value="tokens">
          <AccordionHeader>
            <AccordionTrigger>Token strategy</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>
            Primitive, semantic and component tokens stay inspectable.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="export">
          <AccordionHeader>
            <AccordionTrigger>Export flow</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>
            Copy CSS, JSON or BambiUI preset output from Studio.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    ),
  },
  {
    id: "aspect-ratio",
    name: "Aspect Ratio",
    category: "Display",
    description: "Media frame for predictable responsive preview regions.",
    tokenIds: ["--bambi-radius-lg", "--bambi-border", "--bambi-muted"],
    preview: (
      <AspectRatio
        ratio="16 / 9"
        className="w-full max-w-md overflow-hidden rounded-xl border border-[var(--bambi-border)] bg-[var(--bambi-muted)]"
      >
        <AspectRatioContent className="flex items-center justify-center text-sm text-[var(--bambi-muted-foreground)]">
          16:9 preview surface
        </AspectRatioContent>
      </AspectRatio>
    ),
  },
  {
    id: "callout",
    name: "Callout",
    category: "Display",
    description:
      "Contextual feedback blocks for info, success, warning and danger messages.",
    tokenIds: [
      "--bambi-primary",
      "--bambi-warning",
      "--bambi-danger",
      "--bambi-radius-md",
    ],
    preview: (
      <div className="grid gap-3">
        <Callout>
          <CalloutIcon>ℹ</CalloutIcon>
          <CalloutTitle>Theme generated</CalloutTitle>
          <CalloutDescription>
            Review contrast pairs before exporting your preset.
          </CalloutDescription>
        </Callout>
        <Callout variant="warning">
          <CalloutIcon>!</CalloutIcon>
          <CalloutTitle>Contrast warning</CalloutTitle>
          <CalloutDescription>
            Muted foreground may need adjustment on this surface.
          </CalloutDescription>
        </Callout>
      </div>
    ),
  },
  {
    id: "combobox",
    name: "Combobox",
    category: "Inputs",
    description: "Searchable choice input for token or component selection.",
    tokenIds: [
      "--bambi-input",
      "--bambi-popover",
      "--bambi-ring",
      "--bambi-radius-md",
    ],
    preview: (
      <Combobox defaultValue="button" placeholder="Search component…">
        <div className="flex max-w-sm gap-2">
          <ComboboxInput />
          <ComboboxTrigger
            data-bambi-button=""
            data-variant="primary"
            data-size="md"
          >
            Search
          </ComboboxTrigger>
        </div>
        <ComboboxContent>
          <ComboboxList>
            <ComboboxItem data-value="button">Button</ComboboxItem>
            <ComboboxItem data-value="input">Input</ComboboxItem>
            <ComboboxItem data-value="card">Card</ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    ),
  },
  {
    id: "container",
    name: "Container",
    category: "Display",
    description: "Layout wrapper that constrains content width and rhythm.",
    tokenIds: ["--bambi-space-4", "--bambi-space-6", "--bambi-background"],
    preview: (
      <Container
        size="sm"
        className="rounded-xl border border-[var(--bambi-border)] bg-[var(--bambi-muted)] p-4"
      >
        <p className="text-sm">
          Contained Studio content with responsive max width.
        </p>
      </Container>
    ),
  },
  {
    id: "dialog",
    name: "Dialog",
    category: "Display",
    description:
      "Modal surface with trigger, overlay content and close affordances.",
    tokenIds: [
      "--bambi-popover",
      "--bambi-border",
      "--bambi-shadow-lg",
      "--bambi-radius-lg",
    ],
    preview: (
      <Dialog defaultOpen={false}>
        <DialogTrigger
          data-bambi-button=""
          data-variant="primary"
          data-size="md"
        >
          Open dialog
        </DialogTrigger>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent>
            <DialogTitle>Export theme</DialogTitle>
            <DialogDescription>
              Dialog content uses popover, border, radius and shadow tokens.
            </DialogDescription>
            <DialogClose className="mt-3">Close</DialogClose>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    ),
  },
  {
    id: "dropdown-menu",
    name: "Dropdown Menu",
    category: "Actions",
    description: "Layered command menu for export and navigation actions.",
    tokenIds: [
      "--bambi-popover",
      "--bambi-accent",
      "--bambi-border",
      "--bambi-radius-md",
    ],
    preview: (
      <DropdownMenu defaultOpen={false}>
        <DropdownMenuTrigger
          data-bambi-button=""
          data-variant="primary"
          data-size="md"
        >
          Theme actions
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <DropdownMenuLabel>Export as</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>CSS variables</DropdownMenuItem>
            <DropdownMenuItem>Bambi preset</DropdownMenuItem>
            <DropdownMenuItem>JSON tokens</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    ),
  },
  {
    id: "kbd",
    name: "Kbd",
    category: "Display",
    description: "Keyboard shortcut glyphs for interaction hints.",
    tokenIds: ["--bambi-muted", "--bambi-border", "--bambi-radius-sm"],
    preview: (
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
        <span>Open command menu</span>
      </div>
    ),
  },
  {
    id: "label",
    name: "Label",
    category: "Inputs",
    description: "Accessible form labels that align with control states.",
    tokenIds: [
      "--bambi-foreground",
      "--bambi-muted-foreground",
      "--bambi-text-sm",
    ],
    preview: (
      <div className="grid max-w-sm gap-2">
        <Label htmlFor="studio-theme-name">Theme name</Label>
        <Input id="studio-theme-name" placeholder="Bambi Night" />
      </div>
    ),
  },
  {
    id: "popover",
    name: "Popover",
    category: "Display",
    description: "Anchored floating content for quick edits and metadata.",
    tokenIds: [
      "--bambi-popover",
      "--bambi-popover-foreground",
      "--bambi-border",
      "--bambi-shadow-md",
    ],
    preview: (
      <Popover defaultOpen={false} portal>
        <PopoverTrigger
          data-bambi-button=""
          data-variant="primary"
          data-size="md"
        >
          Edit token
        </PopoverTrigger>
        <PopoverContent className="mt-3 max-w-xs">
          <strong>Primary hue</strong>
          <p className="mt-1 text-sm text-[var(--bambi-muted-foreground)]">
            Adjust generator values from the inspector.
          </p>
        </PopoverContent>
      </Popover>
    ),
  },
  {
    id: "radio-group",
    name: "Radio Group",
    category: "Inputs",
    description: "Mutually exclusive options for theme and export settings.",
    tokenIds: [
      "--bambi-primary",
      "--bambi-border",
      "--bambi-ring",
      "--bambi-radius-full",
    ],
    preview: (
      <RadioGroup defaultValue="light" ariaLabel="Theme mode">
        <RadioGroupItem value="light">
          <RadioGroupIndicator>●</RadioGroupIndicator>
          <RadioGroupLabel>Light mode</RadioGroupLabel>
        </RadioGroupItem>
        <RadioGroupItem value="dark">
          <RadioGroupIndicator>●</RadioGroupIndicator>
          <RadioGroupLabel>Dark mode</RadioGroupLabel>
        </RadioGroupItem>
      </RadioGroup>
    ),
  },
  {
    id: "select",
    name: "Select",
    category: "Inputs",
    description: "Single-select menu for component, scale and preset choices.",
    tokenIds: [
      "--bambi-input",
      "--bambi-popover",
      "--bambi-ring",
      "--bambi-radius-md",
    ],
    preview: (
      <Select
        defaultValue="primary"
        placeholder="Choose scale"
        defaultOpen={false}
      >
        <SelectTrigger>
          <SelectValuePart />
        </SelectTrigger>
        <SelectContent>
          <SelectViewport>
            <SelectItem data-value="primary">
              <SelectItemText>Primary</SelectItemText>
              <SelectItemIndicator>✓</SelectItemIndicator>
            </SelectItem>
            <SelectItem data-value="neutral">
              <SelectItemText>Neutral</SelectItemText>
              <SelectItemIndicator>✓</SelectItemIndicator>
            </SelectItem>
            <SelectItem data-value="danger">
              <SelectItemText>Danger</SelectItemText>
              <SelectItemIndicator>✓</SelectItemIndicator>
            </SelectItem>
          </SelectViewport>
        </SelectContent>
      </Select>
    ),
  },
  {
    id: "spinner",
    name: "Spinner",
    category: "Display",
    description: "Progress indicator used by loading buttons and async states.",
    tokenIds: [
      "--bambi-primary",
      "--bambi-muted",
      "--bambi-button-spinner-duration",
    ],
    preview: (
      <div className="flex items-center gap-4">
        <Spinner />
        <Spinner size="lg" />
        <span className="text-sm text-[var(--bambi-muted-foreground)]">
          Generating palette…
        </span>
      </div>
    ),
  },
  {
    id: "tabs",
    name: "Tabs",
    category: "Actions",
    description: "Tabbed navigation for inspector sections and preview states.",
    tokenIds: [
      "--bambi-primary",
      "--bambi-muted",
      "--bambi-border",
      "--bambi-radius-md",
    ],
    preview: <TabsPreview />,
  },
  {
    id: "tooltip",
    name: "Tooltip",
    category: "Display",
    description: "Lightweight contextual help for compact controls.",
    tokenIds: [
      "--bambi-popover",
      "--bambi-popover-foreground",
      "--bambi-border",
      "--bambi-shadow-sm",
    ],
    preview: (
      <Tooltip defaultOpen={false} portal>
        <TooltipTrigger
          data-bambi-button=""
          data-variant="primary"
          data-size="md"
        >
          Hover for token hint
        </TooltipTrigger>
        <TooltipContent className="mt-2">
          Uses semantic popover tokens.
        </TooltipContent>
      </Tooltip>
    ),
  },
];

export const studioComponents = allStudioComponents.filter((component) =>
  CORE_COMPONENT_IDS.has(component.id),
);

function TabsPreview() {
  return (
    <Tabs defaultValue="preview" className="w-full max-w-md">
      <TabsList>
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="tokens">Tokens</TabsTrigger>
        <TabsTrigger value="export">Export</TabsTrigger>
      </TabsList>
      <TabsContent
        value="preview"
        className="mt-3 rounded-xl border border-[var(--bambi-border)] p-4"
      >
        Component previews update live as tokens change.
      </TabsContent>
      <TabsContent
        value="tokens"
        className="mt-3 rounded-xl border border-[var(--bambi-border)] p-4"
      >
        Inspect primitive, semantic, intent and component token groups.
      </TabsContent>
      <TabsContent
        value="export"
        className="mt-3 rounded-xl border border-[var(--bambi-border)] p-4"
      >
        Export CSS variables, JSON or a BambiUI preset.
      </TabsContent>
    </Tabs>
  );
}

export const componentCategories: ComponentCategory[] = [
  "Actions",
  "Inputs",
  "Display",
];
