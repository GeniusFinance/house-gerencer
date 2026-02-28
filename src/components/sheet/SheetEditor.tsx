"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { JSheet } from "./JSheet";
import type { JSheetHandle } from "./JSheet";
import { DeleteModal } from "./modals";
import { NotificationContainer, useNotifications } from "./notifications";

const SHEETS = [
  "Plano de desejo",
  "Expenses",
  "Credit",
  "Incomes",
  "Orçamento",
  "Transfers",
];

interface SheetEditorProps {
  initialPage?: string;
  onLoadPage?: (page: string) => Promise<Record<string, unknown>>;
}

type Row = { id: string; values: Record<string, unknown> };

export function SheetEditor({
  initialPage = "Expenses",
  onLoadPage,
}: Readonly<SheetEditorProps>) {
  const [activeSheet, setActiveSheet] = useState(initialPage);
  const [rows, setRows] = useState<Row[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRowIndices, setSelectedRowIndices] = useState<number[]>([]);
  const [clipboard, setClipboard] = useState<Row[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const jsheetRef = useRef<JSheetHandle>(null);
  const { notifications, addSuccess, addError, dismissNotification } =
    useNotifications();

  const loadPageData = useCallback(
    async (sheet: string) => {
      setIsLoading(true);
      setSelectedRowIndices([]);
      try {
        let data: Record<string, unknown>;

        if (onLoadPage) {
          data = await onLoadPage(sheet);
        } else {
          const res = await fetch(
            `/api/db-sheet/${encodeURIComponent(sheet)}`,
            { cache: "no-store" }
          );
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          data = (await res.json()) as Record<string, unknown>;
        }

        setColumns((data.columns as string[]) || []);
        setRows((data.rows as Row[]) || []);
      } catch {
        addError("Failed to load " + sheet);
      } finally {
        setIsLoading(false);
      }
    },
    [onLoadPage, addError]
  );

  useEffect(() => {
    void loadPageData(activeSheet);
  }, [activeSheet, loadPageData]);

  const handleCopy = useCallback(() => {
    const indices =
      (jsheetRef.current?.getSelectedRowIndices() ?? []).length > 0
        ? jsheetRef.current!.getSelectedRowIndices()
        : selectedRowIndices;

    if (!indices.length) {
      addError("Select rows to copy");
      return;
    }

    const copied = indices
      .filter((i: number) => i >= 0 && i < rows.length)
      .map((i: number) => rows[i]);

    setClipboard(copied);
    addSuccess(
      "Copied " +
        String(copied.length) +
        " row" +
        (copied.length > 1 ? "s" : "")
    );
  }, [selectedRowIndices, rows, addSuccess, addError]);

  const handlePaste = useCallback(() => {
    if (!clipboard.length) {
      addError("Clipboard is empty — copy rows first");
      return;
    }
    const now = Date.now();
    const newRows = clipboard.map((r, i) => ({
      id: "copy_" + String(now) + "_" + String(i),
      values: { ...r.values },
    }));
    setRows((prev) => [...prev, ...newRows]);
    addSuccess(
      "Pasted " +
        String(newRows.length) +
        " row" +
        (newRows.length > 1 ? "s" : "")
    );
  }, [clipboard, addSuccess, addError]);

  const handleDelete = useCallback(
    async (hard: boolean) => {
      const indices =
        (jsheetRef.current?.getSelectedRowIndices() ?? []).length > 0
          ? jsheetRef.current!.getSelectedRowIndices()
          : selectedRowIndices;

      if (!indices.length) {
        addError("Select rows to delete");
        return;
      }

      if (hard) {
        const indexSet = new Set(indices);
        setRows((prev) => prev.filter((_, i) => !indexSet.has(i)));
        addSuccess(
          "Deleted " +
            String(indices.length) +
            " row" +
            (indices.length > 1 ? "s" : "")
        );
        setSelectedRowIndices([]);
        return;
      }

      try {
        const rowIds = indices
          .filter((i: number) => rows[i])
          .map((i: number) => rows[i].id);
        const res = await fetch("/api/sheet/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pageName: activeSheet, rowIds, hard }),
        });
        const data = (await res.json()) as {
          success: boolean;
          message: string;
          affectedRows: number;
        };
        if (data.success) {
          addSuccess(data.message, data.affectedRows);
        }
      } catch {
        addError("Delete failed");
      }
    },
    [activeSheet, selectedRowIndices, rows, addSuccess, addError]
  );

  const selectedCount = selectedRowIndices.length;

  return (
    <div
      className="flex flex-col h-screen bg-white overflow-hidden"
      style={{
        fontSize: 13,
        fontFamily: "Google Sans,Roboto,Arial,sans-serif",
      }}
    >
      <JSheet
        ref={jsheetRef}
        columns={columns}
        rows={rows}
        isLoading={isLoading}
        onSelectionChange={setSelectedRowIndices}
      />

      <div
        className="flex items-stretch border-t border-gray-300 shrink-0 overflow-x-auto"
        style={{ height: 32, background: "#f1f3f4" }}
      >
        {SHEETS.map((sheet) => {
          const isActive = sheet === activeSheet;
          return (
            <button
              key={sheet}
              onClick={() => setActiveSheet(sheet)}
              className="relative shrink-0 flex items-center h-full px-4 text-xs border-r border-gray-300 transition-colors whitespace-nowrap"
              style={{
                background: isActive ? "#fff" : "transparent",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#1a73e8" : "#444",
                borderBottom: isActive ? "3px solid #1a73e8" : "none",
              }}
            >
              {sheet}
            </button>
          );
        })}
      </div>

      <DeleteModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleDelete}
        rowsToDelete={selectedCount}
        isLoading={isLoading}
      />
      <NotificationContainer
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </div>
  );
}
