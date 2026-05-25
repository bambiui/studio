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
    <header className="flex h-16 items-center justify-between border-b border-white/10 bg-[#11172a]/95 px-6 backdrop-blur">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-violet-300">
          BambiUI Platform
        </p>
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-white">Studio</h1>
          {importMessage ? (
            <span className="hidden text-xs text-slate-500 md:inline">
              {importMessage}
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-3 text-sm text-slate-300">
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
          {tokenCount} override
        </span>
        <div className="hidden rounded-full border border-white/10 bg-black/20 p-1 md:flex">
          <Button
            variant="ghost"
            size="sm"
            disabled={!canUndo}
            onClick={onUndo}
            className="rounded-full px-3 py-1 text-xs"
          >
            Undo
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={!canRedo}
            onClick={onRedo}
            className="rounded-full px-3 py-1 text-xs"
          >
            Redo
          </Button>
        </div>
        <Button
          as="label"
          variant="outline"
          className="cursor-pointer rounded-full px-4 py-2 font-medium"
        >
          Import
          <Input
            type="file"
            accept="application/json,.json,text/css,.css"
            className="sr-only"
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
          className="rounded-full px-4 py-2 font-medium shadow-lg shadow-violet-950/40"
        >
          Export
        </Button>
      </div>
    </header>
  );
}
