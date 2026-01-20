import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { getGoogleSheetsData } from '@/lib/googleSheets';

export async function GET(request: NextRequest) {
  try {
    // Check if Google Sheets is configured
    const useGoogleSheets = process.env.GOOGLE_SHEETS_SPREADSHEET_ID && 
                            process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

    if (useGoogleSheets) {
      const data = await getGoogleSheetsData();
      return NextResponse.json(data);
    } else {
      // Fallback to local CSV file
      console.log('Using local CSV file...');
      const dataPath = path.join(process.cwd(), 'data', 'expenses.csv');
      
      // Check if file exists
      if (!fs.existsSync(dataPath)) {
        return NextResponse.json([]);
      }

      // Read the CSV file
      const fileContent = fs.readFileSync(dataPath, 'utf-8');
      
      // Parse CSV
      const parsed = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
      });

      return NextResponse.json(parsed.data);
    }
  } catch (error) {
    console.error('Error reading sheet data:', error);
    return NextResponse.json(
      { error: 'Failed to load data' },
      { status: 500 }
    );
  }
}
