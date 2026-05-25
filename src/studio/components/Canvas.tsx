import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const MIN_SCALE = 0.1;
const MAX_SCALE = 4;
const GRID_SIZE = 16;
const DRAWER_LEFT_WIDTH = 220;
const DRAWER_RIGHT_WIDTH = 320;

export function Canvas({
  selectedComponentId,
  onSelectComponent,
  previewStyle,
}: CanvasProps) {
  const canvasRef = useRef<HTMLElement>(null);
  const transformRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef({ x: DRAWER_LEFT_WIDTH + 40, y: 156 });
  const scaleRef = useRef(1);
  const draggingRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0 });
  const spaceDownRef = useRef(false);
  const [zoomLabel, setZoomLabel] = useState(100);

  const selectedComponent = useMemo(
    () =>
      studioComponents.find(
        (component) => component.id === selectedComponentId,
      ),
    [selectedComponentId],
  );

  const applyTransform = useCallback((animated = false) => {
    const canvas = canvasRef.current;
    const transform = transformRef.current;
    if (!canvas || !transform) return;

    if (animated) {
      transform.style.transition =
        "transform 0.48s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
      window.setTimeout(() => {
        transform.style.transition = "";
      }, 520);
    } else {
      transform.style.transition = "";
    }

    const { x, y } = offsetRef.current;
    const scale = scaleRef.current;
    transform.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;

    let step = GRID_SIZE;
    while (step * scale < 12) step *= 2;
    const backgroundSize = step * scale;
    canvas.style.backgroundSize = `${backgroundSize}px ${backgroundSize}px`;
    canvas.style.backgroundPosition = `${x % backgroundSize}px ${
      y % backgroundSize
    }px`;
    setZoomLabel(Math.round(scale * 100));
  }, []);

  const zoomAt = useCallback(
    (mouseX: number, mouseY: number, factor: number) => {
      const currentScale = scaleRef.current;
      const nextScale = Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, currentScale * factor),
      );
      const ratio = nextScale / currentScale;
      const offset = offsetRef.current;
      offsetRef.current = {
        x: mouseX - (mouseX - offset.x) * ratio,
        y: mouseY - (mouseY - offset.y) * ratio,
      };
      scaleRef.current = nextScale;
      applyTransform();
    },
    [applyTransform],
  );

  const resetCanvasView = useCallback(
    (animated = true) => {
      offsetRef.current = { x: DRAWER_LEFT_WIDTH + 40, y: 156 };
      scaleRef.current = 1;
      applyTransform(animated);
    },
    [applyTransform],
  );

  const flyToCard = useCallback(
    (cardId: string, animated = true) => {
      const card = document.getElementById(`card-${cardId}`);
      if (!card) return;

      const left = card.offsetLeft;
      const top = card.offsetTop;
      const width = card.offsetWidth;
      const availableWidth =
        window.innerWidth - DRAWER_LEFT_WIDTH - DRAWER_RIGHT_WIDTH;
      const screenCenterX = DRAWER_LEFT_WIDTH + availableWidth / 2;

      scaleRef.current = 1;
      offsetRef.current = {
        x: screenCenterX - left - width / 2,
        y: 156 - top,
      };
      applyTransform(animated);
    },
    [applyTransform],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const transform = transformRef.current;
    if (!canvas || !transform) return;

    const syncBoardLayout = () => {
      const cardCount = transform.querySelectorAll(".card").length;
      const columns = cardCount <= 1 ? 1 : cardCount <= 4 ? 2 : 3;
      transform.style.setProperty("--builder-card-columns", String(columns));
    };

    const handleMouseDown = (event: MouseEvent) => {
      const onCanvas = event.target === canvas || event.target === transform;
      if (
        event.button === 1 ||
        (event.button === 0 && (spaceDownRef.current || onCanvas))
      ) {
        draggingRef.current = true;
        startRef.current = {
          x: event.clientX - offsetRef.current.x,
          y: event.clientY - offsetRef.current.y,
        };
        canvas.classList.add("panning");
        event.preventDefault();
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!draggingRef.current) return;
      offsetRef.current = {
        x: event.clientX - startRef.current.x,
        y: event.clientY - startRef.current.y,
      };
      applyTransform();
    };

    const stopDragging = () => {
      draggingRef.current = false;
      canvas.classList.remove("panning");
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditable =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable;
      if (isEditable) return;

      if (event.code === "Space" && !event.repeat) {
        spaceDownRef.current = true;
        canvas.style.cursor = "grab";
        event.preventDefault();
      }

      if (
        (event.metaKey || event.ctrlKey) &&
        (event.key === "=" || event.key === "+")
      ) {
        zoomAt(window.innerWidth / 2, window.innerHeight / 2, 1.2);
        event.preventDefault();
      }

      if ((event.metaKey || event.ctrlKey) && event.key === "-") {
        zoomAt(window.innerWidth / 2, window.innerHeight / 2, 1 / 1.2);
        event.preventDefault();
      }

      if ((event.metaKey || event.ctrlKey) && event.key === "0") {
        resetCanvasView();
        event.preventDefault();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        spaceDownRef.current = false;
        canvas.style.cursor = "grab";
      }
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (event.ctrlKey || event.metaKey) {
        zoomAt(event.clientX, event.clientY, event.deltaY < 0 ? 1.1 : 1 / 1.1);
      } else {
        offsetRef.current = {
          x: offsetRef.current.x - event.deltaX,
          y: offsetRef.current.y - event.deltaY,
        };
        applyTransform();
      }
    };

    const handleResize = () => {
      syncBoardLayout();
      if (selectedComponentId) flyToCard(selectedComponentId, false);
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopDragging);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("resize", handleResize);
    canvas.addEventListener("wheel", handleWheel, { passive: false });

    syncBoardLayout();
    applyTransform();

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopDragging);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [applyTransform, flyToCard, resetCanvasView, selectedComponentId, zoomAt]);

  useEffect(() => {
    if (!selectedComponentId) return;
    window.requestAnimationFrame(() => flyToCard(selectedComponentId));
  }, [flyToCard, selectedComponentId]);

  return (
    <section
      id="canvas"
      ref={canvasRef}
      aria-label="BambiUI Studio free canvas"
      className="studio-canvas-shell"
    >
      <div className="studio-canvas-toolbar" aria-label="Canvas controls">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">
            Free canvas
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Space + drag pan · wheel pan · Cmd/Ctrl + wheel zoom · Cmd/Ctrl + 0
            reset
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
            {zoomLabel}%
          </span>
          <button
            type="button"
            onClick={() => flyToCard(selectedComponentId)}
            className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-slate-200 transition hover:bg-white/10"
          >
            Focus {selectedComponent?.name ?? "selected"}
          </button>
          <button
            type="button"
            onClick={() => resetCanvasView()}
            className="rounded-full bg-violet-500 px-3 py-1 text-xs font-medium text-white transition hover:bg-violet-400"
          >
            Reset view
          </button>
        </div>
      </div>

      <div id="canvas-transform" ref={transformRef}>
        <StudioHeroCard isSelected={selectedComponentId === "hero"} />
        <ColorSystemCard isSelected={selectedComponentId === "colors"} />
        <TypographyCard isSelected={selectedComponentId === "typography"} />
        {studioComponents.map((component) => (
          <CanvasCard
            key={component.id}
            component={component}
            isSelected={component.id === selectedComponentId}
            onSelect={() => onSelectComponent(component.id)}
            previewStyle={previewStyle}
          />
        ))}
      </div>
    </section>
  );
}

