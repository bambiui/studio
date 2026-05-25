"use client";

import { useEffect, useMemo, useState } from "react";
import { PREVIEW_SCHEMES, STORAGE_KEY } from "../constants";
import { studioComponents } from "../registry/components";
import {
  createDarkThemeFromBaseColor,
  createThemeFromBaseColor,
} from "../theme/generator";
import { parseThemeImport } from "../theme/importers";
import type { TokenOverrides } from "../tokens/defaults";
import type { PreviewScheme, StudioStyle } from "../types";
import { BuilderDrawerLeft } from "./BuilderDrawerLeft";
import { Canvas } from "./Canvas";
import { ExportDialog } from "./ExportDialog";
import { InspectorPanel } from "./InspectorPanel";
import { TopBar } from "./TopBar";

export function StudioShell() {
  const [selectedComponentId, setSelectedComponentId] = useState("hero");
  const [tokenOverrides, setTokenOverrides] = useState<TokenOverrides>({});
  const [historyPast, setHistoryPast] = useState<TokenOverrides[]>([]);
  const [historyFuture, setHistoryFuture] = useState<TokenOverrides[]>([]);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);
  const [previewScheme, setPreviewScheme] = useState<PreviewScheme>("light");
  const [importMessage, setImportMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedTheme = window.localStorage.getItem(STORAGE_KEY);
      if (storedTheme) {
        setTokenOverrides(JSON.parse(storedTheme) as TokenOverrides);
      }
    } finally {
      setHasLoadedStorage(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedStorage) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tokenOverrides));
  }, [hasLoadedStorage, tokenOverrides]);

  const selectedComponent = useMemo(
    () =>
      studioComponents.find(
        (component) => component.id === selectedComponentId,
      ),
    [selectedComponentId],
  );

  const previewStyle = useMemo(
    () =>
      ({ ...tokenOverrides, ...PREVIEW_SCHEMES[previewScheme] }) as StudioStyle,
    [previewScheme, tokenOverrides],
  );

  const chromeStyle = useMemo(
    () =>
      ({ ...tokenOverrides, ...PREVIEW_SCHEMES[previewScheme] }) as StudioStyle,
    [previewScheme, tokenOverrides],
  );

  useEffect(() => {
    document.documentElement.dataset.theme = previewScheme;
  }, [previewScheme]);

  const commitTokenOverrides = (
    updater: TokenOverrides | ((current: TokenOverrides) => TokenOverrides),
  ) => {
    setTokenOverrides((current) => {
      const next = typeof updater === "function" ? updater(current) : updater;
      setHistoryPast((past) => [...past, current]);
      setHistoryFuture([]);
      return next;
    });
  };

  const updateToken = (tokenId: string, value: string) => {
    commitTokenOverrides((current) => {
      if (!value.trim()) {
        const next = { ...current };
        delete next[tokenId];
        return next;
      }

      return {
        ...current,
        [tokenId]: value,
      };
    });
  };

  const resetTokens = () => commitTokenOverrides({});

  const undoThemeChange = () => {
    setHistoryPast((past) => {
      const previous = past[past.length - 1];
      if (!previous) return past;
      setHistoryFuture((future) => [tokenOverrides, ...future]);
      setTokenOverrides(previous);
      return past.slice(0, -1);
    });
  };

  const redoThemeChange = () => {
    setHistoryFuture((future) => {
      const next = future[0];
      if (!next) return future;
      setHistoryPast((past) => [...past, tokenOverrides]);
      setTokenOverrides(next);
      return future.slice(1);
    });
  };

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const modifier = event.metaKey || event.ctrlKey;
      if (!modifier) return;

      const key = event.key.toLowerCase();
      if (key === "z" && event.shiftKey) {
        event.preventDefault();
        redoThemeChange();
      } else if (key === "z") {
        event.preventDefault();
        undoThemeChange();
      } else if (key === "y") {
        event.preventDefault();
        redoThemeChange();
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  });

  const applyGeneratedTheme = (baseColor: string) => {
    commitTokenOverrides((current) => ({
      ...current,
      ...createThemeFromBaseColor(baseColor),
    }));
  };

  const applyGeneratedDarkTheme = (baseColor: string) => {
    commitTokenOverrides((current) => ({
      ...current,
      ...createDarkThemeFromBaseColor(baseColor),
    }));
    setPreviewScheme("dark");
  };

  const importTheme = async (file: File) => {
    try {
      const source = await file.text();
      const importedTokens = parseThemeImport(source);
      commitTokenOverrides(importedTokens);
      setImportMessage(`Imported ${Object.keys(importedTokens).length} tokens`);
    } catch (error) {
      setImportMessage(
        error instanceof Error ? error.message : "Theme import failed",
      );
    }
  };

  return (
    <div className="studio-root" style={chromeStyle}>
      <BuilderDrawerLeft
        selectedComponentId={selectedComponentId}
        previewScheme={previewScheme}
        onChangePreviewScheme={setPreviewScheme}
        onSelectComponent={setSelectedComponentId}
      />
      <main className="studio-main">
        <div className="studio-chrome-bar">
          <TopBar
            tokenCount={Object.keys(tokenOverrides).length}
            importMessage={importMessage}
            canUndo={historyPast.length > 0}
            canRedo={historyFuture.length > 0}
            onImportTheme={importTheme}
            onUndo={undoThemeChange}
            onRedo={redoThemeChange}
            onOpenExport={() => setIsExportOpen(true)}
          />
        </div>
        <Canvas
          selectedComponentId={selectedComponentId}
          onSelectComponent={setSelectedComponentId}
          previewStyle={previewStyle}
        />
      </main>
      <div
        id="drawer-right"
        className="token-drawer-content xl:fixed xl:bottom-0 xl:right-0 xl:top-0 xl:z-30 xl:w-[320px] xl:overflow-auto"
      >
        <InspectorPanel
          selectedComponent={selectedComponent}
          tokenOverrides={tokenOverrides}
          onUpdateToken={updateToken}
          onResetTokens={resetTokens}
          previewScheme={previewScheme}
          onApplyGeneratedTheme={applyGeneratedTheme}
          onApplyGeneratedDarkTheme={applyGeneratedDarkTheme}
        />
      </div>
      <ExportDialog
        isOpen={isExportOpen}
        tokens={tokenOverrides}
        previewTokens={PREVIEW_SCHEMES[previewScheme]}
        previewScheme={previewScheme}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
}
