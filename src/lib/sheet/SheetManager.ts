/**
 * Sheet Manager
 * Handles sheet operations: copy, paste, delete, and bulk operations
 */

import { v4 as uuid } from 'uuid';
import {
  SheetSchema,
  SheetPage,
  SheetRow,
  SheetClipboard,
  SheetColumn,
  CopyOperation,
  PasteOptions,
  BulkDeleteOptions,
  SheetOperationResult,
  SheetOperation,
  SheetCellValue,
} from './types';
import { getEntityMetadata, metadataToSheetColumns } from './entityMetadata';

export class SheetManager {
  private schema: SheetSchema;
  private maxHistorySize = 100;

  constructor(initialPages?: string[]) {
    this.schema = {
      pages: {},
      history: [],
    };

    if (initialPages) {
      initialPages.forEach((pageName) => this.initializePage(pageName));
    }
  }

  /**
   * Initialize a sheet page for an entity
   */
  initializePage(entityName: string): void {
    const metadata = getEntityMetadata(entityName);
    if (!metadata) {
      throw new Error(`Entity "${entityName}" not found in metadata`);
    }

    const columns = metadataToSheetColumns(metadata);

    this.schema.pages[entityName] = {
      name: entityName,
      entityType: entityName,
      columns,
      rows: [],
      totalRows: 0,
      selectedRows: new Set(),
    };
  }

  /**
   * Get a sheet page
   */
  getPage(pageName: string): SheetPage | null {
    return this.schema.pages[pageName] || null;
  }

  /**
   * Get all available pages
   */
  getAllPages(): string[] {
    return Object.keys(this.schema.pages);
  }

  /**
   * Add rows to a page (simulates fetched data)
   */
  addRows(pageName: string, rows: SheetRow[]): SheetOperationResult {
    const page = this.getPage(pageName);
    if (!page) {
      return {
        success: false,
        message: `Page "${pageName}" not found`,
        affectedRows: 0,
        timestamp: Date.now(),
      };
    }

    rows.forEach((row, index) => {
      row.rowIndex = page.rows.length + index;
      row.selected = false;
    });

    page.rows.push(...rows);
    page.totalRows = page.rows.length;

    return {
      success: true,
      message: `Added ${rows.length} rows to page "${pageName}"`,
      affectedRows: rows.length,
      timestamp: Date.now(),
    };
  }

  /**
   * Select rows for bulk operations
   */
  selectRows(pageName: string, rowIds: string[]): SheetOperationResult {
    const page = this.getPage(pageName);
    if (!page) {
      return {
        success: false,
        message: `Page "${pageName}" not found`,
        affectedRows: 0,
        timestamp: Date.now(),
      };
    }

    page.selectedRows.clear();
    rowIds.forEach((id) => {
      const row = page.rows.find((r) => r.id === id);
      if (row) {
        page.selectedRows.add(id);
        row.selected = true;
      }
    });

    return {
      success: true,
      message: `Selected ${page.selectedRows.size} rows`,
      affectedRows: page.selectedRows.size,
      timestamp: Date.now(),
    };
  }

  /**
   * Clear row selection
   */
  clearSelection(pageName: string): void {
    const page = this.getPage(pageName);
    if (page) {
      page.selectedRows.forEach((id) => {
        const row = page.rows.find((r) => r.id === id);
        if (row) row.selected = false;
      });
      page.selectedRows.clear();
    }
  }

