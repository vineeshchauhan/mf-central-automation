import { chromium, Page } from 'playwright';

export interface MFCredentials {
    pan: string;
    password: string;
    securityQuestions: Record<string, string>;
}

export interface PortfolioData {
    investedValue: string;
    marketValue: string;
    gainLoss: string;
    gainLossPercentage: string;
}

export async function scrapeMFCentral(creds: MFCredentials): Promise<PortfolioData> {
    // Launch browser (headless by default, can be toggled via env or arg)
    const browser = await chromium.launch({
        headless: false, // Keeping false for now to see what happens during dev
    });

    const page = await browser.newPage();

    try {
        console.log('Navigating to MF Central...');
        await page.goto('https://app.mfcentral.com/investor/signin');

        // --- Step 1: Login Credentials ---
        console.log('entering credentials...');
        // Type PAN
        await page.locator('#textinput').fill(creds.pan);

        // Type Password
        await page.locator('#outlined-adornment-password').fill(creds.password);

        // Click Sign In
        // But FIRST, handle reCAPTCHA if present
        console.log('Checking for reCAPTCHA...');
        try {
            // Find the reCAPTCHA iframe
            const captchaFrame = page.frameLocator('iframe[title="reCAPTCHA"]');

            // Click the anchor checkbox
            // We use a short timeout because if it's not there, we don't want to wait forever.
            // But user said it IS there.
            const anchor = captchaFrame.locator('#recaptcha-anchor');
            if (await anchor.isVisible()) {
                console.log('Clicking "I\'m not a robot"...');
                await anchor.click();
                // Wait for the checkmark or state change. 
                // Strategy: Wait a bit. If it triggers a picture challenge, this script might hang or fail.
                // For a "useful saas product", we assume standard behavior (tick).
                await page.waitForTimeout(2000);
            }
        } catch (e) {
            console.log('CAPTCHA interaction skipped or failed (might not be present or different selector).', e);
        }

        // Now Click Sign In
        await page.locator('#submit-id').click();

        // --- Step 2: Security Questions ---
        console.log('Waiting for security question page...');
        await page.waitForURL('**/signin-questionnaire', { timeout: 10000 });

        let answerFound = false;
        for (const [question, answer] of Object.entries(creds.securityQuestions)) {
            // Check if this question is visible on the page
            // We use exact: false to be lenient with whitespace/formatting
            if (await page.getByText(question, { exact: false }).isVisible()) {
                console.log(`Found security question: "${question}"`);

                // Fill the answer (ID confirmed via debug: #outlined-adornment-password)
                await page.locator('#outlined-adornment-password').fill(answer);
                answerFound = true;
                break;
            }
        }

        if (!answerFound) {
            throw new Error('Could not match any provided security questions with the one on screen.');
        }

        // Click Submit (Assuming #submit-id or trying generic button)
        const submitBtn = page.locator('#submit-id');
        if (await submitBtn.isVisible()) {
            await submitBtn.click();
        } else {
            // Fallback: click the first button that says "Submit" or "Sign In"
            await page.getByRole('button').filter({ hasText: /submit|sign in/i }).first().click();
        }

        // --- Step 3: Handle Post-Login Popups & Navigation ---
        console.log('Waiting for dashboard content...');
        // Logs showed redirect to /portal/home, not dashboard
        await page.waitForURL('**/portal/home', { timeout: 30000 });

        // Handle Popups (User advised waiting 10s)
        console.log('Waiting 10s for popups to appear...');
        await page.waitForTimeout(10000);

        console.log('Checking for popups...');
        // Generic loop to handle 1 or 2 popups
        for (let i = 0; i < 5; i++) { // distinct attempts
            try {
                // Simplified selector based on user HTML class "customBtn"
                // We search for any button with class customBtn that contains text "Ok"
                const okBtn = page.locator('button.customBtn').filter({ hasText: 'Ok' }).first();

                if (await okBtn.isVisible({ timeout: 2000 })) {
                    console.log(`Dismissing popup #${i + 1} (Found .customBtn)...`);
                    // JS Click as per user confirmation
                    await okBtn.evaluate((node) => (node as HTMLElement).click());
                    await page.waitForTimeout(2000);
                } else {
                    // Fallback: generic Mui button with "Ok"
                    const genericBtn = page.locator('button span:has-text("Ok")').locator('..');
                    if (await genericBtn.count() > 0 && await genericBtn.first().isVisible({ timeout: 1000 })) {
                        console.log(`Dismissing generic popup #${i + 1}...`);
                        await genericBtn.first().evaluate((node) => (node as HTMLElement).click());
                        await page.waitForTimeout(2000);
                    } else {
                        break; // No buttons found
                    }
                }
            } catch (e) {
                console.log('Popup check warning:', e);
                break;
            }
        }

        // Wait for popups to fade out completely
        await page.waitForTimeout(5000);

        // Navigate to Portfolio
        console.log('Navigating to Portfolio tile...');
        // Fix: strict mode violation. "Portfolio" matches nav, tile, and text.
        // We target the exact text "Portfolio" (likely the main link/tile header).
        // and use .first() to pick the top-most one (usually nav or main heading).
        await page.getByText('Portfolio', { exact: true }).first().click();

        // Wait for the Portfolio page/modal to load the values
        // Assuming the values appear after clicking.
        await page.waitForTimeout(3000);

        // --- Step 4: Extract Data ---
        console.log('Waiting for data to load...');
        try {
            // Wait for the container based on the user's HTML snippet
            await page.waitForSelector('.db-portfolio-bottom', { timeout: 15000 });

            // Extract values using browser context
            const portfolioData = await page.evaluate(() => {
                // Helper to find value by label
                const getValueLines = (label: string): { value: string, percentage: string } => {
                    // Try to find the h6 with specific text
                    const headers = Array.from(document.querySelectorAll('.db-portfolio-info h6'));
                    const targetHeader = headers.find(h => h.textContent?.trim() === label);

                    if (targetHeader && targetHeader.parentElement) {
                        const pTag = targetHeader.parentElement.querySelector('p');
                        if (pTag) {
                            // Specifically for Gain/Loss, the value is in the first text node,
                            // followed by a span with the percentage.

                            let value = '';
                            let percentage = '';

                            // 1. Value (Text Node)
                            const firstNode = pTag.firstChild;
                            if (firstNode && firstNode.nodeType === 3) { // Text node
                                value = firstNode.textContent?.trim() || '';
                            } else {
                                // Fallback if no text node check
                                value = pTag.innerText.replace(pTag.querySelector('span')?.innerText || '', '').trim();
                            }

                            // 2. Percentage (Span)
                            const span = pTag.querySelector('span');
                            if (span) {
                                percentage = span.innerText.trim();
                            }

                            return { value, percentage };
                        }
                    }
                    return { value: '', percentage: '' };
                };

                const invested = getValueLines('Invested Value');
                const market = getValueLines('Market Value');
                const gain = getValueLines('Gain/Loss (Absolute)');

                return {
                    investedValue: invested.value,
                    marketValue: market.value,
                    gainLoss: gain.value,
                    gainLossPercentage: gain.percentage
                };
            });

            console.log('Raw Extracted Data:', portfolioData);

            return {
                investedValue: cleanValue(portfolioData.investedValue),
                marketValue: cleanValue(portfolioData.marketValue),
                gainLoss: cleanValue(portfolioData.gainLoss),
                gainLossPercentage: cleanValue(portfolioData.gainLossPercentage)
            };

        } catch (e) {
            console.error('Error finding portfolio elements:', e);
            throw new Error('Could not extract portfolio data. Selector .db-portfolio-bottom or inner elements not found.');
        }

    } catch (error) {
        console.error('Scraping Logic Failed:', error);
        await page.screenshot({ path: 'error-final.png' });
        throw error;
    } finally {
        await browser.close();
    }
}

function cleanValue(text: string): string {
    if (!text) return '0';
    // Remove ₹, whitespace, and commas
    // Example: "₹16,69,587.70" -> "1669587.70"
    // Example: "₹7,65,671.44  + 45.86 %" -> handled by extraction logic first, but if any cruft remains:
    return text.replace(/[^\d.-]/g, ''); // Keep digits, dots, and negative signs
}
