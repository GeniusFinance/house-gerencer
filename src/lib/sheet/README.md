# Sheet Interface System

A comprehensive Google Sheets-like interface for managing database entities with full support for bulk operations.

## 📋 Overview

The Sheet Interface System provides a simulated spreadsheet experience for managing your database entities. Each entity (Expense, Account, Transfer, etc.) becomes a separate sheet page with support for:

- **Copy Bulk Operations** - Select multiple rows and copy them to clipboard
- **Paste Bulk Operations** - Paste copied rows with multiple strategies (insert, update, replace)
- **Delete Bulk Operations** - Hard or soft delete multiple rows at once
- **Column Management** - Work with entity properties as spreadsheet columns
- **Row Selection** - Select specific rows for bulk operations
- **Operation History** - Track all performed operations

## 🏗️ Architecture

### Core Components

#### 1. **Types** (`types.ts`)
Core type definitions for the sheet system:
- `SheetRow` - Individual row with ID, values, and metadata
- `SheetColumn` - Column definition with type and editability
- `SheetPage` - A page representing one entity
- `SheetClipboard` - Clipboard storage for copy/paste operations
- `SheetSchema` - Complete schema of all pages

#### 2. **Entity Metadata** (`entityMetadata.ts`)
Entity-to-sheet mapping:
- Available entities: Expense, Account, Transfer, Income, Credit, Category, Tag, CreditCard, Person, Budget
- Column definitions for each entity
- Helper functions to get metadata and convert to sheet columns

#### 3. **SheetManager** (`SheetManager.ts`)
Low-level sheet operations:
- Initialize and manage pages
- Select/deselect rows
- Copy/paste/delete operations
- Clipboard management
- Operation history tracking

#### 4. **SheetService** (`SheetService.ts`)
High-level service with database integration:
- Load entity data from database
- Save pasted rows back to database
- Complete bulk operation workflows
- Simplified API for common tasks

## 📖 Usage Guide

### 1. Basic Setup

```typescript
import { SheetManager, SheetService } from '@/lib/sheet';

// Using SheetManager (in-memory only)
const sheet = new SheetManager(['Expense', 'Account', 'Transfer']);

// Or using SheetService (with database)
const sheetService = new SheetService({
  repositories: {
    Expense: expenseRepository,
    Account: accountRepository,
    Transfer: transferRepository,
    // ... other repositories
  },
});
```

### 2. Load Data

```typescript
// Load a single entity
const result = await sheetService.loadEntityData('Expense');
console.log(result.message); // "Added X rows to page Expense"

// Load all entities
const allResults = await sheetService.loadAllEntities();
```

### 3. Bulk Copy Operation

```typescript
const sheet = sheetService.getSheetManager();

// Select rows to copy
sheet.selectRows('Expense', ['exp-1', 'exp-2', 'exp-3']);

// Copy all selected rows
sheet.copyRows('Expense');

// Or copy specific columns only
sheet.copyRows('Expense', ['date', 'description', 'value']);

// Check clipboard
const clipboard = sheet.getClipboard();
console.log(`Copied ${clipboard.data.length} rows`);
```

### 4. Bulk Paste Operation

```typescript
// Paste with different modes

// Mode: INSERT (adds new rows)
const insertResult = sheet.pasteRows({
  targetPageName: 'Income',
  mode: 'insert',
  startRowIndex: 0,
});

// Mode: UPDATE (updates existing rows with same ID)
const updateResult = sheet.pasteRows({
  targetPageName: 'Expense',
  mode: 'update',
});

// Mode: REPLACE (clears page and inserts)
const replaceResult = sheet.pasteRows({
  targetPageName: 'Category',
  mode: 'replace',
});
```

### 5. Bulk Delete Operation

```typescript
// Hard delete (remove completely)
const result = sheet.deleteRows({
  pageName: 'Expense',
  rowIds: ['exp-1', 'exp-2'],
  hard: true,
});

// Soft delete (mark status as 'deleted')
const softResult = sheet.deleteRows({
  pageName: 'Expense',
  rowIds: ['exp-3'],
  hard: false,
});
```

## 🔄 Complete Workflow Example

```typescript
// 1. Initialize service
const sheetService = new SheetService({ repositories });

// 2. Load data
await sheetService.loadAllEntities();

// 3. Perform bulk copy-paste-save
const result = await sheetService.bulkCopyPasteSave(
  'Expense',      // Source page
  'Income',       // Target page
  ['exp-1', 'exp-2'], // Row IDs to copy
  true            // Save to database
);

// 4. Check result
console.log(result.message);
console.log(`Affected ${result.affectedRows} rows`);
```

## 📊 Available Entities

Each entity becomes a sheet page with its own columns:

- **Expense** (id, date, description, value, account, category, status, code, tags)
- **Account** (id, name, type, status, balance, institution, accountNumber, isActive)
- **Transfer** (id, date, sourceAccount, destinationAccount, value, tags)
- **Income** (id, date, description, value, account, status, tags)
- **Credit** (id, date, description, value, account, status, tags)
- **Category** (id, name, description, icon, color, type)
- **Tag** (id, name, color)
- **CreditCard** (id, name, lastDigits, limit, usedLimit, issuer, dueDay, closingDay, status)
- **Person** (id, name, email, relationship)
- **Budget** (id, name, value, category, startDate, endDate, status)

## 🔍 Utility Methods

### Sheet Manager Methods

