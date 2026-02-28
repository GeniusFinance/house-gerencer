/**
 * Sheet Interface - Usage Examples
 * Demonstrates how to use the sheet system for bulk operations
 */

import { SheetManager } from './SheetManager';
import { SheetService } from './SheetService';
import { SheetRow } from './types';

/**
 * Example 1: Basic Sheet Manager - Create and Manage Pages
 */
export function example1BasicSheetManager() {
  console.log('=== Example 1: Basic Sheet Manager ===');

  // Initialize sheet with multiple entity pages
  const sheet = new SheetManager(['Expense', 'Account', 'Transfer']);

  // View all available pages
  console.log('Available pages:', sheet.getAllPages());

  // Get page information
  const expensePage = sheet.getPage('Expense');
  console.log('Expense page columns:', expensePage?.columns.map((c) => c.name));
}

/**
 * Example 2: Load and Manage Data
 */
export function example2LoadManageData() {
  console.log('\n=== Example 2: Load and Manage Data ===');

  const sheet = new SheetManager(['Expense', 'Account']);

  // Simulate loading expenses from database
  const mockExpenses: SheetRow[] = [
    {
      id: 'exp-1',
      rowIndex: 0,
      values: {
        id: 'exp-1',
        date: '2024-01-15',
        description: 'Coffee',
        value: 5.5,
        account: 'acc-1',
        category: 'cat-1',
        status: 'completed',
        code: 'DRINK',
      },
    },
    {
      id: 'exp-2',
      rowIndex: 1,
      values: {
        id: 'exp-2',
        date: '2024-01-16',
        description: 'Lunch',
        value: 15.0,
        account: 'acc-1',
        category: 'cat-2',
        status: 'completed',
        code: 'FOOD',
      },
    },
    {
      id: 'exp-3',
      rowIndex: 2,
      values: {
        id: 'exp-3',
        date: '2024-01-17',
        description: 'Gas',
        value: 50.0,
        account: 'acc-2',
        category: 'cat-3',
        status: 'pending',
        code: 'TRANSPORT',
      },
    },
  ];

  const result = sheet.addRows('Expense', mockExpenses);
  console.log('Load result:', result.message);

  // View stats
  const stats = sheet.getPageStats('Expense');
  console.log('Sheet stats:', stats);
}

/**
 * Example 3: Bulk Copy Operation
 */
export function example3BulkCopy() {
  console.log('\n=== Example 3: Bulk Copy Operation ===');

  const sheet = new SheetManager(['Expense']);

  // Add sample data
  const mockExpenses: SheetRow[] = [
    {
      id: 'exp-1',
      rowIndex: 0,
      values: {
        id: 'exp-1',
        date: '2024-01-15',
        description: 'Coffee',
        value: 5.5,
        status: 'completed',
      },
    },
    {
      id: 'exp-2',
      rowIndex: 1,
      values: {
        id: 'exp-2',
        date: '2024-01-16',
        description: 'Lunch',
        value: 15.0,
        status: 'completed',
      },
    },
  ];

  sheet.addRows('Expense', mockExpenses);

  // Select specific rows
  sheet.selectRows('Expense', ['exp-1', 'exp-2']);
  console.log('Selected rows for copy');

  // Copy selected rows
  const copyResult = sheet.copyRows('Expense', ['date', 'description', 'value']);
  console.log('Copy result:', copyResult.message);

  // Check clipboard
  const clipboard = sheet.getClipboard();
  console.log('Clipboard contains:', clipboard?.data.length, 'rows');
  console.log('Clipboard columns:', clipboard?.sourceColumns.map((c) => c.name));
}

/**
 * Example 4: Bulk Paste Operation
 */
export function example4BulkPaste() {
  console.log('\n=== Example 4: Bulk Paste Operation ===');

  const sheet = new SheetManager(['Expense', 'Income']);

  // Add sample expenses
  const mockExpenses: SheetRow[] = [
    {
      id: 'exp-1',
      rowIndex: 0,
      values: {
        id: 'exp-1',
        date: '2024-01-15',
        description: 'Work related expense',
        value: 100.0,
        status: 'pending',
      },
    },
  ];

  sheet.addRows('Expense', mockExpenses);
  sheet.selectRows('Expense', ['exp-1']);
  sheet.copyRows('Expense');

  // Paste to Income page
  const pasteResult = sheet.pasteRows({
    targetPageName: 'Income',
    mode: 'insert',
  });
  console.log('Paste result:', pasteResult.message);

  const incomeStats = sheet.getPageStats('Income');
  console.log('Income page now has:', incomeStats?.totalRows, 'rows');
}

/**
 * Example 5: Bulk Delete Operation
 */
export function example5BulkDelete() {
  console.log('\n=== Example 5: Bulk Delete Operation ===');

  const sheet = new SheetManager(['Expense']);

  // Add sample data
  const mockExpenses: SheetRow[] = [
    {
      id: 'exp-1',
      rowIndex: 0,
      values: {
        id: 'exp-1',
        date: '2024-01-15',
        description: 'Coffee',
        value: 5.5,
        status: 'completed',
      },
    },
    { id: 'exp-2', rowIndex: 1, values: { id: 'exp-2', description: 'Lunch', value: 15.0 } },
    { id: 'exp-3', rowIndex: 2, values: { id: 'exp-3', description: 'Gas', value: 50.0 } },
  ];

  sheet.addRows('Expense', mockExpenses);
  console.log('Total rows before delete:', sheet.getPageStats('Expense')?.totalRows);

  // Hard delete (remove completely)
  const deleteResult = sheet.deleteRows({
    pageName: 'Expense',
    rowIds: ['exp-1', 'exp-2'],
    hard: true,
  });
  console.log('Delete result:', deleteResult.message);
  console.log('Total rows after delete:', sheet.getPageStats('Expense')?.totalRows);

  // Soft delete (mark as deleted)
  const softDeleteResult = sheet.deleteRows({
    pageName: 'Expense',
    rowIds: ['exp-3'],
    hard: false,
  });
  console.log('Soft delete result:', softDeleteResult.message);
}

