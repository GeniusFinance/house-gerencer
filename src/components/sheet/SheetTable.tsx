/**
 * Sheet Table Component
 * Displays sheet data with Google Sheets-like cell selection
 */

'use client';

import React, { useState, useCallback } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface CellCoord {
  rowId: string;
  column: string;
}

interface SheetTableProps {
  columns: string[];
  rows: Array<{ id: string; values: Record<string, any> }>;
  selectedCells: Set<string>; // Format: "rowId:column"
  onSelectCell: (cell: CellCoord, addToSelection: boolean) => void;
  onSelectRange: (startCell: CellCoord, endCell: CellCoord) => void;
  onSelectColumn: (column: string) => void;
  onSelectRow: (rowId: string, addToSelection: boolean) => void;
  onSelectAll: () => void;
  isLoading?: boolean;
}

export function SheetTable({
  columns,
  rows,
  selectedCells,
  onSelectCell,
  onSelectRange,
  onSelectColumn,
  onSelectRow,
  onSelectAll,
  isLoading = false,
}: SheetTableProps) {
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDesc, setSortDesc] = useState(false);
  const [lastSelectedCell, setLastSelectedCell] = useState<CellCoord | null>(null);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDesc(!sortDesc);
    } else {
      setSortBy(column);
      setSortDesc(false);
    }
  };

  const getCellKey = (rowId: string, column: string): string => `${rowId}:${column}`;
  const isCellSelected = (rowId: string, column: string): boolean =>
    selectedCells.has(getCellKey(rowId, column));

  const handleCellClick = useCallback((rowId: string, column: string, e: React.MouseEvent) => {
    e.preventDefault();
    const cell: CellCoord = { rowId, column };

    if (e.ctrlKey || e.metaKey) {
      // Ctrl/Cmd + Click: Toggle cell
      onSelectCell(cell, true);
      setLastSelectedCell(cell);
    } else if (e.shiftKey && lastSelectedCell) {
      // Shift + Click: Select range
      onSelectRange(lastSelectedCell, cell);
    } else {
      // Regular click: Select single cell
      onSelectCell(cell, false);
      setLastSelectedCell(cell);
    }
  }, [lastSelectedCell, onSelectCell, onSelectRange]);

  const handleColumnHeaderClick = useCallback((column: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      onSelectColumn(column);
    } else {
      handleSort(column);
    }
  }, [onSelectColumn]);

  const handleRowHeaderClick = useCallback((rowId: string, e: React.MouseEvent) => {
    e.preventDefault();
    onSelectRow(rowId, e.ctrlKey || e.metaKey);
  }, [onSelectRow]);

  const renderCellValue = (value: any): string => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value).slice(0, 50);
    return String(value);
  };

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {/* Header */}
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
            <tr>
              <th
                className="px-3 py-2 text-left text-xs font-semibold text-gray-700 w-12 border-r border-gray-200 bg-gray-100 cursor-pointer hover:bg-gray-200"
                onClick={() => onSelectAll()}
                title="Click to select all"
              >
                #
              </th>
              {columns.map((column) => (
                <th
                  key={column}
                  onClick={(e) => handleColumnHeaderClick(column, e)}
                  className="px-3 py-2 text-left text-xs font-semibold text-gray-900 cursor-pointer hover:bg-blue-100 transition-colors border-r border-gray-200 select-none"
                  title={`Click to sort • Ctrl+Click to select column`}
                >
                  <div className="flex items-center gap-2">
                    <span className="truncate">{column}</span>
                    {sortBy === column && (
                      <span className="text-xs flex-shrink-0">
                        {sortDesc ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-gray-500">
                  <div className="flex justify-center items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border border-gray-300 border-t-blue-600"></div>
                    Loading data...
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-gray-500">
                  No data available. Load data from database first.
                </td>
              </tr>
            ) : (
              rows.map((row, rowIndex) => (
                <tr key={row.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td
                    onClick={(e) => handleRowHeaderClick(row.id, e)}
                    className="px-3 py-2 text-xs text-gray-500 w-12 border-r border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-200 select-none text-center font-medium"
                    title="Click to select row • Ctrl+Click to toggle"
                  >
                    {rowIndex + 1}
                  </td>
                  {columns.map((column) => {
                    const isSelected = isCellSelected(row.id, column);
                    return (
                      <td
                        key={`${row.id}-${column}`}
                        onClick={(e) => handleCellClick(row.id, column, e)}
                        className={`px-3 py-2 text-sm h-10 cursor-cell select-none border-r border-gray-200 transition-colors ${
                          isSelected
                            ? 'bg-blue-200 text-gray-900'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        title={`${renderCellValue(row.values[column])} (Click to select • Shift+Click to range • Ctrl+Click to multi-select)`}
                      >
                        <span className="truncate block max-w-xs">
                          {renderCellValue(row.values[column])}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {rows.length > 0 && (
        <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 text-xs text-gray-600 flex justify-between">
          <div>
            <span className="font-medium">{rows.length}</span> rows •{' '}
            <span className="font-medium">{columns.length}</span> columns
          </div>
          <div>
            <span className="font-medium">{selectedCells.size}</span> cells selected
          </div>
        </div>
      )}
    </div>
  );
}