```typescript
// Get a page
const page = sheet.getPage('Expense');

// Get all pages
const pages = sheet.getAllPages();

// Select rows
sheet.selectRows('Expense', ['exp-1', 'exp-2']);

// Clear selection
sheet.clearSelection('Expense');

// Get page stats
const stats = sheet.getPageStats('Expense');
// { name, totalRows, selectedRows, columns, columnNames }

// Get all pages stats
const allStats = sheet.getAllPagesStats();

// Get operation history
const history = sheet.getHistory(10); // Last 10 operations

// Get schema (for export)
const schema = sheet.getSchema();

// Clear clipboard
sheet.clearClipboard();
```

### Sheet Service Methods

```typescript
// Load single entity
await sheetService.loadEntityData('Expense');

// Load all entities
await sheetService.loadAllEntities();

// Save rows to database
await sheetService.saveRowsToDatabase('Expense', rows, 'create');
await sheetService.saveRowsToDatabase('Expense', rows, 'update');

// Delete from database
await sheetService.deleteRowsFromDatabase('Expense', ['exp-1', 'exp-2']);

// Bulk operation
await sheetService.bulkCopyPasteSave('Expense', 'Income', ['exp-1'], true);

// Get sheet manager
const manager = sheetService.getSheetManager();
```

## 📋 Operation Types

All operations return `SheetOperationResult`:

```typescript
interface SheetOperationResult {
  success: boolean;
  message: string;
  affectedRows: number;
  timestamp: number;
}
```

### Supported Operations

| Operation | Type | Reversible | Database Impact |
|-----------|------|-----------|-----------------|
| Copy | `copy` | ❌ No | ❌ None |
| Paste (Insert) | `paste` | ✅ Yes | ✅ Creates |
| Paste (Update) | `paste` | ✅ Yes | ✅ Updates |
| Paste (Replace) | `paste` | ❌ No | ✅ Replaces |
| Hard Delete | `delete` | ❌ No | ✅ Deletes |
| Soft Delete | `delete` | ✅ Yes | ❌ Marks |

## 🎯 Advanced Features

### Column Filtering

Copy only specific columns:

```typescript
sheet.selectRows('Expense', ['exp-1']);
sheet.copyRows('Expense', ['date', 'description', 'value']);
// Only these columns will be in clipboard
```

### Soft Delete

Mark rows as deleted instead of removing:

```typescript
const result = sheet.deleteRows({
  pageName: 'Expense',
  rowIds: ['exp-1'],
  hard: false, // Marks status as 'deleted'
});
```

### Row Index Updates

Rows are automatically reindexed after paste/delete operations.

### Operation History

Track all operations performed:

```typescript
const history = sheet.getHistory();
// Returns array of all operations with timestamps

history.forEach(op => {
  console.log(`${op.type} on ${op.pageName}: ${op.affectedRows} rows`);
});
```

## 🔐 Data Integrity

- **ID Generation**: New pasted rows get new UUIDs (clipboard data doesn't retain IDs)
- **Column Type Safety**: Type system ensures correct data types
- **Required Fields**: Metadata tracks which fields are required
- **Frozen Columns**: ID column is automatically frozen
- **Relation Handling**: Relationships stored as IDs

## 📦 Integration Points

### With TypeORM

```typescript
import { getRepository } from 'typeorm';
import { Expense, Account, Transfer } from '@/src/entities';

const sheetService = new SheetService({
  repositories: {
    Expense: getRepository(Expense),
    Account: getRepository(Account),
    Transfer: getRepository(Transfer),
  },
});
```

### With API Routes

```typescript
// app/api/sheet/copy/route.ts
export async function POST(request: Request) {
  const { sourcePage, rowIds, columns } = await request.json();
  const manager = sheetService.getSheetManager();
  
  manager.selectRows(sourcePage, rowIds);
  const result = manager.copyRows(sourcePage, columns);
  
  return Response.json(result);
}
```

## 🚀 Performance Considerations

- **In-Memory Operations**: Copy/paste/delete are instant (in-memory)
- **Database Operations**: Async, keep track of DB connection pool
- **Large Datasets**: Consider pagination for entities with many rows
- **History Limit**: Automatically limited to last 100 operations
- **Clipboard Size**: Clear clipboard after pasting with `clearClipboard()`

## 🔧 Troubleshooting

### Clipboard is empty
Solution: Call `copyRows()` before `pasteRows()`

### Wrong columns copied
Solution: Specify columns in `copyRows('Page', ['col1', 'col2'])`

### IDs not preserved after paste
Expected behavior: UUIDs are regenerated on insert mode

### Soft delete not working
Check if entity has `status` field (required for soft delete)

### Relations not copying
Metadata stores relations as IDs. Use `includeRelations: true` in paste options.

## 📝 File Structure

```
src/lib/sheet/
├── types.ts              # Type definitions
├── entityMetadata.ts     # Entity-to-sheet mapping
├── SheetManager.ts       # Core sheet operations
├── SheetService.ts       # Database integration
├── EXAMPLES.ts           # Usage examples
├── README.md             # This file
└── index.ts              # Exports
```

## 🎓 Examples

See `EXAMPLES.ts` for complete working examples:
- Basic sheet manager setup
- Load and manage data
- Bulk copy operations
- Bulk paste operations
- Bulk delete operations
- Complete workflows
- Column filtering
- Paste modes

Run examples:
```typescript
import { runAllExamples } from '@/lib/sheet/EXAMPLES';
runAllExamples();
```
