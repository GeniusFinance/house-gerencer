/**
 * Sheet Interface Integration Example
 * Demonstrates real-world usage with the existing API
 */

import { SheetManager } from './SheetManager';
import { SheetRow } from './types';

/**
 * Example implementation for API endpoint: /api/sheet/bulk-copy
 * POST /api/sheet/bulk-copy
 * Body: { sourcePage: string, rowIds: string[], columns?: string[] }
 */
export async function handleBulkCopy(request: {
  sourcePage: string;
  rowIds: string[];
  columns?: string[];
}) {
  const sheet = new SheetManager(['Expense', 'Account', 'Transfer', 'Income']);

  // In real scenario, load data from database first
  // const expenses = await expenseRepository.find();
  // sheet.addRows('Expense', convertToSheetRows(expenses));

  // Select and copy
  const selectResult = sheet.selectRows(request.sourcePage, request.rowIds);
  if (!selectResult.success) {
    return { error: selectResult.message, success: false };
  }

  const copyResult = sheet.copyRows(request.sourcePage, request.columns);
  if (!copyResult.success) {
    return { error: copyResult.message, success: false };
  }

  // Return clipboard info
  const clipboard = sheet.getClipboard();
  return {
    success: true,
    message: copyResult.message,
    clipboard: {
      rowCount: clipboard?.data.length,
      columnCount: clipboard?.sourceColumns.length,
      columnNames: clipboard?.sourceColumns.map((c) => c.name),
    },
  };
}

/**
 * Example implementation for API endpoint: /api/sheet/bulk-paste
 * POST /api/sheet/bulk-paste
 * Body: { targetPage: string, mode: 'insert' | 'update' | 'replace' }
 */
export async function handleBulkPaste(request: {
  targetPage: string;
  mode: 'insert' | 'update' | 'replace';
}) {
  const sheet = new SheetManager(['Expense', 'Account', 'Transfer', 'Income', 'Income']);

  // In real scenario, load data from database first
  // const data = await loadPageData(request.targetPage);
  // sheet.addRows(request.targetPage, convertToSheetRows(data));

  const pasteResult = sheet.pasteRows({
    targetPageName: request.targetPage,
    mode: request.mode,
  });

  if (!pasteResult.success) {
    return { error: pasteResult.message, success: false };
  }

  // Optionally save to database
  // const clipboard = sheet.getClipboard();
  // if (clipboard) {
  //   await saveToDatabase(request.targetPage, clipboard.data);
  //   sheet.clearClipboard();
  // }

  return {
    success: true,
    message: pasteResult.message,
    affectedRows: pasteResult.affectedRows,
  };
}

/**
 * Example implementation for API endpoint: /api/sheet/bulk-delete
 * POST /api/sheet/bulk-delete
 * Body: { pageName: string, rowIds: string[], hard?: boolean }
 */
export async function handleBulkDelete(request: {
  pageName: string;
  rowIds: string[];
  hard?: boolean;
}) {
  const sheet = new SheetManager(['Expense', 'Account', 'Transfer']);

  // In real scenario, load data from database first
  // const data = await loadPageData(request.pageName);
  // sheet.addRows(request.pageName, convertToSheetRows(data));

  const deleteResult = sheet.deleteRows({
    pageName: request.pageName,
    rowIds: request.rowIds,
    hard: request.hard ?? true,
  });

  if (!deleteResult.success) {
    return { error: deleteResult.message, success: false };
  }

  // Optionally delete from database
  // if (request.hard) {
  //   await deleteFromDatabase(request.pageName, request.rowIds);
  // } else {
  //   await updateStatusToDeleted(request.pageName, request.rowIds);
  // }

  return {
    success: true,
    message: deleteResult.message,
    affectedRows: deleteResult.affectedRows,
  };
}

/**
 * Example: Entity to Sheet Row conversion
 */
export function convertExpenseToSheetRow(expense: any): SheetRow {
  return {
    id: expense.id,
    rowIndex: 0,
    values: {
      id: expense.id,
      date: expense.date,
      description: expense.description,
      value: expense.value,
      account: expense.accountId,
      category: expense.categoryId,
      status: expense.status,
      code: expense.code,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    },
  };
}

/**
 * Example: Sheet Row to Entity conversion
 */
export function sheetRowToExpense(row: SheetRow): any {
  return {
    id: row.values.id,
    date: row.values.date,
    description: row.values.description,
    value: row.values.value,
    accountId: row.values.account,
    categoryId: row.values.category,
    status: row.values.status,
    code: row.values.code,
  };
}

/**
 * Example: Full integration test
 */
