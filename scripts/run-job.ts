import { scrapeMFCentral } from '../src/lib/mfCentral';
import { appendToSheet } from '../src/lib/googleSheets';

async function run() {
    console.log('Starting scheduled job...');

    // 1. Read Credentials from Env
    const PAN = process.env.PAN;
    const PASSWORD = process.env.PASSWORD;
    const QUESTIONS_JSON = process.env.SECURITY_QUESTIONS_JSON; // Expecting stringified JSON
    const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
    const SHEET_NAME = process.env.SHEET_NAME || 'Mutual Funds';

    if (!PAN || !PASSWORD || !QUESTIONS_JSON || !SPREADSHEET_ID) {
        console.error('Missing required environment variables: PAN, PASSWORD, SECURITY_QUESTIONS_JSON, SPREADSHEET_ID');
        process.exit(1);
    }

    let securityQuestions: Record<string, string> = {};
    try {
        securityQuestions = JSON.parse(QUESTIONS_JSON);
    } catch (e) {
        console.error('Failed to parse SECURITY_QUESTIONS_JSON. Ensure it is valid JSON.');
        process.exit(1);
    }

    try {
        // 2. Scrape Data
        console.log('Scraping MF Central...');
        const data = await scrapeMFCentral({
            pan: PAN,
            password: PASSWORD,
            securityQuestions
        });

        console.log('Scraping successful:', data);

        // 3. Push to Google Sheets
        console.log(`Pushing to Sheet: ${SHEET_NAME} (${SPREADSHEET_ID})`);
        await appendToSheet(data, SPREADSHEET_ID, SHEET_NAME);

        console.log('Job completed successfully.');
        process.exit(0);

    } catch (error) {
        console.error('Job failed:', error);
        process.exit(1);
    }
}

run();
