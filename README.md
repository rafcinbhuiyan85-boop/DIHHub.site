# DIH TEMPLATE - Premium Multi-Utility Portal

This project is a high-performance web application built with **React**, **Vite**, **Express**, and **Firebase**.

## 🚀 How to Run in VS Code

Follow these steps to get your project running locally on your computer:

### 1. Prerequisites
- **Node.js** installed (Version 18 or higher recommended)
- **VS Code** installed

### 2. Getting the Code
- Export this project from AI Studio as a **ZIP** or to **GitHub**.
- Open the project folder in VS Code.

### 3. Installation
Open your terminal in VS Code (Ctrl + `) and run:
```bash
npm install
```

### 4. Running the Development Server (Live Preview)
To start the app with live preview, run:
```bash
npm run dev
```
The app will typically start at `http://localhost:3000`. You can now edit any file in the `src` folder and see the changes instantly!

## 🛠 Features
- **HTML Hosting Engine**: Host and preview custom HTML templates.
- **Admin Dashboard**: Full control over users, logs, and site settings.
- **Cinema Experience**: TMDB integration for trending movies and series.
- **Dynamic Tools**: Daily interest calculators, site migration tools, and more.

## 📁 Key Files
- `server.ts`: The backend Express server.
- `src/App.tsx`: Main routing and tool selection.
- `src/components/admin/`: Admin panel components.
- `firebase-applet-config.json`: Your Firebase connection setup.

## 🌐 Production Build & Deployment

To build the app for production:
```bash
npm run build
npm start
```

---

## ⚡ Deployment Guides

### 1. Vercel Deployment (Full-Stack Support)

Vercel is fully supported out of the box because of our pre-configured `vercel.json` and serverless API proxy (`api/index.ts`). It handles both Node.js API endpoints and static React pages.

1. **Upload the code** to a private or public GitHub repository.
2. Sign in to [Vercel](https://vercel.com) and click **"Add New"** -> **"Project"**.
3. Import your GitHub repository.
4. Keep the default settings (Vercel will auto-detect Vite + Express configuration).
5. **No changes are needed** to the build settings because `vercel.json` maps incoming requests correctly.
6. Click **Deploy**. Your site will be live instantly!

### 2. GitHub Pages (Static Build Only)

GitHub Pages handles static websites. Note that since GitHub Pages is purely static, server-side APIs (like local logs storage or background media downloads) will not run; however, the client-side Firebase connections (real-time Firestore and Auth) will work perfectly!

1. Edit `vite.config.ts` if needed to add `base: '/<your-repository-name>/'` (if you are not hosting on a custom root domain).
2. Install the GitHub Pages deploy tool:
   ```bash
   npm install --save-dev gh-pages
   ```
3. Add these scripts to your `package.json`:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```
4. Run `npm run deploy` to publish the static client-side application directly to your GitHub Pages branch.

### 3. Node.js Production Hosting (VPS, Hostinger, cPanel)

To host on a standard Linux VPS or Node.js hosting platform (like Hostinger or Render):

1. **Install Node.js** (v18+) and **npm** on the server.
2. Clone or upload your files to the server.
3. Install production dependencies:
   ```bash
   npm install --production
   ```
4. Run the build script to bundle Vite assets and server-side TS files:
   ```bash
   npm run build
   ```
5. Run using a process manager like **PM2** to keep it running continuously in the background:
   ```bash
   npm install -g pm2
   pm2 start dist/server.cjs --name "dih-hub"
   ```

