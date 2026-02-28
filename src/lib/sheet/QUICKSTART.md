# 🚀 Sheet Interface - Quick Start

## What You Got

A complete **Google Sheets-like interface** for your database with full bulk operations support:

### ✅ Core Features

- **Sheet Pages**: Each entity (Expense, Account, Transfer, etc.) becomes a sheet page
- **Bulk Copy**: Select multiple rows and copy them to clipboard
- **Bulk Paste**: Paste with 3 modes: insert (new rows), update (existing), replace (all)
- **Bulk Delete**: Hard delete (remove) or soft delete (mark as deleted)
- **Column Management**: Work with entity properties as spreadsheet columns
- **Operation History**: Track all operations performed
- **Database Integration**: Load from / save to database

## 📁 File Structure

```
src/lib/sheet/
├── types.ts              # Core type definitions
├── entityMetadata.ts     # Entity-to-sheet mapping
├── SheetManager.ts       # Low-level operations (in-memory)
├── SheetService.ts       # High-level service (with database)
├── config.ts             # Setup & configuration
├── INTEGRATION.ts        # Real-world integration examples
├── EXAMPLES.ts           # Usage examples
├── README.md             # Full documentation
├── QUICKSTART.md         # This file
└── index.ts              # Exports
```

## 🎯 Supported Entities

All your database entities become sheet pages:

- Expense, Account, Transfer, Income, Credit
- Category, Tag, CreditCard, Person, Budget

## 💡 Basic Usage

### 1. In-Memory Operations (No Database)

```typescript
import { SheetManager } from '@/lib/sheet';

// Create sheet with pages
const sheet = new SheetManager(['Expense', 'Account']);

// Add data
import { SheetRow } from '@/lib/sheet';
const rows: SheetRow[] = [
  {
    id: 'exp-1',
    rowIndex: 0,
    values: {
      id: 'exp-1',
      date: '2024-01-15',
      description: 'Coffee',
      value: 5.5,
    },
  },
];

sheet.addRows('Expense', rows);

// Select rows
sheet.selectRows('Expense', ['exp-1']);

// Copy
sheet.copyRows('Expense');

// Paste to another page
sheet.pasteRows({ targetPageName: 'Account', mode: 'insert' });

// Delete
sheet.deleteRows({ pageName: 'Expense', rowIds: ['exp-1'], hard: true });
```

### 2. With Database Integration

```typescript
import { SheetService } from '@/lib/sheet';
import { getRepository } from 'typeorm';

// Create service with repositories
const sheetService = new SheetService({
  repositories: {
    Expense: getRepository(Expense),
    Account: getRepository(Account),
    // ... other repositories
  },
});

// Load data from database
await sheetService.loadEntityData('Expense');

// Perform operations
const mgr = sheetService.getSheetManager();
mgr.selectRows('Expense', ['exp-1', 'exp-2']);
mgr.copyRows('Expense');

// Paste and save to database
await sheetService.saveRowsToDatabase('Expense', rows, 'create');

// Or use high-level API
await sheetService.bulkCopyPasteSave(
  'Expense',  // source
  'Income',   // target
  ['exp-1'],  // row IDs
  true        // save to DB
);
```

## 📊 Bulk Operations

### Copy Bulk
```typescript
sheet.selectRows('Expense', ['exp-1', 'exp-2', 'exp-3']);
sheet.copyRows('Expense', ['date', 'description', 'value']); // Optional: specific columns
// Rows are now in clipboard
```

### Paste Bulk
```typescript
// Mode: INSERT (adds new rows)
sheet.pasteRows({ targetPageName: 'Income', mode: 'insert' });

// Mode: UPDATE (updates existing rows)
sheet.pasteRows({ targetPageName: 'Expense', mode: 'update' });

// Mode: REPLACE (clears and inserts)
sheet.pasteRows({ targetPageName: 'Category', mode: 'replace' });
```

### Delete Bulk
```typescript
// Hard delete (remove completely)
sheet.deleteRows({ pageName: 'Expense', rowIds: ['exp-1', 'exp-2'], hard: true });

// Soft delete (mark status as 'deleted')
sheet.deleteRows({ pageName: 'Expense', rowIds: ['exp-1'], hard: false });
```

## 🔧 API Integration

Use in your Next.js API routes:

```typescript
// app/api/sheet/copy/route.ts
import { SheetManager } from '@/lib/sheet';

export async function POST(request: Request) {
  const { sourcePage, rowIds, columns } = await request.json();
  
  const sheet = new SheetManager(['Expense', 'Account']);
  sheet.selectRows(sourcePage, rowIds);
  const result = sheet.copyRows(sourcePage, columns);
  
  return Response.json(result);
}
```

## 📋 Operation Results

All operations return `SheetOperationResult`:

