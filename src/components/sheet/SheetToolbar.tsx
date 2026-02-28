/**
 * Sheet Operations Toolbar
 * Buttons for copy, paste, delete, and other bulk operations
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Clipboard, Trash2, RotateCcw, Info } from 'lucide-react';

interface SheetToolbarProps {
  selectedRowsCount: number;
  hasClipboard: boolean;
  onCopy: () => void;
  onPaste: () => void;
  onDelete: () => void;
  onClearSelection: () => void;
  isLoading?: boolean;
  currentPageName?: string;
}

export function SheetToolbar({
  selectedRowsCount,
  hasClipboard,
  onCopy,
  onPaste,
  onDelete,
  onClearSelection,
  isLoading = false,
  currentPageName,
}: SheetToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-white border-b border-gray-200 rounded-t-lg">
      {/* Copy Button */}
      <Button
        onClick={onCopy}
        disabled={selectedRowsCount === 0 || isLoading}
        variant={selectedRowsCount > 0 ? 'default' : 'secondary'}
        className="gap-2"
        title="Copy selected rows to clipboard"
      >
        <Copy size={16} />
        Copy ({selectedRowsCount})
      </Button>

      {/* Paste Button */}
      <Button
        onClick={onPaste}
        disabled={!hasClipboard || isLoading}
        variant={hasClipboard ? 'default' : 'secondary'}
        className="gap-2"
        title="Paste rows from clipboard"
      >
        <Clipboard size={16} />
        Paste
      </Button>

      {/* Delete Button */}
      <Button
        onClick={onDelete}
        disabled={selectedRowsCount === 0 || isLoading}
        variant={selectedRowsCount > 0 ? 'destructive' : 'secondary'}
        className="gap-2"
        title="Delete selected rows"
      >
        <Trash2 size={16} />
        Delete ({selectedRowsCount})
      </Button>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-300 mx-2"></div>

      {/* Clear Selection */}
      <Button
        onClick={onClearSelection}
        disabled={selectedRowsCount === 0 || isLoading}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <RotateCcw size={16} />
        Clear
      </Button>

      {/* Info Section */}
      <div className="ml-auto flex items-center gap-2 text-sm text-gray-600">
        {hasClipboard && (
          <div className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-md">
            <Info size={14} className="text-blue-600" />
            <span className="text-blue-700">Clipboard ready</span>
          </div>
        )}
        {currentPageName && (
          <span className="text-gray-500">Page: <span className="font-semibold">{currentPageName}</span></span>
        )}
      </div>
    </div>
  );
}
