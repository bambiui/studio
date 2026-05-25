import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";

interface TopBarProps {
  tokenCount: number;
  importMessage: string | null;
  canUndo: boolean;
  canRedo: boolean;
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
  onImportTheme,
  onUndo,
  onRedo,
  onOpenExport,
}: TopBarProps) {
  return (
    <header className="studio-topbar">
      <div>
        <p className="studio-kicker">BambiUI Platform</p>
        <div className="studio-title-row">
          <h1 className="studio-title">Studio</h1>
          {importMessage ? (
            <span className="studio-muted-note">{importMessage}</span>
          ) : null}
        </div>
      </div>
      <div className="studio-topbar-actions">
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
