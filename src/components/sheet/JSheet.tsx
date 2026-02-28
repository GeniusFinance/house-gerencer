"use client";

import React, {
  useEffect,
  useImperativeHandle,
  useRef,
  forwardRef,
} from "react";
import { HotTable } from "@handsontable/react-wrapper";
import type { HotTableRef } from "@handsontable/react-wrapper";
import { registerAllModules } from "handsontable/registry";
import "handsontable/styles/handsontable.min.css";
import "handsontable/styles/ht-theme-main.min.css";

registerAllModules();

export interface JSheetHandle {
  getSelectedRowIndices: () => number[];
  getData: () => string[][];
}

interface JSheetProps {
  columns: string[];
  rows: Array<{ id: string; values: Record<string, unknown> }>;
  onSelectionChange?: (rowIndices: number[]) => void;
  onCellChange?: (rowIndex: number, colIndex: number, value: string) => void;
  isLoading?: boolean;
}

function toData(
  columns: string[],
  rows: Array<{ id: string; values: Record<string, unknown> }>
): string[][] {
  if (!rows.length) return [columns.map(() => "")];
  return rows.map((r) =>
    columns.map((c) => {
      const v = r.values[c];
      if (v === null || v === undefined) return "";
      if (typeof v === "object") return JSON.stringify(v);
      return String(v);
    })
  );
}

export const JSheet = forwardRef<JSheetHandle, JSheetProps>(function JSheet(
  { columns, rows, onSelectionChange, onCellChange, isLoading = false },
  ref
) {
  const hotRef = useRef<HotTableRef>(null);

  useEffect(() => {
    const hot = hotRef.current?.hotInstance;
    if (!hot) return;
    hot.updateSettings({
      data: toData(columns, rows),
      colHeaders: columns,
    });
  }, [columns, rows]);

  useImperativeHandle(ref, () => ({
    getSelectedRowIndices: () => {
      const hot = hotRef.current?.hotInstance;
      if (!hot) return [];
      const ranges = hot.getSelected();
      if (!ranges) return [];
      const set = new Set<number>();
      for (const [r1, , r2] of ranges) {
        const from = Math.min(r1, r2);
        const to = Math.max(r1, r2);
        for (let r = from; r <= to; r++) set.add(r);
      }
      return Array.from(set).sort((a, b) => a - b);
    },
    getData: () => {
      const hot = hotRef.current?.hotInstance;
      if (!hot) return [];
      return (hot.getData() as unknown[][]).map((row) =>
        row.map((cell) => String(cell ?? ""))
      );
    },
  }));

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-gray-400 animate-pulse">
        Loading…
      </div>
    );
  }

  return (
    <HotTable
      ref={hotRef}
      themeName="ht-theme-main-dark-auto"
      // other options
      data={toData(columns, rows)}
      rowHeaders
      colHeaders={columns}
      height="auto"
      autoWrapRow
      autoWrapCol
      width="100%"
      licenseKey="non-commercial-and-evaluation"
      stretchH="all"
      manualRowResize
      manualColumnResize
      columnSorting
      contextMenu
      afterChange={(changes, source) => {
        if (!changes || source === "loadData") return;
        for (const [row, col, , newVal] of changes) {
          onCellChange?.(row as number, col as number, String(newVal ?? ""));
        }
      }}
      afterSelection={(r1, _c1, r2) => {
        const from = Math.min(r1, r2);
        const to = Math.max(r1, r2);
        const indices: number[] = [];
        for (let r = from; r <= to; r++) indices.push(r);
        onSelectionChange?.(indices);
      }}
    />
  );
});
