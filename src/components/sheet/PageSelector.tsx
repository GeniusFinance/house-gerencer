/**
 * Sheet Page Selector
 * Navigate between different entity sheets
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Grid3x3, Database } from 'lucide-react';

interface SheetPageSelectorProps {
  pages: string[];
  currentPage: string;
  onPageChange: (page: string) => void;
  isLoading?: boolean;
  pageStats?: Record<
    string,
    {
      totalRows: number;
      selectedRows: number;
      columns: number;
    }
  >;
}

export function SheetPageSelector({
  pages,
  currentPage,
  onPageChange,
  isLoading = false,
  pageStats,
}: SheetPageSelectorProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-gray-200">
      <Database size={16} className="text-gray-600" />
      <span className="text-sm font-semibold text-gray-700">Sheet Pages:</span>

      {/* Desktop: Button Group */}
      <div className="hidden md:flex gap-2 flex-wrap">
        {pages.map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPageChange(page)}
            disabled={isLoading}
            className="gap-1"
          >
            {page}
            {pageStats?.[page]?.totalRows !== undefined && (
              <span className="text-xs opacity-75">
                ({pageStats[page].totalRows})
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Mobile: Dropdown */}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isLoading} className="gap-2">
              {currentPage}
              <ChevronDown size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {pages.map((page) => (
              <DropdownMenuItem
                key={page}
                onClick={() => onPageChange(page)}
                className={currentPage === page ? 'bg-blue-50' : ''}
              >
                <span className="flex-1">{page}</span>
                {pageStats?.[page]?.totalRows !== undefined && (
                  <span className="text-xs text-gray-500">
                    {pageStats[page].totalRows} rows
                  </span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Current Page Info */}
      {pageStats?.[currentPage] && (
        <div className="ml-auto text-xs text-gray-600 hidden lg:flex gap-4">
          <span>Rows: <span className="font-semibold">{pageStats[currentPage].totalRows}</span></span>
          <span>Columns: <span className="font-semibold">{pageStats[currentPage].columns}</span></span>
        </div>
      )}
    </div>
  );
}
