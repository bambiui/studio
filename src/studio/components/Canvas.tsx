import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--bambi-primary)]">
            Free canvas
          </p>
          <p className="mt-1 text-xs text-[var(--bambi-muted-foreground)]">
            Space + drag pan · wheel pan · Cmd/Ctrl + wheel zoom · Cmd/Ctrl + 0
            reset
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[var(--bambi-border)] bg-[var(--bambi-muted)] px-3 py-1 text-xs text-[var(--bambi-muted-foreground)]">
            {zoomLabel}%
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => flyToCard(selectedComponentId)}
            className="rounded-full px-3 py-1 text-xs"
          >
            Focus {selectedComponent?.name ?? "selected"}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => resetCanvasView()}
            className="rounded-full px-3 py-1 text-xs"
          >
            Reset view
          </Button>
        </div>
      </div>

      <div id="canvas-transform" ref={transformRef}>
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
    <Card
      id={`card-${component.id}`}
      className={`card studio-component-card ${isSelected ? "active" : ""}`}
      data-card={component.id}
    >
      <CardHeader className="cardHeader">
        <div>
          <CardTitle className="text-base font-semibold text-[var(--bambi-primary)]">
            {component.name}
          </CardTitle>
          <CardDescription className="component-description">
            {component.description}
          </CardDescription>
        </div>
        <Button
          type="button"
          variant={isSelected ? "primary" : "outline"}
          size="sm"
          onClick={onSelect}
          className="rounded-full px-3 py-1 text-xs"
        >
          {isSelected ? "Selected" : "Inspect"}
        </Button>
      </CardHeader>
      <CardContent
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
      </CardContent>
    </Card>
  );
}
