import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";

export interface CanvasHeaderControls {
  zoomLabel: number;
  selectedComponentName: string | null;
  onFocusSelected: () => void;
  onResetView: () => void;
}

interface TopBarProps {
  tokenCount: number;
  importMessage: string | null;
  canUndo: boolean;
  canRedo: boolean;
  canvasControls: CanvasHeaderControls | null;
  onImportTheme: (file: File) => void;
  onUndo: () => void;
  onRedo: () => void;
  onOpenExport: () => void;
}

export function TopBar({
  tokenCount,
  importMessage,
  canUndo,
  canRedo,
  canvasControls,
  onImportTheme,
  onUndo,
  onRedo,
  onOpenExport,
}: TopBarProps) {
  return (
    <header className="studio-topbar">
      <div className="studio-topbar-heading">
        <div>
          <p className="studio-kicker">BambiUI Platform</p>
          <div className="studio-title-row">
            <h1 className="studio-title">Studio</h1>
            {importMessage ? (
              <span className="studio-muted-note">{importMessage}</span>
            ) : null}
          </div>
        </div>
        <div className="studio-canvas-heading" aria-label="Canvas mode">
          <span className="studio-canvas-heading-title">Free canvas</span>
          <span className="studio-muted-note">
            Space + drag pan · wheel pan · Cmd/Ctrl + wheel zoom · Cmd/Ctrl + 0
            reset
          </span>
        </div>
      </div>
      <div className="studio-topbar-actions">
        {canvasControls ? (
          <div className="studio-inline-actions" aria-label="Canvas controls">
            <span className="studio-pill">{canvasControls.zoomLabel}%</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={canvasControls.onFocusSelected}
              className="studio-action-button"
            >
              Focus {canvasControls.selectedComponentName ?? "selected"}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={canvasControls.onResetView}
              className="studio-action-button"
            >
              Reset view
            </Button>
          </div>
        ) : null}
        <Button
          as="a"
          href="https://bambiui.com/docs/"
          variant="ghost"
          size="sm"
          className="studio-action-button"
        >
          Docs
        </Button>
        <Button
          as="a"
          href="https://bambiui.com"
          variant="ghost"
          size="sm"
          className="studio-action-button"
        >
          bambiui.com
        </Button>
        <span className="studio-pill">{tokenCount} override</span>
        <div className="studio-button-group">
          <Button
            variant="ghost"
            size="sm"
            disabled={!canUndo}
            onClick={onUndo}
            className="studio-action-button"
          >
            Undo
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={!canRedo}
            onClick={onRedo}
            className="studio-action-button"
          >
            Redo
          </Button>
        </div>
        <Button as="label" variant="outline" className="studio-primary-action">
          Import
          <Input
            type="file"
            accept="application/json,.json,text/css,.css"
            className="studio-sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onImportTheme(file);
              event.currentTarget.value = "";
            }}
          />
        </Button>
        <Button
          type="button"
          onClick={onOpenExport}
          className="studio-primary-action"
        >
          Export
        </Button>
      </div>
    </header>
  );
}
