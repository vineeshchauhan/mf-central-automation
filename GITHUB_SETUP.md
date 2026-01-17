# Setting up GitHub Actions Automation

To enable the weekly Saturday run, you need to configure "Secrets" in your GitHub repository.

1.  Go to your Repository on GitHub.
2.  Navigate to **Settings** > **Secrets and variables** > **Actions**.
3.  Click **New repository secret** for each of the following:

| Name | Value |
| :--- | :--- |
| `PAN` | Your PAN Number |
| `PASSWORD` | Your MF Central Password |
| `SECURITY_QUESTIONS_JSON` | A JSON string of your security Q&A. Example: `{"Place of Birth":"New York", "First Pet":"Rex"}` |
| `SPREADSHEET_ID` | The ID of your Google Sheet |
| `SERVICE_ACCOUNT_BASE64` | The contents of your `service-account.json` file, converted to Base64. <br> Run this command locally to get the string: <br> **Windows (PowerShell):** `[Convert]::ToBase64String([IO.File]::ReadAllBytes("service-account.json"))` <br> **Mac/Linux:** `base64 -i service-account.json` |

## Manual Trigger
You can also run the scraper manually from the **Actions** tab by selecting "Weekly MF Scraper" and clicking **Run workflow**.
