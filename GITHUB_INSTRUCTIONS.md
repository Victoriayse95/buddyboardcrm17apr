# GitHub Setup Instructions

To push this project to GitHub:

1. Create a new repository on GitHub named `bdayperkstracker`

2. Go to https://github.com/new and create a new repository named "bdayperkstracker"

3. Update the remote URL with your actual GitHub username:
   ```bash
   git remote set-url origin https://github.com/YOUR_USERNAME/bdayperkstracker.git
   ```

4. Push to GitHub:
   ```bash
   git push -u origin main
   ```

When prompted, enter your GitHub username and your personal access token (instead of your password).

## Creating a Personal Access Token

If you don't have a personal access token:

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name (e.g., "BdayPerksTracker")
4. Select scopes: at minimum, check "repo"
5. Click "Generate token"
6. Copy the token immediately (you won't be able to see it again)

## Connecting to Vercel

Once your code is on GitHub:

1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Configure with these settings:
   - Framework preset: Next.js
   - Root directory: ./
   - Build Command: (leave as default)
   - Output Directory: (leave as default)

4. Add environment variables (from your .env.local file)
5. Deploy 