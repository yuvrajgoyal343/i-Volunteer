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
│   │   ├── components/   # Header, Footer, ProtectedRoute
│   │   ├── context/      # AuthContext (React Context + JWT/LocalStorage)
│   │   ├── css/          # Base, layout, components, responsive styles
│   │   ├── pages/        # HomePage, DonatePage, VolunteerPage, OrganisationsPage, etc.
│   │   ├── api.js        # API service layer (Backend API with LocalStorage fallback)
│   │   ├── appData.js    # Seed data & initial mock state
│   │   ├── App.jsx       # Client router (react-router-dom)
│   │   └── main.jsx      # React entry point
│   ├── index.html        # Vite HTML entry template
│   └── package.json      # Frontend scripts and dependencies
│
├── backend/              # Node.js + Express REST API
│   ├── db.js             # MySQL connection pool configuration
│   ├── server.js         # Express REST API endpoints & JWT authentication
│   ├── test_api.js       # Backend integration test script
│   └── package.json      # Backend scripts and dependencies
│
├── package.json          # Root orchestration scripts
└── .gitignore            # Git ignore rules for node_modules, build outputs, & secrets
```

---

## 🚀 Quick Start

### 1. Run the Frontend (React App)
```bash
npm run dev
# or from frontend folder:
cd frontend && npm run dev
```
The React development server runs at `http://localhost:5173`.

### 2. Build for Production
```bash
npm run build
# or:
cd frontend && npm run build
```

### 3. Run the Backend API (Optional)
```bash
npm run server
# or:
cd backend && npm start
```
The Express backend server runs at `http://localhost:3001`.
