# Deployment Guide

Since this application uses **Playwright** (headless browser), it requires a specific environment to run. Standard "Serverless" Next.js hosting (like Vercel or Netlify) usually implies size limits or missing binary dependencies for Playwright.

**The Best Option: Docker**
We have included a `Dockerfile` that uses the official Microsoft Playwright image. This ensures all browser dependencies are present.

## Option 1: Render.com (Easiest)
Render supports Docker deployments and is very user-friendly.

1.  Push your code to a **GitHub Repository**.
2.  Sign up at [Render.com](https://render.com).
3.  Click **New +** and select **Web Service**.
4.  Connect your GitHub repository.
5.  Select **Docker** as the Runtime (it should auto-detect the Dockerfile).
6.  **Environment Variables**:
    *   Add your `GOOGLE_APPLICATION_CREDENTIALS` content.
        *   *Note*: Render requires a file path or strict JSON handling.
        *   **Better Approach for Render**:
            *   Convert your `service-account.json` content into a base64 string locally: `base64 -i service-account.json`.
            *   Add an env var `SERVICE_ACCOUNT_BASE64` in Render.
            *   *We might need to update the code to read from this, or you can just commit the `service-account.json` if it's a private repo (not recommended for public repos).*
            *   **Alternative**: Upload the `service-account.json` as a "Secret File" if the platform supports it (Render creates files from text for paying users, or you can use the environment variable trick).
7.  Click **Create Web Service**.

## Option 2: VPS (DigitalOcean, Hetzner, EC2)
If you have a Linux server (Ubuntu/Debian):

1.  **Install Node.js & NPM**:
    ```bash
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    ```
2.  **Clone your repo**:
    ```bash
    git clone https://github.com/your-username/mf-central-saas.git
    cd mf-central-saas
    ```
3.  **Install Dependencies**:
    ```bash
    npm install
    npx playwright install --with-deps chromium
    ```
4.  **Build & Start**:
    ```bash
    npm run build
    npm start
    ```
5.  **Keep it running**: Use `pm2`
    ```bash
    sudo npm install -g pm2
    pm2 start npm --name "mf-scraper" -- start
    ```

## Important Note on Google Credentials
The application looks for `service-account.json` in the project root.
- **Docker**: You will need to ensure this file exists inside the container or update the code to read JSON from an environment variable.
- **VPS**: Just upload the file to the root folder using `scp` or create it with `nano service-account.json`.
