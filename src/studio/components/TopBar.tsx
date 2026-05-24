import type { PreviewScheme } from "../types";

interface TopBarProps {
  tokenCount: number;
  previewScheme: PreviewScheme;
  importMessage: string | null;
  onChangePreviewScheme: (scheme: PreviewScheme) => void;
  onImportTheme: (file: File) => void;
  onOpenExport: () => void;
}

export function TopBar({
  tokenCount,
  previewScheme,
  importMessage,
  onChangePreviewScheme,
  onImportTheme,
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
        <div className="hidden rounded-full border border-white/10 bg-black/20 p-1 sm:flex">
          {(["light", "dark"] as const).map((scheme) => (
            <button
              key={scheme}
              type="button"
              onClick={() => onChangePreviewScheme(scheme)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition ${
                previewScheme === scheme
                  ? "bg-violet-500 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {scheme}
            </button>
          ))}
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
          {tokenCount} override
        </span>
        <label className="cursor-pointer rounded-full border border-white/10 px-4 py-2 font-medium text-slate-200 transition hover:bg-white/10">
          Import
          <input
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onImportTheme(file);
              event.currentTarget.value = "";
            }}
          />
        </label>
        <button
          type="button"
          onClick={onOpenExport}
          className="rounded-full bg-violet-500 px-4 py-2 font-medium text-white shadow-lg shadow-violet-950/40 transition hover:bg-violet-400"
        >
          Export
        </button>
      </div>
    </header>
  );
}
