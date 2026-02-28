/**
 * Sheet Service
 * High-level service for Sheet operations with database integration
 */

import { Repository, In } from 'typeorm';
import { SheetManager } from './SheetManager';
import { SheetRow, SheetOperationResult, PasteOptions, BulkDeleteOptions } from './types';
import { getAllEntityNames } from './entityMetadata';

export interface SheetServiceConfig {
  repositories: Record<string, Repository<any>>;
}

export class SheetService {
  private sheetManager: SheetManager;
  private repositories: Record<string, Repository<any>>;

  constructor(config: SheetServiceConfig) {
    this.repositories = config.repositories;
    this.sheetManager = new SheetManager(getAllEntityNames());
  }

  /**
   * Load entity data from database
   */
  async loadEntityData(entityName: string): Promise<SheetOperationResult> {
    const repository = this.repositories[entityName];
    if (!repository) {
      return {
        success: false,
        message: `Repository for "${entityName}" not found`,
        affectedRows: 0,
        timestamp: Date.now(),
      };
    }

    try {
      const entities = await repository.find();

      const rows: SheetRow[] = entities.map((entity, index) => ({
        id: entity.id,
        values: this.entityToRowValues(entity),
        rowIndex: index,
        selected: false,
      }));

      return this.sheetManager.addRows(entityName, rows);
    } catch (error) {
      return {
        success: false,
        message: `Error loading data for "${entityName}": ${error instanceof Error ? error.message : 'Unknown error'}`,
        affectedRows: 0,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Load all entity data from database
   */
  async loadAllEntities(): Promise<Record<string, SheetOperationResult>> {
    const results: Record<string, SheetOperationResult> = {};

    for (const entityName of getAllEntityNames()) {
      results[entityName] = await this.loadEntityData(entityName);
    }

    return results;
  }

  /**
   * Save pasted rows to database
   */
  async saveRowsToDatabase(entityName: string, rows: SheetRow[], mode: 'create' | 'update' = 'create'): Promise<SheetOperationResult> {
    const repository = this.repositories[entityName];
    if (!repository) {
      return {
        success: false,
        message: `Repository for "${entityName}" not found`,
        affectedRows: 0,
        timestamp: Date.now(),
      };
    }

    try {
      const entities = rows.map((row) => this.rowValuesToEntity(row.values, entityName));

      if (mode === 'create') {
        const savedEntities = await repository.save(entities);
        return {
          success: true,
          message: `Saved ${savedEntities.length} new ${entityName} entries to database`,
          affectedRows: savedEntities.length,
          timestamp: Date.now(),
        };
      } else if (mode === 'update') {
        const updatedEntities = await repository.save(entities);
        return {
          success: true,
          message: `Updated ${updatedEntities.length} ${entityName} entries in database`,
          affectedRows: updatedEntities.length,
          timestamp: Date.now(),
        };
      }

      return {
        success: false,
        message: `Unknown save mode: ${mode}`,
        affectedRows: 0,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        message: `Error saving rows to database: ${error instanceof Error ? error.message : 'Unknown error'}`,
        affectedRows: 0,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Delete rows from database
   */
  async deleteRowsFromDatabase(entityName: string, rowIds: string[]): Promise<SheetOperationResult> {
    const repository = this.repositories[entityName];
    if (!repository) {
      return {
        success: false,
        message: `Repository for "${entityName}" not found`,
        affectedRows: 0,
        timestamp: Date.now(),
      };
    }

    try {
      const result = await repository.delete(In(rowIds));
      return {
        success: true,
        message: `Deleted ${result.affected || 0} ${entityName} entries from database`,
        affectedRows: result.affected || 0,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        message: `Error deleting rows from database: ${error instanceof Error ? error.message : 'Unknown error'}`,
        affectedRows: 0,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Perform complete bulk operation: copy, paste, and save
   */
  async bulkCopyPasteSave(
    sourcePage: string,
    targetPage: string,
    rowIds: string[],
    saveToDb?: boolean,
  ): Promise<SheetOperationResult> {
    // Select source rows
    const selectResult = this.sheetManager.selectRows(sourcePage, rowIds);
    if (!selectResult.success) return selectResult;

    // Copy rows
    const copyResult = this.sheetManager.copyRows(sourcePage);
    if (!copyResult.success) return copyResult;

    // Paste rows
    const pasteResult = this.sheetManager.pasteRows({
      targetPageName: targetPage,
      mode: 'insert',
    });
    if (!pasteResult.success) return pasteResult;

    // Optionally save to database
    if (saveToDb) {
      const clipboard = this.sheetManager.getClipboard();
      if (clipboard) {
        const saveResult = await this.saveRowsToDatabase(targetPage, clipboard.data, 'create');
        this.sheetManager.clearClipboard();
        return saveResult;
      }
    }

    return pasteResult;
  }

  /**
   * Get sheet manager instance for direct access
   */
  getSheetManager(): SheetManager {
    return this.sheetManager;
  }

  // Helper methods

  private entityToRowValues(entity: any): Record<string, any> {
    const values: Record<string, any> = {};

    Object.keys(entity).forEach((key) => {
      const value = entity[key];

      // Handle relations
      if (value && typeof value === 'object' && value.id) {
        values[key] = value.id; // Store relation as ID
      } else {
        values[key] = value;
      }
    });

    return values;
  }

  private rowValuesToEntity(values: Record<string, any>, entityName: string): any {
    // This is a basic conversion. In a real scenario, you'd need TypeORM metadata
    const entity: any = {};

    Object.entries(values).forEach(([key, value]) => {
      entity[key] = value;
    });

    return entity;
  }
}
