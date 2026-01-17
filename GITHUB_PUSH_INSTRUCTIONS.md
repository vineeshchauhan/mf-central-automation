# How to Push Your Code to GitHub

Since you have a local Git repository, follow these steps to upload it to GitHub.

## 1. Create a Repository on GitHub
1.  Log in to [GitHub](https://github.com/).
2.  Click the **+** icon in the top-right corner and select **New repository**.
3.  **Repository name**: `mf-central-automation` (or any name you like).
4.  **Visibility**: Choose **Private** (Recommended since it deals with financial data).
5.  **Initialize this repository with**: Leave all unchecked (No README, No .gitignore).
6.  Click **Create repository**.

## 2. Push Your Code
Open your terminal (Command Prompt or PowerShell) in the project folder and run these commands:

```bash
# 1. Add all new files
git add .

# 2. Commit the changes
git commit -m "feat: complete automation setup with weekly schedule"

# 3. Rename branch to main (if not already)
git branch -M main

# 4. Link your local repo to GitHub
# REPLACE 'your-username' with your actual GitHub username
git remote add origin https://github.com/your-username/mf-central-automation.git

# 5. Push the code
git push -u origin main
```

## 3. Post-Push Setup
Once the code is on GitHub:
1.  Go to the **Settings** tab of your repository.
2.  Follow the [GITHUB_SETUP.md](./GITHUB_SETUP.md) guide to add your secrets (`PAN`, `PASSWORD`, etc.).
3.  Go to the **Actions** tab to see your workflows.
