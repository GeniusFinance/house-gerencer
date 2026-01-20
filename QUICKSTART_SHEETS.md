# Quick Start: Connect to Google Sheets

## Option 1: Use Service Account (Recommended - Secure)

Follow the detailed guide in [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md)

## Option 2: Quick Setup with Public API Key (For Testing)

If you just want to test quickly with a public Google Sheet:

### Step 1: Make Your Sheet Public

1. Open your Google Sheet
2. Click **Share** → **Change to anyone with the link**
3. Set permission to **Viewer**
4. Copy your spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit
   ```

### Step 2: Get a Google API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project
3. Enable **Google Sheets API**
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy the API key

### Step 3: Create .env.local

Create a `.env.local` file with:

```env
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
GOOGLE_SHEETS_API_KEY=your_api_key
GOOGLE_SHEETS_RANGE=Sheet1!A:O
```

### Step 4: Use Alternative Implementation

Create `lib/googleSheetsPublic.ts`:

```typescript
export async function getPublicGoogleSheetsData() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
  const range = process.env.GOOGLE_SHEETS_RANGE || 'Sheet1!A:O';

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.values || data.values.length === 0) {
    return [];
  }

  const [headers, ...rows] = data.values;
  
  return rows.map((row: any[]) => {
    const obj: any = {};
    headers.forEach((header: string, index: number) => {
      obj[header] = row[index] || '';
    });
    return obj;
  });
}
```

Then update `app/api/sheet-data/route.ts` to use this function.

## Your Sheet Must Have These Columns:

| Purchase Date | Validate Date | Description | Value | Account | Status | Category | Subcategory | Tags | Pessoas | Credit | Card | Observation | Month | Year |
|--------------|---------------|-------------|-------|---------|--------|----------|-------------|------|---------|--------|------|-------------|-------|------|

**Important:** Column names are case-sensitive and must match exactly!

## Testing Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the dev server:
   ```bash
   npm run dev
   ```

3. Visit:
   ```
   http://localhost:3000/owes?user=claudia
   ```

## Need Help?

- Check [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md) for detailed instructions
- Make sure your sheet columns match exactly
- Verify the spreadsheet is shared/public
- Check the browser console and server logs for errors
