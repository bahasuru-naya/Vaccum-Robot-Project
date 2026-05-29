# 🚀 GitHub Pages Deployment Guide

Your VacBot dashboard is now set up for **automatic deployment** to GitHub Pages!

## **Quick Setup (3 steps)**

### **Step 1: Update Your GitHub Username**

Edit `dashboard/package.json` and replace `USERNAME` with your GitHub username:

```json
"homepage": "https://YOUR_USERNAME.github.io/Vaccum-Robot/"
```

**Example**: If your GitHub username is `john-doe`:
```json
"homepage": "https://john-doe.github.io/Vaccum-Robot/"
```

### **Step 2: Enable GitHub Pages**

1. Go to your repository on GitHub.com
2. Click **Settings** (top right)
3. Go to **Pages** (left sidebar)
4. Under "Build and deployment":
   - **Source**: Select `GitHub Actions`
   - Click **Save**

### **Step 3: Push & Deploy**

Commit and push your changes:

```bash
cd g:\Vaccum-Robot
git add dashboard/package.json .github/workflows/deploy-dashboard.yml
git commit -m "Setup GitHub Pages auto-deployment"
git push origin main
```

✅ **That's it!** GitHub Actions will automatically build and deploy your dashboard.

## **How It Works**

Every time you push to the `main` branch (and dashboard files change):
1. GitHub Actions runs automatically
2. Installs dependencies (`npm install`)
3. Builds the app (`npm run build`)
4. Deploys to `https://YOUR_USERNAME.github.io/Vaccum-Robot/`

Check deployment status:
1. Go to your repository on GitHub
2. Click **Actions** tab (top)
3. See the workflow run status

## **Your Live Dashboard URL**

Once deployed: **`https://YOUR_USERNAME.github.io/Vaccum-Robot/`**

(Replace `YOUR_USERNAME` with your actual GitHub username)

## **MQTT Safety ✅**

Your dashboard is 100% safe:
- ✅ No backend server needed
- ✅ MQTT connection is **client-side** (browser → HiveMQ)
- ✅ Works from any domain
- ✅ No code changes to firmware
- ✅ Can revert anytime

## **Local Testing**

Before pushing, test locally:

```bash
cd g:\Vaccum-Robot\dashboard
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

## **Troubleshooting**

**"Deployment failed"?**
- Check the **Actions** tab for error messages
- Verify username in `package.json` is correct
- Ensure GitHub Pages is set to "GitHub Actions" in Settings

**"Dashboard is blank"?**
- Check browser console (F12) for errors
- Verify MQTT settings in `MqttContext.jsx` are correct
- Clear browser cache and refresh

**"Old version showing"?**
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Check Actions tab to confirm latest deployment succeeded

## **Update Your Dashboard**

Any time you modify the dashboard:
1. Test locally: `npm run dev`
2. Commit changes: `git add . && git commit -m "description"`
3. Push: `git push origin main`
4. GitHub Actions automatically redeploys!

No manual upload needed. Everything is automatic. 🎉
