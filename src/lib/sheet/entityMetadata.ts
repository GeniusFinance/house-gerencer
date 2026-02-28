/**
 * Entity Metadata Configuration
 * Maps database entities to sheet column definitions
 */

import { EntityColumnMetadata, EntityMetadata } from './types';

export const entityMetadataMap: Record<string, EntityMetadata> = {
  Expense: {
    name: 'Expense',
    displayName: 'Expenses',
    columns: [
      { fieldName: 'id', columnType: 'uuid', editable: false },
      { fieldName: 'date', columnType: 'date', editable: true, required: true },
      { fieldName: 'description', columnType: 'string', editable: true, required: true },
      { fieldName: 'value', columnType: 'decimal', editable: true, required: true },
      { fieldName: 'account', columnType: 'relation', editable: true, relationEntity: 'Account' },
      { fieldName: 'category', columnType: 'relation', editable: true, relationEntity: 'Category' },
      { fieldName: 'status', columnType: 'string', editable: true },
      { fieldName: 'code', columnType: 'string', editable: true, required: true },
      { fieldName: 'tags', columnType: 'relation', editable: true, relationEntity: 'Tag' },
      { fieldName: 'createdAt', columnType: 'date', editable: false },
      { fieldName: 'updatedAt', columnType: 'date', editable: false },
    ],
  },
  Account: {
    name: 'Account',
    displayName: 'Accounts',
    columns: [
      { fieldName: 'id', columnType: 'uuid', editable: false },
      { fieldName: 'name', columnType: 'string', editable: true, required: true },
      { fieldName: 'type', columnType: 'string', editable: true, required: true },
      { fieldName: 'status', columnType: 'string', editable: true },
      { fieldName: 'description', columnType: 'string', editable: true },
      { fieldName: 'balance', columnType: 'decimal', editable: true },
      { fieldName: 'institution', columnType: 'string', editable: true },
      { fieldName: 'accountNumber', columnType: 'string', editable: true },
      { fieldName: 'isActive', columnType: 'boolean', editable: true },
      { fieldName: 'createdAt', columnType: 'date', editable: false },
      { fieldName: 'updatedAt', columnType: 'date', editable: false },
    ],
  },
  Transfer: {
    name: 'Transfer',
    displayName: 'Transfers',
    columns: [
      { fieldName: 'id', columnType: 'uuid', editable: false },
      { fieldName: 'date', columnType: 'date', editable: true, required: true },
      { fieldName: 'sourceAccount', columnType: 'relation', editable: true, relationEntity: 'Account', required: true },
      { fieldName: 'destinationAccount', columnType: 'relation', editable: true, relationEntity: 'Account', required: true },
      { fieldName: 'value', columnType: 'decimal', editable: true, required: true },
      { fieldName: 'tags', columnType: 'relation', editable: true, relationEntity: 'Tag' },
      { fieldName: 'createdAt', columnType: 'date', editable: false },
      { fieldName: 'updatedAt', columnType: 'date', editable: false },
    ],
  },
  Income: {
    name: 'Income',
    displayName: 'Incomes',
    columns: [
      { fieldName: 'id', columnType: 'uuid', editable: false },
      { fieldName: 'date', columnType: 'date', editable: true, required: true },
      { fieldName: 'description', columnType: 'string', editable: true, required: true },
      { fieldName: 'value', columnType: 'decimal', editable: true, required: true },
      { fieldName: 'account', columnType: 'relation', editable: true, relationEntity: 'Account', required: true },
      { fieldName: 'status', columnType: 'string', editable: true },
      { fieldName: 'tags', columnType: 'relation', editable: true, relationEntity: 'Tag' },
      { fieldName: 'createdAt', columnType: 'date', editable: false },
      { fieldName: 'updatedAt', columnType: 'date', editable: false },
    ],
  },
  Credit: {
    name: 'Credit',
    displayName: 'Credits',
    columns: [
      { fieldName: 'id', columnType: 'uuid', editable: false },
      { fieldName: 'date', columnType: 'date', editable: true, required: true },
      { fieldName: 'description', columnType: 'string', editable: true },
      { fieldName: 'value', columnType: 'decimal', editable: true, required: true },
      { fieldName: 'account', columnType: 'relation', editable: true, relationEntity: 'Account', required: true },
      { fieldName: 'status', columnType: 'string', editable: true },
      { fieldName: 'tags', columnType: 'relation', editable: true, relationEntity: 'Tag' },
      { fieldName: 'createdAt', columnType: 'date', editable: false },
      { fieldName: 'updatedAt', columnType: 'date', editable: false },
    ],
  },
  Category: {
    name: 'Category',
    displayName: 'Categories',
    columns: [
      { fieldName: 'id', columnType: 'uuid', editable: false },
      { fieldName: 'name', columnType: 'string', editable: true, required: true },
      { fieldName: 'description', columnType: 'string', editable: true },
      { fieldName: 'icon', columnType: 'string', editable: true },
      { fieldName: 'color', columnType: 'string', editable: true },
      { fieldName: 'type', columnType: 'string', editable: true },
      { fieldName: 'createdAt', columnType: 'date', editable: false },
      { fieldName: 'updatedAt', columnType: 'date', editable: false },
    ],
  },
  Tag: {
    name: 'Tag',
    displayName: 'Tags',
    columns: [
      { fieldName: 'id', columnType: 'uuid', editable: false },
      { fieldName: 'name', columnType: 'string', editable: true, required: true },
      { fieldName: 'color', columnType: 'string', editable: true },
      { fieldName: 'createdAt', columnType: 'date', editable: false },
      { fieldName: 'updatedAt', columnType: 'date', editable: false },
    ],
  },
  CreditCard: {
    name: 'CreditCard',
    displayName: 'Credit Cards',
    columns: [
      { fieldName: 'id', columnType: 'uuid', editable: false },
      { fieldName: 'name', columnType: 'string', editable: true, required: true },
      { fieldName: 'lastDigits', columnType: 'string', editable: true },
      { fieldName: 'limit', columnType: 'decimal', editable: true },
      { fieldName: 'usedLimit', columnType: 'decimal', editable: false },
      { fieldName: 'issuer', columnType: 'string', editable: true },
      { fieldName: 'dueDay', columnType: 'number', editable: true },
      { fieldName: 'closingDay', columnType: 'number', editable: true },
      { fieldName: 'status', columnType: 'string', editable: true },
      { fieldName: 'createdAt', columnType: 'date', editable: false },
      { fieldName: 'updatedAt', columnType: 'date', editable: false },
    ],
  },
  Person: {
    name: 'Person',
    displayName: 'People',
    columns: [
      { fieldName: 'id', columnType: 'uuid', editable: false },
      { fieldName: 'name', columnType: 'string', editable: true, required: true },
      { fieldName: 'email', columnType: 'string', editable: true },
      { fieldName: 'relationship', columnType: 'string', editable: true },
      { fieldName: 'createdAt', columnType: 'date', editable: false },
      { fieldName: 'updatedAt', columnType: 'date', editable: false },
    ],
  },
  Budget: {
    name: 'Budget',
    displayName: 'Budgets',
    columns: [
      { fieldName: 'id', columnType: 'uuid', editable: false },
      { fieldName: 'name', columnType: 'string', editable: true, required: true },
      { fieldName: 'value', columnType: 'decimal', editable: true, required: true },
      { fieldName: 'category', columnType: 'relation', editable: true, relationEntity: 'Category' },
      { fieldName: 'startDate', columnType: 'date', editable: true, required: true },
      { fieldName: 'endDate', columnType: 'date', editable: true },
      { fieldName: 'status', columnType: 'string', editable: true },
      { fieldName: 'createdAt', columnType: 'date', editable: false },
      { fieldName: 'updatedAt', columnType: 'date', editable: false },
    ],
  },
};

/**
 * Get entity metadata by name
 */
export function getEntityMetadata(entityName: string): EntityMetadata | null {
  return entityMetadataMap[entityName] || null;
}

/**
 * Get all entity names
 */
export function getAllEntityNames(): string[] {
  return Object.keys(entityMetadataMap);
}

/**
 * Convert metadata to sheet columns
 */
export function metadataToSheetColumns(metadata: EntityMetadata) {
  return metadata.columns.map((col) => ({
    name: col.fieldName,
    type: col.columnType,
    editable: col.editable,
    frozen: col.fieldName === 'id',
  }));
}
