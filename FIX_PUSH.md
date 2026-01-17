# Fixing the "Push contains secrets" Error

GitHub blocked your push because it detected `service-account.json`. We need to remove this file from Git history while keeping it on your computer.

run the following commands in your terminal:

```bash
# 1. Unstage the secret file (keeps it on disk, removes from git)
git rm --cached service-account.json

# 2. Add it to .gitignore (I have already done this in the step below, but you can double check)
# (Visual Code Editor will update .gitignore automatically if you accept my changes)

# 3. Update your commit to remove the file from history
git commit --amend -m "Complete automation setup"

# 4. Push again
git push -u origin main
```
