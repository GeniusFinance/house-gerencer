/**
 * Sheet Configuration
 * Setup and initialization for production use
 */

import { Repository } from 'typeorm';
import { SheetService } from './SheetService';
import { Expense } from '@/src/entities/Expense';
import { Account } from '@/src/entities/Account';
import { Transfer } from '@/src/entities/Transfer';
import { Income } from '@/src/entities/Income';
import { Credit } from '@/src/entities/Credit';
import { Category } from '@/src/entities/Category';
import { Tag } from '@/src/entities/Tag';
import { CreditCard } from '@/src/entities/CreditCard';
import { Person } from '@/src/entities/Person';
import { Budget } from '@/src/entities/Budget';

/**
 * Initialize Sheet Service with all repositories
 * Call this once at application startup
 */
export async function initializeSheetService(
  repositories: {
    Expense: Repository<Expense>;
    Account: Repository<Account>;
    Transfer: Repository<Transfer>;
    Income: Repository<Income>;
    Credit: Repository<Credit>;
    Category: Repository<Category>;
    Tag: Repository<Tag>;
    CreditCard: Repository<CreditCard>;
    Person: Repository<Person>;
    Budget: Repository<Budget>;
  },
): Promise<SheetService> {
  const sheetService = new SheetService({
    repositories: {
      Expense: repositories.Expense,
      Account: repositories.Account,
      Transfer: repositories.Transfer,
      Income: repositories.Income,
      Credit: repositories.Credit,
      Category: repositories.Category,
      Tag: repositories.Tag,
      CreditCard: repositories.CreditCard,
      Person: repositories.Person,
      Budget: repositories.Budget,
    },
  });

  console.log('✅ Sheet Service initialized');
  console.log('Available pages:', sheetService.getSheetManager().getAllPages());

  return sheetService;
}

/**
 * Usage in Next.js API route: /api/sheet/init
 */
export async function handleSheetInit() {
  try {
    // In a real app, get repositories from AppDataSource
    const sheetService = await initializeSheetService({
      Expense: null as any,
      Account: null as any,
      Transfer: null as any,
      Income: null as any,
      Credit: null as any,
      Category: null as any,
      Tag: null as any,
      CreditCard: null as any,
      Person: null as any,
      Budget: null as any,
    });

    return {
      success: true,
      message: 'Sheet Service initialized successfully',
      pages: sheetService.getSheetManager().getAllPages(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Global Sheet Service instance
 * Access throughout the application
 */
let globalSheetService: SheetService | null = null;

export function getSheetService(): SheetService {
  if (!globalSheetService) {
    throw new Error('Sheet Service not initialized. Call initializeSheetService first.');
  }
  return globalSheetService;
}

export function setSheetService(service: SheetService): void {
  globalSheetService = service;
}

/**
 * Middleware for loading sheet data before operations
 * Can be used to ensure fresh data
 */
export async function reloadSheetData(): Promise<Record<string, any>> {
  const sheetService = getSheetService();
  return await sheetService.loadAllEntities();
}

/**
 * Configuration for common operations
 */
export const SHEET_CONFIG = {
  // Maximum number of rows per page before pagination
  MAX_ROWS_PER_PAGE: 1000,

  // Maximum operations in history
  MAX_HISTORY_SIZE: 100,

  // Auto-save to database after paste
  AUTO_SAVE_AFTER_PASTE: false,

  // Allow soft delete by default
  ALLOW_SOFT_DELETE: true,

  // Default paste mode
  DEFAULT_PASTE_MODE: 'insert' as const,

  // Enable operation history
  ENABLE_HISTORY: true,

  // Parse dates automatically
  AUTO_PARSE_DATES: true,

  // Entity-specific configs
  ENTITY_CONFIGS: {
    Expense: {
      softDeleteField: 'status',
      softDeleteValue: 'deleted',
    },
    Account: {
      softDeleteField: 'isActive',
      softDeleteValue: false,
    },
    Transfer: {
      softDeleteField: 'status',
      softDeleteValue: 'cancelled',
    },
    Income: {
      softDeleteField: 'status',
      softDeleteValue: 'cancelled',
    },
    Credit: {
      softDeleteField: 'status',
      softDeleteValue: 'cancelled',
    },
    Category: {
      softDeleteField: null,
      softDeleteValue: null,
    },
    Tag: {
      softDeleteField: null,
      softDeleteValue: null,
    },
    CreditCard: {
      softDeleteField: 'status',
      softDeleteValue: 'inactive',
    },
    Person: {
      softDeleteField: null,
      softDeleteValue: null,
    },
    Budget: {
      softDeleteField: 'status',
      softDeleteValue: 'archived',
    },
  },
};

/**
 * Validation for sheet operations
 */
export function validateBulkCopyRequest(request: any): { valid: boolean; error?: string } {
  if (!request.sourcePage) {
    return { valid: false, error: 'sourcePage is required' };
  }

  if (!Array.isArray(request.rowIds) || request.rowIds.length === 0) {
    return { valid: false, error: 'rowIds must be a non-empty array' };
  }

  if (request.columns && !Array.isArray(request.columns)) {
    return { valid: false, error: 'columns must be an array' };
  }

  return { valid: true };
}

export function validateBulkPasteRequest(request: any): { valid: boolean; error?: string } {
  if (!request.targetPage) {
    return { valid: false, error: 'targetPage is required' };
  }

  if (!['insert', 'update', 'replace'].includes(request.mode)) {
    return { valid: false, error: 'mode must be insert, update, or replace' };
  }

  return { valid: true };
}

export function validateBulkDeleteRequest(request: any): { valid: boolean; error?: string } {
  if (!request.pageName) {
    return { valid: false, error: 'pageName is required' };
  }

  if (!Array.isArray(request.rowIds) || request.rowIds.length === 0) {
    return { valid: false, error: 'rowIds must be a non-empty array' };
  }

  if (typeof request.hard !== 'boolean' && request.hard !== undefined) {
    return { valid: false, error: 'hard must be a boolean' };
  }

  return { valid: true };
}

/**
 * Error handling utilities
 */
export function formatOperationError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}

export function createErrorResponse(error: unknown) {
  return {
    success: false,
    error: formatOperationError(error),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Audit logging for sheet operations
 */
export interface SheetAuditLog {
  operation: string;
  pageName: string;
  rowCount: number;
  userId?: string;
  timestamp: Date;
  status: 'success' | 'error';
  details?: string;
}

export const auditLogs: SheetAuditLog[] = [];

export function logSheetOperation(log: SheetAuditLog): void {
  auditLogs.push(log);

  // Keep audit log size manageable
  if (auditLogs.length > 1000) {
    auditLogs.splice(0, auditLogs.length - 1000);
  }

  console.log(`[SHEET AUDIT] ${log.operation} on ${log.pageName}: ${log.status}`);
}

export function getAuditLogs(limit: number = 100): SheetAuditLog[] {
  return auditLogs.slice(-limit);
}
