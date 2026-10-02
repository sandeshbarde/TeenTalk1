# TeenTalk: Adolescent Safety Awareness, Learning & Institutional Redressal Platform

[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-purple.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-teal.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ecf8e.svg)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-ISC-lightgrey.svg)](LICENSE)

---

## 1. Project Overview

**TeenTalk** is a full-stack, modular web application designed to empower teenagers, parents, academic institutions, and corporate organizations with age-appropriate safety education, crisis guidance, and statutory harassment redressal.

Adolescents encounter complex digital and physical challenges—such as cyberbullying, social engineering, personal boundary violations, and emotional distress—often without access to confidential or trusted redressal channels. Concurrently, academic institutions and workplaces require structured compliance under frameworks like the **POCSO Act** (Protection of Children from Sexual Offences) and the **POSH Act, 2013** (Prevention of Sexual Harassment).

TeenTalk unites these stakeholders into an integrated, secure ecosystem governed by **10 granular roles**, Row Level Security (RLS), confidential anonymous reporting, encrypted evidence storage, crisis-aware AI chat, and verifiable safety certification.

---

## 2. Key Features

- **Multi-Tiered Role-Based Access Control (10 Distinct Roles)**: Dedicated interfaces and backend permission checks for *Teen, Adult/Parent, Employee, School Admin, HR, NGO, Counselor, Content Manager, Super Admin, and Auditor*.
- **Adolescent Safety Curriculum**: Modular courses covering Cyber Safety, Safe Touch Boundaries, Anti-Bullying Upstander Strategies, Emotional Wellbeing, and POSH Awareness.
- **Confidential & Anonymous Incident Reporting**: Anonymous case lookup uses a 128-bit tracking token; only the token or an authorized account can access the case.
- **Encrypted Evidence Vault**: PDF, PNG, JPG, and WEBP files are checked against their file signatures and encrypted at rest with AES-256-GCM before private, role-checked downloads.
- **Crisis-Aware Educational AI Safety Companion**: Empathy-first AI assistant equipped with rule-based emergency triggers (escalating crisis and self-harm keywords directly to national helplines `1098` and `112`).
- **Emotional Wellness & Mood Journaling**: 5-point rating check-ins, emotion tags, private notes, and weekly mood trend analytics powered by Recharts.
- **Interactive Quizzes & Cryptographic Certificates**: Knowledge evaluation with instant pedagogical feedback and SHA-256 verified downloadable certificates.
- **School & Institutional Governance**: Real-time student participation charts, curriculum allocation, and incident monitoring.

---

## 3. Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router DOM (v6) with `ProtectedRoute` & `RoleGuard`
- **Styling**: Tailwind CSS with custom safety/calm teal and blue palettes
- **Icons**: Lucide React
- **Analytics Visualizations**: Recharts (Area, Bar, and Line charts)

### Backend
- **Runtime**: Node.js (v20+) with Express
- **Database & Auth**: Supabase PostgreSQL + Supabase Auth / Local Seeded Store
- **Security**: Helmet, CORS, Express-Rate-Limit, Bcrypt.js, JSONWebToken
- **File Upload**: Multer with strict MIME and 10MB size validation
- **Architecture**: Modular Services, Controllers, Validators, and Centralized Error Handling

---

## 4. Complete Folder Structure

```
TeenTalk/
├── backend/
│   ├── config/              # Environment, Supabase client, and constants
│   ├── controllers/         # REST API request handlers
│   ├── database/            # schema.sql, seeds.sql, and rls.sql
│   ├── middleware/          # auth, rbac, orgScope, upload, rateLimiter, errorHandler, audit
│   ├── models/              # DataStore seeded repository layer
│   ├── routes/              # Express route modules
│   ├── services/            # Business logic and compliance rules
│   ├── tests/               # runner.js verifying test cases TT-AUTH-01 to TT-RESP-01
│   ├── uploads/evidence/    # Secure physical storage for private attachments
│   ├── validators/          # Input schema and payload validators
│   ├── package.json
│   └── server.js            # Express server entrypoint
│
├── frontend/
│   ├── public/              # Static public assets
│   ├── src/
│   │   ├── app/             # App.jsx, routes.jsx
│   │   ├── components/      # Common, layout, forms, charts, feedback
│   │   ├── constants/       # Role enums, routes, and emergency numbers
│   │   ├── context/         # AuthContext, ToastContext
│   │   ├── hooks/           # useAuth, useToast
│   │   ├── pages/           # public, auth, teen, school, admin, employee, hr, ngo, adult
│   │   ├── services/        # apiClient wrapper
│   │   ├── styles/          # index.css (Tailwind directives)
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── README.md
├── PROJECT_REQUIREMENTS.md
├── DATABASE_SCHEMA.md
├── API_DOCUMENTATION.md
├── RBAC_MATRIX.md
├── UI_UX_GUIDE.md
├── TESTING_CHECKLIST.md
└── TEAM_TASKS.md
```

---

## 5. Team Modules & Division of Ownership

| Team Member | Module Ownership | Key Responsibilities |
| :--- | :--- | :--- |
| **Payal Sharma** | Authentication, Public Pages & Teen Safety | Landing page, Register/Login JWT auth, public safety guide, Teen curriculum catalog, reading viewer, module progress tracking. |
| **Tejas Kulkarni** | Database Architecture, School & Super Admin | PostgreSQL schema (13 tables), Supabase RLS, School Admin analytics console, student roster, global user and organization management, audit logs. |
| **Nisha Verma** | POSH, Complaints, HR & Counselor Hub | Confidential complaint engine, tracking code generator, private evidence vault, HR POSH case review, counselor notes, appointment calendar. |
| **Harshada Patil** | Adult Guidance, Safe AI Chat, Mood & Certification | Parent guidance center, crisis-aware AI chat with helpline escalation, daily mood tracker, interactive quiz player, SHA-256 certificate generation. |

