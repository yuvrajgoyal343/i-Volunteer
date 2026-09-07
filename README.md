# i-Volunteer

A modern web platform connecting surplus food, clothing, and essential donors with verified NGOs, orphanages, and old-age homes.

---

## 📁 Project Structure

```
donation-project/
├── frontend/             # React 19 + Vite Single Page Application (SPA)
│   ├── public/           # Static assets & images (served at root)
│   │   └── images/       # Site hero & card images, favicon
│   ├── src/
│   │   ├── components/   # Reusable UI components (Header, Footer, ProtectedRoute)
│   │   ├── context/      # Global state & hooks (AuthContext)
│   │   ├── css/          # Modular stylesheet architecture (base, layout, components, responsive)
│   │   ├── data/         # Tricity seed data & taxonomy (appData.js)
│   │   ├── pages/        # Page views (Home, Donate, Volunteer, Organisations, Profile, Auth)
│   │   ├── services/     # Zero-database LocalStorage mock REST client (api.js)
│   │   ├── api.js        # Re-export pointing to services/api.js
│   │   ├── appData.js    # Re-export pointing to data/appData.js
│   │   ├── App.jsx       # Application router with clean barrel imports
│   │   └── main.jsx      # React entry point
│   ├── index.html        # Vite HTML entry template
│   └── package.json      # Frontend scripts and dependencies
│
├── package.json          # Root convenience scripts
└── .gitignore            # Git ignore rules for node_modules & build outputs
```

---

## 🚀 Quick Start

This is a **100% frontend-only** web application. All authentication, donation submissions, and volunteer drive RSVPs are persisted entirely in browser `localStorage` using the mock client in `src/api.js` (no database or external backend server required).

### 1. Install Dependencies
```bash
cd frontend && npm install
```

### 2. Run the Development Server
```bash
npm run dev
# or from frontend folder:
cd frontend && npm run dev
```
The React development server runs at `http://localhost:5173`.

### 3. Build for Production
```bash
npm run build
# or from frontend folder:
cd frontend && npm run build
```