/**
 * Example 6: Complete Workflow - Copy, Paste, Update
 */
export function example6CompleteWorkflow() {
  console.log('\n=== Example 6: Complete Workflow ===');

  const sheet = new SheetManager(['Expense', 'Transfer']);

  // Load expenses
  const expenses: SheetRow[] = [
    {
      id: 'exp-1',
      rowIndex: 0,
      values: {
        id: 'exp-1',
        date: '2024-01-15',
        description: 'Office supplies',
        value: 120.0,
        status: 'completed',
      },
    },
  ];
  sheet.addRows('Expense', expenses);

  // Step 1: Select and copy expenses
  sheet.selectRows('Expense', ['exp-1']);
  sheet.copyRows('Expense');
  console.log('Step 1: Copied 1 expense');

  // Step 2: Paste to transfer page
  const pasteResult = sheet.pasteRows({
    targetPageName: 'Transfer',
    mode: 'insert',
  });
  console.log('Step 2:', pasteResult.message);

  // Step 3: View both pages
  const expenseStats = sheet.getPageStats('Expense');
  const transferStats = sheet.getPageStats('Transfer');
  console.log('Expense page:', expenseStats?.totalRows, 'rows');
  console.log('Transfer page:', transferStats?.totalRows, 'rows');

  // Step 4: Delete from transfer
  const transferPage = sheet.getPage('Transfer');
  if (transferPage && transferPage.rows.length > 0) {
    const rowIdToDelete = transferPage.rows[0].id;
    sheet.deleteRows({
      pageName: 'Transfer',
      rowIds: [rowIdToDelete],
      hard: true,
    });
    console.log('Step 4: Deleted from transfer page');
  }

  // Step 5: View history
  const history = sheet.getHistory(5);
  console.log('Operation history:', history.map((h) => h.type).join(' -> '));
}

/**
 * Example 7: Column Filtering in Copy
 */
export function example7ColumnFiltering() {
  console.log('\n=== Example 7: Column Filtering ===');

  const sheet = new SheetManager(['Expense']);

  const expenses: SheetRow[] = [
    {
      id: 'exp-1',
      rowIndex: 0,
      values: {
        id: 'exp-1',
        date: '2024-01-15',
        description: 'Coffee',
        value: 5.5,
        account: 'acc-1',
        category: 'cat-1',
        status: 'completed',
        code: 'DRINK',
      },
    },
  ];
  sheet.addRows('Expense', expenses);

  // Copy only specific columns
  sheet.selectRows('Expense', ['exp-1']);
  const copyResult = sheet.copyRows('Expense', ['date', 'description', 'value']);

  const clipboard = sheet.getClipboard();
  console.log('Copied columns:', Object.keys(clipboard?.data[0].values || {}));
  console.log('Source columns:', clipboard?.sourceColumns.map((c) => c.name));
}

/**
 * Example 8: Paste Modes - Insert, Update, Replace
 */
export async function example8PasteModes() {
  console.log('\n=== Example 8: Paste Modes ===');

  const sheet = new SheetManager(['Expense', 'Category']);

  // Add sample data to both pages
  const expenses: SheetRow[] = [
    { id: 'exp-1', rowIndex: 0, values: { id: 'exp-1', description: 'Expense 1' } },
    { id: 'exp-2', rowIndex: 1, values: { id: 'exp-2', description: 'Expense 2' } },
  ];

  const categories: SheetRow[] = [
    { id: 'cat-1', rowIndex: 0, values: { id: 'cat-1', name: 'Food' } },
    { id: 'cat-2', rowIndex: 1, values: { id: 'cat-2', name: 'Transport' } },
  ];

  sheet.addRows('Expense', expenses);
  sheet.addRows('Category', categories);

  // Mode 1: INSERT (adds new rows)
  sheet.selectRows('Expense', ['exp-1']);
  sheet.copyRows('Expense');
  const insertResult = sheet.pasteRows({
    targetPageName: 'Category',
    mode: 'insert',
  });
  console.log('INSERT mode:', insertResult.message);

  // Mode 2: UPDATE (updates existing rows with same ID)
  const updateResult = sheet.pasteRows({
    targetPageName: 'Expense',
    mode: 'update',
  });
  console.log('UPDATE mode:', updateResult.message);

  // Mode 3: REPLACE (deletes all then inserts)
  const replaceResult = sheet.pasteRows({
    targetPageName: 'Category',
    mode: 'replace',
  });
  console.log('REPLACE mode:', replaceResult.message);
  console.log('Category page now has:', sheet.getPageStats('Category')?.totalRows, 'rows');
}

/**
 * Run all examples
 */
export function runAllExamples() {
  console.log('🎯 SHEET INTERFACE - USAGE EXAMPLES\n');
  console.log('==========================================\n');

  example1BasicSheetManager();
  example2LoadManageData();
  example3BulkCopy();
  example4BulkPaste();
  example5BulkDelete();
  example6CompleteWorkflow();
  example7ColumnFiltering();
  runAllExamples(); // For async example

  console.log('\n==========================================');
  console.log('✅ Examples completed!');
}
