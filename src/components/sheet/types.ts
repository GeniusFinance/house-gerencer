/**
 * Sheet GUI - Types for the UI
 */

export interface SheetUIState {
  currentPage: string;
  selectedRows: Set<string>;
  clipboard: {
    rowCount: number;
    columnCount: number;
    sourcePageName: string;
  } | null;
  isLoading: boolean;
}

export interface OperationNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  affectedRows?: number;
  timestamp: number;
  duration?: number; // ms before auto-dismiss
}

export interface SheetTableRow {
  id: string;
  cells: (string | number | boolean | null)[];
  selected?: boolean;
}

export interface SheetModal {
  type: 'paste' | 'delete' | 'export' | null;
  isOpen: boolean;
  data?: any;
}