```typescript
interface SheetOperationResult {
  success: boolean;
  message: string;          // Human-readable message
  affectedRows: number;     // Number of rows affected
  timestamp: number;        // Operation timestamp
}
```

Example:
```typescript
const result = sheet.deleteRows({
  pageName: 'Expense',
  rowIds: ['exp-1'],
  hard: true,
});

if (result.success) {
  console.log(result.message);        // "hard deleted 1 rows from page Expense"
  console.log(result.affectedRows);   // 1
}
```

## 🎓 Examples

The package includes:
- **EXAMPLES.ts** - 8 complete working examples
- **INTEGRATION.ts** - Real-world API integration
- **README.md** - Full documentation

Run examples:
```typescript
import { runAllExamples } from '@/lib/sheet/EXAMPLES';
runAllExamples();
```

## 🔍 Utility Methods

```typescript
// Get page
const page = sheet.getPage('Expense');

// Get all pages
const pages = sheet.getAllPages();

// Get page stats
const stats = sheet.getPageStats('Expense');

// Get all stats
const allStats = sheet.getAllPagesStats();

// Get operation history
const history = sheet.getHistory(10);

// Get clipboard
const clipboard = sheet.getClipboard();

// Clear clipboard
sheet.clearClipboard();

// View complete schema
const schema = sheet.getSchema();
```

## 🚀 Advanced Features

### Column Filtering
Copy only specific columns:
```typescript
sheet.copyRows('Expense', ['date', 'description', 'value']);
```

### Soft Delete
Mark rows as deleted instead of removing:
```typescript
sheet.deleteRows({ pageName: 'Expense', rowIds: ['exp-1'], hard: false });
```

### Operation History
Track all performed operations:
```typescript
const history = sheet.getHistory(50); // Last 50 operations
history.forEach(op => {
  console.log(`${op.type} on ${op.pageName}: ${op.affectedRows} rows`);
});
```

### Row Index Auto-Update
Rows are automatically reindexed after paste/delete operations.

## 📊 Entity Model

Each entity has columns mapped from its database properties:

**Expense**: id, date, description, value, account, category, status, code, tags, createdAt, updatedAt

**Account**: id, name, type, status, description, balance, institution, accountNumber, isActive, createdAt, updatedAt

**Transfer**: id, date, sourceAccount, destinationAccount, value, tags, createdAt, updatedAt

*And 7 more entities with similar structure...*

## 💾 Data Integrity

- ✅ **UUID Regeneration**: New pasted rows get fresh UUIDs
- ✅ **Type Safety**: Type system ensures correct data types
- ✅ **Required Fields**: Metadata tracks required fields
- ✅ **Frozen Columns**: ID columns automatically frozen
- ✅ **Relation Handling**: Relationships stored as IDs

## 🔐 Validation

Built-in validation helpers:
```typescript
import { validateBulkCopyRequest, validateBulkPasteRequest } from '@/lib/sheet/config';

const validation = validateBulkCopyRequest({ sourcePage: 'Expense', rowIds: ['exp-1'] });
if (!validation.valid) {
  console.error(validation.error);
}
```

## 📝 Configuration

Edit `SHEET_CONFIG` in `config.ts`:
```typescript
export const SHEET_CONFIG = {
  MAX_ROWS_PER_PAGE: 1000,
  AUTO_SAVE_AFTER_PASTE: false,
  DEFAULT_PASTE_MODE: 'insert',
  ENABLE_HISTORY: true,
  // ... more options
};
```

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Clipboard is empty" | Call `copyRows()` before `pasteRows()` |
| "No rows selected" | Call `selectRows()` first |
| "Page not found" | Initialize with correct entity name |
| "IDs not preserved" | Expected - new IDs generated on insert |
| "Soft delete not working" | Check if entity has `status` field |

## 📚 Next Steps

1. **Read Full Docs**: See `README.md` for complete API reference
2. **Run Examples**: Execute `EXAMPLES.ts` to see all features
3. **Integration**: Check `INTEGRATION.ts` for API route examples
4. **Database Setup**: Use `SheetService` for database operations

## 🎯 Quick Reference

```typescript
// 1. Create sheet
const sheet = new SheetManager(['Expense', 'Account']);

// 2. Add data
sheet.addRows('Expense', rows);

// 3. Bulk Copy
sheet.selectRows('Expense', rowIds);
sheet.copyRows('Expense', columns);

// 4. Bulk Paste
sheet.pasteRows({ targetPageName: 'Income', mode: 'insert' });

// 5. Bulk Delete
sheet.deleteRows({ pageName: 'Expense', rowIds, hard: true });

// 6. Check results
console.log(sheet.getPageStats('Expense'));
```

---

**Happy Sheets! 📊** 

Need help? Check the full documentation in `README.md` or see examples in `EXAMPLES.ts`.
