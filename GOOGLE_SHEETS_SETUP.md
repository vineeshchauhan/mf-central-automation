# Google Sheets Service Account Setup Guide

Since you are using a personal Gmail account, follow these steps to generate the required credentials:

## 1. Create a Project in Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Click on the project dropdown (top left) and select **New Project**.
3. Name it (e.g., "MFCentral Scraper") and click **Create**.

## 2. Enable Google Sheets API
1. In the search bar at the top, type **"Google Sheets API"**.
2. Click on it and select **Enable**.

## 3. Create a Service Account
1. Go to **APIs & Services > Credentials**.
2. Click **+ CREATE CREDENTIALS** > **Service account**.
3. Name it (e.g., "sheet-bot").
4. Click **Create and Continue**.
5. (Optional) Role: Select **Project > Editor** (simplest for now).
6. Click **Done**.

## 4. Generate the JSON Key
1. In the **Service Accounts** list, click on the email of the account you just created (e.g., `sheet-bot@...`).
2. Go to the **Keys** tab.
3. Click **Add Key > Create new key**.
4. Select **JSON** and click **Create**.
5. A file will download. **Rename it to `service-account.json`** and place it in your project root folder:
   `C:\Users\Vini\.gemini\antigravity\scratch\mf-central-saas\service-account.json`

## 5. Share the Sheet
1. Open your target Google Sheet.
2. Copy the **Service Account Email** (from step 4.1).
3. Click **Share** (top right in Sheets).
4. Paste the service account email and ensure it has **Editor** access.
5. Click **Send** (uncheck "Notify people" if you want, usually fine).

## 6. Get Spreadsheet ID
1. Look at the URL of your Google Sheet.
   `https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBzA.../edit`
2. The ID is the long string between `/d/` and `/edit`.
   Example: `1BxiMVs0XRA5nFMdKvBdBzA...`
