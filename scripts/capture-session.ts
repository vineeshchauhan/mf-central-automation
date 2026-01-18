import { chromium } from 'playwright-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';

chromium.use(stealthPlugin());

async function captureSession() {
    console.log('Launching browser for manual login...');
    console.log('Please log in MANUALLY in the browser window that opens.');

    // Launch HEADED browser on your PC
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('https://app.mfcentral.com/investor/signin');

    console.log('Waiting up to 5 minutes for you to log in...');

    // Wait until we reach the dashboard (URL contains 'portal')
    try {
        await page.waitForURL('**/portal/**', { timeout: 300000 }); // 5 minutes
        console.log('Login detected! capturing session...');

        // Save storage state (cookies, local storage)
        await page.context().storageState({ path: 'session.json' });

        console.log('SUCCESS! Session saved to "session.json".');
        console.log('You can now close the browser.');

    } catch (e) {
        console.log('Timeout or error waiting for login:', e);
    } finally {
        await browser.close();
    }
}

captureSession();