---

## 6. Installation & Quick Start

### Prerequisites
- Node.js (v18 or higher)
- NPM (v9 or higher)
- Git

### 1. Clone & Set Up Backend
```bash
cd backend
npm install
cp .env.example .env
```
*(The backend runs out-of-the-box in local seeded store mode. To connect to Supabase Cloud, add your `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to `backend/.env`).*
*(Copy `backend/.env.example` to `backend/.env` for local setup. Before deployment, configure a unique `JWT_SECRET` and a 32-byte `EVIDENCE_ENCRYPTION_KEY`; never commit `.env` or production credentials.)*

### 2. Set Up Frontend
```bash
cd ../frontend
npm install
```

### 3. Run the Applications
In terminal 1 (Backend):
```bash
cd backend
npm start
# Server starts at http://localhost:5000
```

In terminal 2 (Frontend):
```bash
cd frontend
npm run dev
# Application opens at http://localhost:5173
```

---

## 7. Pre-Seeded Test Accounts

> **Deployment note:** The current service layer uses the seeded in-memory store in `backend/models/store.js`; application data resets when the backend restarts. Supabase credentials alone do not make all modules persistent. Before using real users or deploying, complete and verify the database repository integration, email-based password recovery, and production secret/storage setup.

You can log in to test all 10 roles using the password **`Password123!`**, or click the **One-Click Role Evaluator** buttons directly on the Login page:

| Role | Email | Dashboard Route |
| :--- | :--- | :--- |
| **Super Admin** | `admin@teentalk.org` | `/dashboard/admin` |
| **Teen Learner** | `teen@teentalk.org` | `/dashboard/teen` |
| **Parent / Guardian** | `adult@teentalk.org` | `/dashboard/adult` |
| **School Administrator** | `school@teentalk.org` | `/dashboard/school` |
| **Employee / Intern** | `employee@teentalk.org` | `/dashboard/employee` |
| **HR / POSH Lead** | `hr@teentalk.org` | `/dashboard/hr` |
| **Counselor** | `counselor@teentalk.org` | `/dashboard/counselor` |
| **Child Welfare NGO** | `ngo@teentalk.org` | `/dashboard/support` |
| **Content Manager** | `content@teentalk.org` | `/dashboard/admin` |
| **Compliance Auditor** | `auditor@teentalk.org` | `/dashboard/admin` |

---

## 8. Running Automated Verification Tests

TeenTalk includes a self-contained test runner with 18 checks covering authentication, role access, case tracking, evidence security, notes, learning, and safety flows:

```bash
cd backend
npm test
```

### Test Suite Output:
- `TT-AUTH-01`: Register with valid details -> **PASSED**
- `TT-AUTH-02`: Login with wrong password -> **PASSED**
- `TT-RBAC-01`: Teen attempts to open admin API -> **PASSED**
- `TT-TEEN-01`: Teen completes a safety module -> **PASSED**
- `TT-SCHOOL-01`: School Admin views students -> **PASSED**
- `TT-COMP-01`: Employee submits confidential complaint -> **PASSED**
- `TT-COMP-01B`: Public case lookup requires the tracking token -> **PASSED**
- `TT-COMP-02`: Unsupported evidence file (.exe) is rejected -> **PASSED**
- `TT-COMP-03`: Evidence upload requires an authorized account or tracking code -> **PASSED**
- `TT-COMP-04`: Evidence encryption and authorized download -> **PASSED**
- `TT-HR-01`: HR changes case status -> **PASSED**
- `TT-HR-02`: HR records an internal case note -> **PASSED**
- `TT-COUNSELOR-01`: Counselor records a private note for an authorized case -> **PASSED**
- `TT-COUNSELOR-02`: Counselor notes respect organization access -> **PASSED**
- `TT-AI-01`: User asks crisis/unsafe question -> **PASSED**
- `TT-QUIZ-01`: User submits quiz evaluation -> **PASSED**
- `TT-CERT-01`: User without passing score requests certificate -> **PASSED**
- `TT-RESP-01`: Frontend responsive layout & viewport configuration -> **PASSED**

---

## 9. Deployment Instructions

### Backend (Render / Railway / Cloud Run)
1. For real users, first replace the in-memory store with a fully integrated persistent database and move encrypted evidence to durable private object storage. The current configuration alone is not production persistence.
2. Configure `PORT`, a unique `JWT_SECRET` (at least 32 characters), a 32-byte `EVIDENCE_ENCRYPTION_KEY`, `CORS_ORIGIN`, and Supabase credentials if the persistent adapter is configured.
3. Build step: `npm install`
4. Start command: `node server.js`

### Frontend (Vercel / Netlify / Firebase Hosting)
1. Set build command: `npm run build`
2. Set output directory: `dist`
3. Configure rewrite rules to route all requests to `/index.html` (SPA routing).

---

## 10. Known Limitations & Future Scope
- **Audio/Video Tele-session WebRTC**: Counselor calendar currently coordinates sessions; real-time video can be integrated with WebRTC / Twilio.
- **Multilingual Localization**: Future releases will incorporate regional Indian languages (Hindi, Marathi, Tamil, Bengali) to expand rural accessibility.
- **Push Notifications**: Emergency alert push notifications can be enabled via Firebase Cloud Messaging (FCM).