interface FoundationCardProps {
  isSelected: boolean;
}

function StudioHeroCard({ isSelected }: FoundationCardProps) {
  return (
    <article
      id="card-hero"
      className={`card studio-hero-card ${isSelected ? "active" : ""}`}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">
          BambiUI Studio
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
          Pan, zoom and inspect every component on a single board.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
          This canvas now follows the archived Studio structure: a fixed
          <span className="font-mono"> #canvas </span>viewport with a
          transformed
          <span className="font-mono"> #canvas-transform </span>board,
          card-based component previews, panning and keyboard zoom controls.
        </p>
      </div>
      <div className="grid w-full gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <strong className="text-2xl text-white">
            {studioComponents.length}
          </strong>
          <p className="mt-1 text-xs text-slate-400">components on board</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <strong className="text-2xl text-white">4×</strong>
          <p className="mt-1 text-xs text-slate-400">maximum zoom</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <strong className="text-2xl text-white">16px</strong>
          <p className="mt-1 text-xs text-slate-400">adaptive grid</p>
        </div>
      </div>
    </article>
  );
}

const colorFamilies = [
  "primary",
  "neutral",
  "danger",
  "success",
  "warning",
] as const;
const colorSteps = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950",
] as const;

function ColorSystemCard({ isSelected }: FoundationCardProps) {
  return (
    <article
      id="card-colors"
      className={`card studio-foundation-card ${isSelected ? "active" : ""}`}
    >
      <header className="cardHeader">
        <div>
          <h3 className="text-base font-semibold text-[var(--bambi-primary)]">
            Color System
          </h3>
          <p className="component-description">
            Primary, neutral and semantic scales generated from Bambi tokens.
          </p>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
          {colorFamilies.length} scales
        </span>
      </header>
      <div className="grid w-[min(720px,calc(100vw-3rem))] gap-4 rounded-[1.25rem] border border-[var(--bambi-border)] bg-[var(--bambi-background)] p-5 text-[var(--bambi-foreground)]">
        {colorFamilies.map((family) => (
          <div key={family} className="grid gap-2">
            <div className="flex items-center justify-between gap-3">
              <strong className="text-sm capitalize">{family}</strong>
              <code className="text-xs text-[var(--bambi-muted-foreground)]">
                --bambi-{family}-*
              </code>
            </div>
            <div className="grid grid-cols-11 overflow-hidden rounded-xl border border-[var(--bambi-border)]">
              {colorSteps.map((step) => (
                <div
                  key={`${family}-${step}`}
                  className="min-h-12"
                  title={`${family}-${step}`}
                >
                  <div
                    className="h-9"
                    style={{ background: `var(--bambi-${family}-${step})` }}
                  />
                  <div className="bg-[var(--bambi-card)] py-1 text-center text-[9px] text-[var(--bambi-muted-foreground)]">
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

const typeSamples = [
  {
    label: "Display",
    className: "text-4xl font-bold tracking-tight",
    text: "Build with BambiUI",
  },
  {
    label: "Heading",
    className: "text-2xl font-semibold",
    text: "Theme-aware component previews",
  },
  {
    label: "Body",
    className: "text-base",
    text: "Inspect semantic, intent and component tokens directly on the canvas.",
  },
  {
    label: "Caption",
    className: "text-xs uppercase tracking-[0.2em]",
    text: "Primitive scale",
  },
] as const;

function TypographyCard({ isSelected }: FoundationCardProps) {
  return (
    <article
      id="card-typography"
      className={`card studio-foundation-card ${isSelected ? "active" : ""}`}
    >
      <header className="cardHeader">
        <div>
          <h3 className="text-base font-semibold text-[var(--bambi-primary)]">
            Typography
          </h3>
          <p className="component-description">
            Font family, size, weight, radius and shadow primitives in one
            preview.
          </p>
        </div>
      </header>
      <div className="grid w-[min(720px,calc(100vw-3rem))] gap-5 rounded-[1.25rem] border border-[var(--bambi-border)] bg-[var(--bambi-background)] p-6 text-[var(--bambi-foreground)]">
        {typeSamples.map((sample) => (
          <div key={sample.label} className="grid gap-1">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--bambi-muted-foreground)]">
              {sample.label}
            </span>
            <p className={sample.className}>{sample.text}</p>
          </div>
        ))}
        <div className="grid gap-3 border-t border-[var(--bambi-separator)] pt-5 sm:grid-cols-3">
          {["sm", "md", "lg"].map((size) => (
            <div
              key={size}
              className="rounded-[var(--bambi-radius-lg)] border border-[var(--bambi-border)] p-4 shadow-[var(--bambi-shadow-sm)]"
            >
              <strong className="text-sm uppercase">Radius {size}</strong>
              <p className="mt-2 text-sm text-[var(--bambi-muted-foreground)]">
                Shadow and radius tokens
              </p>
            </div>
          ))}
        </div>
      </div>
    </article>
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
      id={`card-${component.id}`}
      className={`card studio-component-card ${isSelected ? "active" : ""}`}
      data-card={component.id}
    >
      <header className="cardHeader">
        <div>
          <h3 className="text-base font-semibold text-[var(--bambi-primary)]">
            {component.name}
          </h3>
          <p className="component-description">{component.description}</p>
        </div>
        <button
          type="button"
          onClick={onSelect}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            isSelected
              ? "bg-violet-500 text-white"
              : "border border-white/10 text-slate-300 hover:bg-white/10"
          }`}
        >
          {isSelected ? "Selected" : "Inspect"}
        </button>
      </header>
      <div
        className="bambi-preview component-preview-card rounded-[1.25rem] border border-[var(--bambi-border)] bg-[var(--bambi-background)] p-6 text-[var(--bambi-foreground)]"
        style={previewStyle}
      >
        {component.preview}
        {component.statePreview ? (
          <div className="preview-section mt-5">
            <p className="preview-section-label">States</p>
            {component.statePreview}
          </div>
        ) : null}
      </div>
    </article>
  );
}
