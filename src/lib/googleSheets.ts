import { google } from 'googleapis';
import path from 'path';

// Define the interface for your data
export interface PortfolioData {
    investedValue: string;
    marketValue: string;
    gainLoss: string;
    gainLossPercentage: string;
}

export async function appendToSheet(data: PortfolioData, spreadsheetId: string, sheetName?: string) {
    try {
        // Auth using the key file
        // Ensure service-account.json is in the project root
        // In Next.js, process.cwd() is usually the project root.
        const keyFilePath = path.join(process.cwd(), 'service-account.json');

        const auth = new google.auth.GoogleAuth({
            keyFile: keyFilePath,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        let targetTitle = '';

        if (sheetName) {
            targetTitle = sheetName;
        } else {
            // Auto-detection logic
            const meta = await sheets.spreadsheets.get({
                spreadsheetId,
                fields: 'sheets(properties(title))'
            });

            const titles = meta.data.sheets?.map(s => s.properties?.title) || [];

            // Smart default: Look for "Mutual Funds" specifically as per user preference
            if (titles.includes('Mutual Funds')) {
                targetTitle = 'Mutual Funds';
            } else {
                targetTitle = titles[0] || 'Sheet1';
            }
        }

        // Quote if needed
        const safeTitle = targetTitle.includes(' ') ? `'${targetTitle}'` : targetTitle;
        const range = `${safeTitle}!A:C`;

        // Format Date: dd-mm-yyyy
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const year = now.getFullYear();
        const formattedDate = `${day}-${month}-${year}`;

        // Prepare values to append
        // User requested only: [Date, Invested Value, Market Value]
        const values = [
            [
                formattedDate,
                data.investedValue,
                data.marketValue
            ]
        ];

        const resource = {
            values,
        };

        console.log(`Appending to range: ${range}`);

        // Append to the first sheet found
        // insertDataOption: 'INSERT_ROWS' ensures that new rows are inserted, which helps extend table formatting
        const result = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            requestBody: resource,
        });

        console.log(`Cells appended: ${result.data.updates?.updatedCells}`);
        return result.data;

    } catch (error) {
        console.error('Google Sheets Error:', error);
        throw new Error('Failed to append data to Google Sheets');
    }
}