export function demonstrateFullIntegration() {
  console.log('🎯 Full Sheet Integration Demonstration\n');

  // 1. Create sheet with pages
  const sheet = new SheetManager(['Expense', 'Account', 'Income']);
  console.log('✅ Sheet initialized with 3 pages');

  // 2. Load mock data
  const mockExpenses: SheetRow[] = [
    {
      id: 'exp-1',
      rowIndex: 0,
      values: {
        id: 'exp-1',
        date: '2024-01-15',
        description: 'Office Supplies',
        value: 120.5,
        account: 'acc-1',
        category: 'cat-1',
        status: 'completed',
        code: 'OFFICE',
      },
    },
    {
      id: 'exp-2',
      rowIndex: 1,
      values: {
        id: 'exp-2',
        date: '2024-01-16',
        description: 'Client Meeting Lunch',
        value: 45.0,
        account: 'acc-1',
        category: 'cat-2',
        status: 'pending',
        code: 'FOOD',
      },
    },
    {
      id: 'exp-3',
      rowIndex: 2,
      values: {
        id: 'exp-3',
        date: '2024-01-17',
        description: 'Travel',
        value: 200.0,
        account: 'acc-2',
        category: 'cat-3',
        status: 'pending',
        code: 'TRANSPORT',
      },
    },
  ];

  sheet.addRows('Expense', mockExpenses);
  console.log('✅ Loaded 3 expenses');

  // 3. Demonstrate bulk copy
  console.log('\n--- Bulk Copy Operation ---');
  const selectResult = sheet.selectRows('Expense', ['exp-1', 'exp-2']);
  console.log(`✅ Selected rows: ${selectResult.affectedRows}`);

  const copyResult = sheet.copyRows('Expense', ['date', 'description', 'value']);
  console.log(`✅ ${copyResult.message}`);

  const clipboard = sheet.getClipboard();
  console.log(`Clipboard: ${clipboard?.data.length} rows, ${clipboard?.sourceColumns.length} columns`);

  // 4. Demonstrate bulk paste
  console.log('\n--- Bulk Paste Operation ---');
  const pasteResult = sheet.pasteRows({
    targetPageName: 'Income',
    mode: 'insert',
  });
  console.log(`✅ ${pasteResult.message}`);

  const incomeStats = sheet.getPageStats('Income');
  console.log(`Income page now has ${incomeStats?.totalRows} rows`);

  // 5. Demonstrate bulk delete
  console.log('\n--- Bulk Delete Operation ---');
  const deleteResult = sheet.deleteRows({
    pageName: 'Expense',
    rowIds: ['exp-3'],
    hard: true,
  });
  console.log(`✅ ${deleteResult.message}`);

  const expenseStats = sheet.getPageStats('Expense');
  console.log(`Expense page now has ${expenseStats?.totalRows} rows`);

  // 6. View history
  console.log('\n--- Operation History ---');
  const history = sheet.getHistory();
  history.forEach((op, i) => {
    console.log(`${i + 1}. ${op.type.toUpperCase()} - ${op.pageName} (${op.affectedRows} rows)`);
  });

  // 7. Demonstrate soft delete
  console.log('\n--- Soft Delete Operation ---');
  const softDeleteResult = sheet.deleteRows({
    pageName: 'Income',
    rowIds: [clipboard?.data[0].id || ''],
    hard: false,
  });
  console.log(`✅ ${softDeleteResult.message}`);

  // 8. View all stats
  console.log('\n--- Final Page Statistics ---');
  const allStats = sheet.getAllPagesStats();
  allStats?.forEach((stat) => {
    if (stat && stat.totalRows > 0) {
      console.log(`${stat.name}: ${stat.totalRows} rows, ${stat.columns} columns`);
    }
  });

  console.log('\n✅ Integration demonstration completed!');
}

/**
 * Example: Advanced workflow - Multi-step operation
 */
export function demonstrateAdvancedWorkflow() {
  console.log('\n🔄 Advanced Workflow - Multi-step Operation\n');

  const sheet = new SheetManager(['Expense', 'Transfer', 'Income']);

  // Scenario: Migrate expenses from one category to another
  // by copying to Transfer, modifying, then to Income

  // Step 1: Load expenses
  const expenses: SheetRow[] = [
    {
      id: 'exp-1',
      rowIndex: 0,
      values: {
        id: 'exp-1',
        date: '2024-01-15',
        description: 'Project A - Materials',
        value: 500,
        account: 'acc-1',
        category: 'cat-old',
        status: 'completed',
        code: 'PROJECT-A',
      },
    },
  ];

  sheet.addRows('Expense', expenses);
  console.log('Step 1: Loaded 1 expense for Project A');

  // Step 2: Copy expense
  sheet.selectRows('Expense', ['exp-1']);
  sheet.copyRows('Expense');
  console.log('Step 2: Copied expense to clipboard');

  // Step 3: Paste to Transfer (as intermediate)
  const pasteToTransfer = sheet.pasteRows({
    targetPageName: 'Transfer',
    mode: 'insert',
  });
  console.log(`Step 3: ${pasteToTransfer.message}`);

  // Step 4: Copy from Transfer
  const transferPage = sheet.getPage('Transfer');
  if (transferPage && transferPage.rows.length > 0) {
    sheet.selectRows('Transfer', [transferPage.rows[0].id]);
    sheet.copyRows('Transfer');
    console.log('Step 4: Copied modified row from Transfer');

    // Step 5: Paste to Income
    const pasteToIncome = sheet.pasteRows({
      targetPageName: 'Income',
      mode: 'insert',
    });
    console.log(`Step 5: ${pasteToIncome.message}`);
  }

  // Step 6: Cleanup - delete from Transfer
  if (transferPage && transferPage.rows.length > 0) {
    const deleteResult = sheet.deleteRows({
      pageName: 'Transfer',
      rowIds: [transferPage.rows[0].id],
      hard: true,
    });
    console.log(`Step 6: ${deleteResult.message}`);
  }

  // Final result
  console.log('\n✅ Workflow completed:');
  console.log(`  - Expense page: ${sheet.getPageStats('Expense')?.totalRows} rows`);
  console.log(`  - Transfer page: ${sheet.getPageStats('Transfer')?.totalRows} rows`);
  console.log(`  - Income page: ${sheet.getPageStats('Income')?.totalRows} rows`);
}
