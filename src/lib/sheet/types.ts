/**
 * Sheet Interface Types
 * Simulates Google Sheets with entity pages
 */

export type SheetCellValue = string | number | boolean | Date | null;

export interface SheetRow {
  id: string; // Row ID (usually entity ID)
  values: Record<string, SheetCellValue>;
  rowIndex: number;
  selected?: boolean;
}

export interface SheetColumn {
  name: string; // Column header/property name
  type: 'string' | 'number' | 'boolean' | 'date' | 'uuid' | 'decimal' | 'relation';
  editable: boolean;
  width?: number;
  frozen?: boolean;
}

export interface SheetPage {
  name: string; // Entity name (Expense, Account, etc.)
  entityType: string; // TypeORM entity name
  columns: SheetColumn[];
  rows: SheetRow[];
  totalRows: number;
  selectedRows: Set<string>; // Row IDs selected for bulk operations
}

export interface CopyOperation {
  sourcePageName: string;
  rowIds: string[];
  columns?: string[]; // If undefined, copy all columns
  timestamp: number;
}

export interface PasteOptions {
  targetPageName: string;
  mode: 'insert' | 'update' | 'replace'; // insert: new rows, update: existing rows, replace: delete all then insert
  includeRelations?: boolean;
  startRowIndex?: number;
}

export interface BulkDeleteOptions {
  pageName: string;
  rowIds: string[];
  hard?: boolean; // Hard delete vs soft delete (status change)
}

export interface SheetClipboard {
  data: SheetRow[];
  sourcePageName: string;
  sourceColumns: SheetColumn[];
  operation: CopyOperation;
}

export interface SheetOperationResult {
  success: boolean;
  message: string;
  affectedRows: number;
  timestamp: number;
}

export interface SheetSchema {
  pages: Record<string, SheetPage>;
  clipboard?: SheetClipboard;
  history: SheetOperation[];
}

export interface SheetOperation {
  id: string;
  type: 'copy' | 'paste' | 'delete' | 'update' | 'create';
  pageName: string;
  affectedRows: number;
  timestamp: number;
  reversible: boolean;
}

/**
 * Entity metadata for sheet columns
 */
export interface EntityColumnMetadata {
  fieldName: string;
  columnType: SheetColumn['type'];
  editable: boolean;
  required?: boolean;
  relationEntity?: string;
}

export interface EntityMetadata {
  name: string;
  displayName: string;
  columns: EntityColumnMetadata[];
}