  /**
   * Copy bulk operation
   * Copies selected rows to clipboard
   */
  copyRows(pageName: string, columns?: string[]): SheetOperationResult {
    const page = this.getPage(pageName);
    if (!page) {
      return {
        success: false,
        message: `Page "${pageName}" not found`,
        affectedRows: 0,
        timestamp: Date.now(),
      };
    }

    if (page.selectedRows.size === 0) {
      return {
        success: false,
        message: `No rows selected in page "${pageName}"`,
        affectedRows: 0,
        timestamp: Date.now(),
      };
    }

    const selectedRowIds = Array.from(page.selectedRows);
    const rowsToCopy = page.rows.filter((r) => page.selectedRows.has(r.id));
    const columnsToUse = columns || page.columns.map((c) => c.name);

    // Filter row values to only include selected columns
    const copiedRows = rowsToCopy.map((row) => ({
      ...row,
      values: columnsToUse.reduce(
        (acc, col) => {
          acc[col] = row.values[col];
          return acc;
        },
        {} as Record<string, SheetCellValue>,
      ),
    }));

    const sourceColumns = page.columns.filter((c) => columnsToUse.includes(c.name));

    const operation: CopyOperation = {
      sourcePageName: pageName,
      rowIds: selectedRowIds,
      columns: columnsToUse,
      timestamp: Date.now(),
    };

    this.schema.clipboard = {
      data: copiedRows,
      sourcePageName: pageName,
      sourceColumns,
      operation,
    };

    this.addToHistory({
      id: uuid(),
      type: 'copy',
      pageName,
      affectedRows: selectedRowIds.length,
      timestamp: Date.now(),
      reversible: false,
    });

    return {
      success: true,
      message: `Copied ${selectedRowIds.length} rows from page "${pageName}"`,
      affectedRows: selectedRowIds.length,
      timestamp: Date.now(),
    };
  }

