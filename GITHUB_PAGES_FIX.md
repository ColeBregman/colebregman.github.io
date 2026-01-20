# GitHub Pages Deployment Fix Guide

## 🐛 Common Errors & Solutions

### Error 1: "Expected a JavaScript module script but server responded with MIME type 'application/octet-stream'"

**Cause**: GitHub Pages not serving .js files with correct MIME type.

**Solutions**:

1. **Ensure `.nojekyll` file exists**
   - ✅ Already created at `public/.nojekyll`
   - This file will be copied to `dist/` during build

2. **Rebuild and redeploy**:
   ```bash
   npm run build
   npm run deploy
   ```

3. **If still failing, check vite.config.ts**:
   - ✅ Already has `base: './'` which is correct

4. **Alternative: Use absolute base path**
   ```typescript
   // In vite.config.ts, change:
   base: '/colebregman.github.io/'  // Use your repo name
   ```

### Error 2: 404 for Favicon/Assets

**Cause**: Spaces in filenames get URL-encoded differently.

**Fixed**:
- ✅ Changed `/Favicon Collection/` to `/Favicon%20Collection/`
- ✅ Changed `/assets/Cole Logo.svg` to `/assets/Cole%20Logo.svg`
- ✅ Removed manifest reference (was causing 404)

---

## 📋 Deployment Checklist

Before deploying:

- [x] Build completes successfully (`npm run build`)
- [x] `.nojekyll` file in public/ directory
- [x] Vite config has `base` path set
- [x] All asset paths URL-encoded if they have spaces
- [x] No broken image/file references

---

## 🚀 Deployment Steps

### Method 1: Using npm script (Recommended)

```bash
# Clean build
rm -rf dist

# Build
npm run build

# Verify .nojekyll was copied
ls dist/.nojekyll

# Deploy
npm run deploy
```

### Method 2: Manual Deploy

```bash
# Build
npm run build

# Navigate to dist
cd dist

# Initialize git
git init
git add -A
git commit -m 'Deploy'

# Force push to gh-pages branch
git push -f git@github.com:colebregman/colebregman.github.io.git main:gh-pages

# Go back
cd ..
```

---

## 🔍 Verification

After deploying, check:

1. **GitHub Pages Settings**:
   - Go to repo → Settings → Pages
   - Source should be "gh-pages" branch
   - Visit the live URL

2. **Browser Console**:
   - Open DevTools (F12)
   - Check for any 404 or MIME errors
   - All assets should load with 200 status

3. **Assets Loading**:
   - Images display correctly
   - JavaScript runs
   - CSS applies
   - Fluid cursor works

---

## 🛠️ If Issues Persist

### Option A: Rename Files (Remove Spaces)

```bash
# Rename files to remove spaces
mv "public/assets/Cole Logo.svg" "public/assets/cole-logo.svg"
mv "public/Favicon Collection" "public/favicons"
```

Then update references in:
- `src/components/Navigation.tsx`
- `index.html`

### Option B: Use HashRouter (Already Done)

Your app already uses HashRouter which helps with GitHub Pages routing.

### Option C: Check GitHub Pages Settings

1. Repository Settings → Pages
2. Ensure Source is set to "gh-pages" branch
3. Save and wait 1-2 minutes for deployment

---

## 📝 Recommended Action

1. **Clear your GitHub Pages cache**:
   - Go to repo settings
   - Pages section
   - Click "Remove" then re-enable from gh-pages branch

2. **Redeploy**:
   ```bash
   npm run build
   npm run deploy
   ```

3. **Wait 2-3 minutes** for GitHub to update

4. **Hard refresh** your browser (Cmd+Shift+R on Mac)

The `.nojekyll` file and correct base path should resolve the MIME type error!