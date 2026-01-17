import { NextResponse } from 'next/server';
import { scrapeMFCentral } from '@/lib/mfCentral';
import { appendToSheet } from '@/lib/googleSheets';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { pan, password, securityQuestions, spreadsheetId } = body;

        if (!pan || !password) {
            return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
        }

        // Call the scraper
        const data = await scrapeMFCentral({
            pan,
            password,
            securityQuestions: securityQuestions || {}
        });

        // If spreadsheet ID is provided, push data to Google Sheets
        let sheetResult = null;
        if (spreadsheetId) {
            // Default to "Mutual Funds" for this user context if not explicitly provided, 
            // but the UI will control the input.
            // Actually, we'll let the library handle the prioritized fallback if sheetName is undefined.
            console.log('Pushing data to Google Sheet:', spreadsheetId, 'Tab:', body.sheetName || '(Auto)');
            sheetResult = await appendToSheet(data, spreadsheetId, body.sheetName);
        }

        return NextResponse.json({ success: true, data, sheetResult });
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message, success: false }, { status: 500 });
    }
}
