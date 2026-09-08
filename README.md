# 🤝 i-Volunteer

<div align="center">

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React Router](https://img.shields.io/badge/React_Router-v7.18-CA4245?style=for-the-badge&logo=react-router&logoColor=white)](https://reactrouter.com/)
[![JavaScript](https://img.shields.io/badge/ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS3](https://img.shields.io/badge/CSS3-Modular-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://www.w3.org/Style/CSS/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

**A community-driven digital platform connecting surplus food, clothing, books, and medical aid with verified NGOs, shelters, orphanages, and old-age homes across Chandigarh Tricity and Punjab.**

[Quick Start](#-quick-start) • [Features](#-key-features) • [Tech Stack](#-technology-stack) • [Demo Accounts](#-demo-accounts) • [Project Structure](#-project-structure)

</div>

---

## 📖 About The Project

Every day, vast quantities of edible food, wearable garments, school supplies, and medicines are discarded while thousands of underprivileged individuals in our neighborhoods struggle for basic necessities.

**i-Volunteer** bridges this critical gap. Built as a high-performance **Single Page Application (SPA)**, the platform simplifies donation logistics and volunteer engagement into an intuitive, frictionless experience. Donors can pledge items directly to verified non-profits, volunteers can register and discover nearby community relief drives, and organizers receive structured aid.

---

## ✨ Key Features

### 📦 Seamless Donation Workflow
- **Multi-Category Giving**: Donate surplus cooked food, packaged groceries, winter clothes, textbooks, medicines, and daily essentials.
- **Direct NGO Matching**: Choose from verified local shelters, orphanages, and welfare trusts in Chandigarh, Mohali, and Panchkula.
- **Status Tracking**: Track donation requests from *Submitted* to *Scheduled*, *Picked Up*, and *Delivered*.

### 🙋 Volunteer Hub & Community Drives
- **Upcoming Drives**: Browse real-world drives (Langar & ration drives at PGI, winter warmth distributions, youth tutoring sessions).
- **One-Click RSVP**: Sign up as a volunteer with defined roles (distribution coordinator, logistics, community outreach).
- **Impact Metrics**: Track total volunteer hours contributed, drives attended, and milestone badges earned.

### 🏢 Verified Non-Profits Directory
- **Curated NGO Profiles**: Detailed listings including mission, verified registration number, operational sectors, direct contact info, and current item wishlists.
- **Filter & Search**: Search by city, category, or cause.

### 🔐 Authentication & Session Security
- **Secure Mock Auth**: Client-side authentication with token-based session handling.
- **Protected Routes**: Custom route guard prevents unauthorized access to personal dashboards and sensitive actions.
- **Dynamic Header & Navigation**: Auto-updates navigation links and shows user avatar initials upon sign-in.

### 💾 Zero-Database Client-Side Persistence
- **Zero Config Setup**: Requires no complex backend or database installation.
- **LocalStorage API Engine**: A complete mock REST layer persists users, donations, drive sign-ups, and profile edits directly in browser storage (`localStorage`).

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) (Component Architecture, Hooks, Context API) |
| **Build & Bundler** | [Vite 8](https://vitejs.dev/) (Fast HMR & Optimized Production Bundles) |
| **Routing** | [React Router v7](https://reactrouter.com/) (Browser routing, Protected routes, 404 handler) |
| **Styling** | Custom Modular CSS3 (Design tokens, CSS Grid, Flexbox, Glassmorphism, Micro-animations) |
| **Icons & Media** | Crisp scalable vector SVGs and responsive WebP/PNG assets |
| **State & Storage** | React Context (`AuthContext`) + Browser `localStorage` engine |
| **Tooling** | [Oxlint](https://oxc.rs/), modern ES Modules, Git/GitHub |

---

## 🎓 Academic / Curriculum Highlights

This project demonstrates comprehensive mastery of core Frontend Engineering concepts:

- **HTML5 & Accessibility**: Semantic elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, `<form>`), ARIA labels, accessible contrast ratios.
- **CSS3 Mastery**: CSS custom properties (variables), multi-column Grid layouts, flexible alignment with Flexbox, and mobile-first responsive media queries.
- **Modern JavaScript (ES6+)**: `let`/`const`, arrow functions, array destructuring, spread/rest operators, asynchronous programming (`async`/`await`, Promises), and ES module imports.
- **React Fundamentals & Advanced Hooks**:
  - `useState` for local form validations and modal toggle states.
  - `useEffect` for lifecycle synchronizations and persistent storage sync.
  - `useContext` for global application state (`AuthContext`).
  - `useRef` for outside-click dropdown closures and DOM references.
- **Single Page Application (SPA) Architecture**: Client-side routing with clean URL parameters, nested route configurations, and fallback 404 page handling.

---

## 📁 Project Structure

```
donation-project/
├── frontend/
│   ├── public/
│   │   ├── favicon.svg             # Brand vector SVG favicon
│   │   ├── favicon.ico             # Cross-browser ICO favicon
│   │   ├── icons.svg               # SVG sprite map
│   │   └── images/                 # Favicon PNG and high-res campaign hero assets
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── Header.jsx          # Dynamic navbar with auth badges & mobile drawer
│   │   │   ├── Footer.jsx          # Comprehensive site footer & quick links
│   │   │   ├── ProtectedRoute.jsx  # Route guard for authenticated views
│   │   │   └── index.js            # Barrel export
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # Global authentication provider & custom hooks
│   │   │   └── index.js            # Context barrel export
│   │   ├── css/                    # Modular stylesheet architecture
│   │   │   ├── base.css            # Typography, CSS tokens, resets & color palette
│   │   │   ├── layout.css          # Nav, header, footer & page containers
│   │   │   ├── components.css      # Buttons, cards, modals, form inputs & badges
│   │   │   └── responsive.css      # Mobile, tablet, and widescreen breakpoints
│   │   ├── data/
│   │   │   └── appData.js          # Tricity NGOs seed database & taxonomy
│   │   ├── pages/                  # Page view controllers
│   │   │   ├── HomePage.jsx        # Landing page with stats, hero & quick CTA
│   │   │   ├── DonatePage.jsx      # Multi-step donation submission form
│   │   │   ├── VolunteerPage.jsx   # Volunteer registration & community drives
│   │   │   ├── OrganisationsPage.jsx # Searchable non-profit directory
│   │   │   ├── ProfilePage.jsx     # User dashboard with donation & volunteer history
│   │   │   ├── LoginPage.jsx       # User login view
│   │   │   ├── SignupPage.jsx      # New account registration view
│   │   │   ├── AboutPage.jsx       # Mission statement & team information
│   │   │   ├── NotFoundPage.jsx    # Custom 404 error page
│   │   │   └── index.js            # Page barrel export
│   │   ├── services/
│   │   │   └── api.js              # Self-contained localStorage REST client
│   │   ├── App.jsx                 # Central router & route definitions
│   │   └── main.jsx                # React DOM root entry
│   ├── index.html                  # HTML5 template with modern meta & favicon tags
│   ├── vite.config.js              # Vite configuration
│   └── package.json                # Frontend package dependencies & build scripts
├── package.json                    # Root package scripts
└── README.md                       # Comprehensive project documentation
```

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.0 or later recommended)
- `npm` or `yarn`

### 1. Clone the Repository
```bash
git clone https://github.com/yuvrajgoyal343/i-Volunteer.git
cd i-Volunteer
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
cd frontend
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open your browser and navigate to **`http://localhost:5173`**.

### 4. Build for Production
```bash
npm run build
```
The optimized production bundle will be generated in `frontend/dist/`. To preview the production build locally:
```bash
npm run preview
```

---

## 🔑 Demo Accounts

For immediate evaluation and testing, you can use either of these pre-seeded demo accounts:

| Account Type | Email | Password | Role / Pre-loaded Data |
| :--- | :--- | :--- | :--- |
| **Volunteer & Donor** | `demo@ivolunteer.org` | `password123` | Active volunteer profile, 26.5 recorded hours, 3 badges, past donation history |
| **Standard Donor** | `harleen@example.com` | `password123` | Regular donor profile with active textbook and clothing contributions |

> You can also register any new account on the **Sign Up** page. All newly registered accounts and donations will be safely stored in your browser's `localStorage`.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — feel free to use and adapt it for learning and community initiatives.

---

<div align="center">
Made with ❤️ to empower communities and reduce waste.
</div>