  /**
   * Paste bulk operation
   * Pastes rows from clipboard to target page
   */
  pasteRows(options: PasteOptions): SheetOperationResult {
    const { targetPageName, mode = 'insert', includeRelations = false, startRowIndex = 0 } = options;

    if (!this.schema.clipboard) {
      return {
        success: false,
        message: 'Clipboard is empty. Please copy rows first.',
        affectedRows: 0,
        timestamp: Date.now(),
      };
    }

    const targetPage = this.getPage(targetPageName);
    if (!targetPage) {
      return {
        success: false,
        message: `Target page "${targetPageName}" not found`,
        affectedRows: 0,
        timestamp: Date.now(),
      };
    }

    const { data: copiedRows, sourcePageName } = this.schema.clipboard;

    if (copiedRows.length === 0) {
      return {
        success: false,
        message: 'No rows in clipboard',
        affectedRows: 0,
        timestamp: Date.now(),
      };
    }

    try {
      let affectedRows = 0;

      if (mode === 'replace') {
        // Clear all rows and insert new ones
        targetPage.rows = [];
        const newRows = this.createNewRows(copiedRows, targetPage);
        targetPage.rows.push(...newRows);
        affectedRows = newRows.length;
      } else if (mode === 'insert') {
        // Insert rows at specified index
        const newRows = this.createNewRows(copiedRows, targetPage);
        targetPage.rows.splice(startRowIndex, 0, ...newRows);
        this.updateRowIndices(targetPage);
        affectedRows = newRows.length;
      } else if (mode === 'update') {
        // Update existing rows matching by ID
        affectedRows = this.updateExistingRows(copiedRows, targetPage);
      }

      targetPage.totalRows = targetPage.rows.length;

      this.addToHistory({
        id: uuid(),
        type: 'paste',
        pageName: targetPageName,
        affectedRows,
        timestamp: Date.now(),
        reversible: mode === 'insert', // Only insert mode is easily reversible
      });

      return {
        success: true,
        message: `Pasted ${affectedRows} rows to page "${targetPageName}" (mode: ${mode})`,
        affectedRows,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        message: `Error pasting rows: ${error instanceof Error ? error.message : 'Unknown error'}`,
        affectedRows: 0,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Delete bulk operation
   * Deletes selected rows from a page
   */
  deleteRows(options: BulkDeleteOptions): SheetOperationResult {
    const { pageName, rowIds, hard = true } = options;

    const page = this.getPage(pageName);
    if (!page) {
      return {
        success: false,
        message: `Page "${pageName}" not found`,
        affectedRows: 0,
        timestamp: Date.now(),
      };
    }

    if (rowIds.length === 0) {
      return {
        success: false,
        message: 'No rows to delete',
        affectedRows: 0,
        timestamp: Date.now(),
      };
    }

    let deletedCount = 0;

    if (hard) {
      // Hard delete: remove rows completely
      const initialLength = page.rows.length;
      page.rows = page.rows.filter((row) => !rowIds.includes(row.id));
      deletedCount = initialLength - page.rows.length;
      this.updateRowIndices(page);
    } else {
      // Soft delete: mark as deleted (change status)
      rowIds.forEach((id) => {
        const row = page.rows.find((r) => r.id === id);
        if (row && 'status' in row.values) {
          row.values['status'] = 'deleted';
          deletedCount++;
        }
      });
    }

    page.totalRows = page.rows.length;
    page.selectedRows.clear();

    this.addToHistory({
      id: uuid(),
      type: 'delete',
      pageName,
      affectedRows: deletedCount,
      timestamp: Date.now(),
      reversible: false, // Hard delete is not reversible, soft delete could be
    });

    const deleteType = hard ? 'hard deleted' : 'soft deleted';
    return {
      success: true,
      message: `${deleteType.charAt(0).toUpperCase() + deleteType.slice(1)} ${deletedCount} rows from page "${pageName}"`,
      affectedRows: deletedCount,
      timestamp: Date.now(),
    };
  }

  /**
   * Clear clipboard
   */
  clearClipboard(): void {
    this.schema.clipboard = undefined;
  }

  /**
   * Get clipboard contents
   */
  getClipboard(): SheetClipboard | undefined {
    return this.schema.clipboard;
  }

  /**
   * Get operation history
   */
  getHistory(limit?: number): SheetOperation[] {
    const history = this.schema.history;
    return limit ? history.slice(-limit) : history;
  }

  /**
   * Get schema for export
   */
  getSchema(): SheetSchema {
    return {
      ...this.schema,
      pages: Object.entries(this.schema.pages).reduce(
        (acc, [name, page]) => {
          acc[name] = { ...page, selectedRows: Array.from(page.selectedRows) as any };
          return acc;
        },
        {} as Record<string, any>,
      ),
    };
  }

  /**
   * Get page statistics
   */
  getPageStats(pageName: string) {
    const page = this.getPage(pageName);
    if (!page) return null;

    return {
      name: pageName,
      totalRows: page.totalRows,
      selectedRows: page.selectedRows.size,
      columns: page.columns.length,
      columnNames: page.columns.map((c) => c.name),
    };
  }

  /**
   * Get all pages statistics
   */
  getAllPagesStats() {
    return this.getAllPages().map((pageName) => this.getPageStats(pageName));
  }

  // Private helper methods

  private createNewRows(sourceRows: SheetRow[], targetPage: SheetPage): SheetRow[] {
    return sourceRows.map((sourceRow) => ({
      id: uuid(), // Generate new IDs for pasted rows
      values: { ...sourceRow.values },
      rowIndex: targetPage.rows.length,
      selected: false,
    }));
  }

  private updateExistingRows(sourceRows: SheetRow[], targetPage: SheetPage): number {
    let updatedCount = 0;

    sourceRows.forEach((sourceRow) => {
      const existingRow = targetPage.rows.find((r) => r.id === sourceRow.id);
      if (existingRow) {
        existingRow.values = { ...sourceRow.values };
        updatedCount++;
      }
    });

    return updatedCount;
  }

  private updateRowIndices(page: SheetPage): void {
    page.rows.forEach((row, index) => {
      row.rowIndex = index;
    });
  }

  private addToHistory(operation: SheetOperation): void {
    this.schema.history.push(operation);

    // Keep history size manageable
    if (this.schema.history.length > this.maxHistorySize) {
      this.schema.history = this.schema.history.slice(-this.maxHistorySize);
    }
  }
}
