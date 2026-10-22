# IT Asset Secure Disposal Management System

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) web application designed for enterprise organizations to securely manage obsolete IT assets and track their complete disposal lifecycle—ensuring data sanitization verification, regulatory compliance, and audit transparency.

---

## 1. Problem Statement

Organizations must securely dispose of obsolete IT assets while ensuring sensitive corporate data is permanently erased and regulatory environmental/compliance standards are maintained. Without a centralized management platform, tracking data sanitization logs, manager verification signatures, e-waste recycler handoffs, and destruction certificates becomes error-prone.

This platform solves the problem by maintaining an immutable digital record across the complete real-world IT asset disposal lifecycle:

`Asset Registered` → `In Use` → `Pending Disposal` → `Data Wiping Initiated` → `Data Wiping Completed` → `QA Wiping Verification` → `Disposal Approved` → `Reuse / Refurbish / Recycle / Resell / Destroy` → `Final Disposal Completed` → `Audit Record Maintained`

> **Note**: This web platform serves as a digital management, verification, evidence tracking, and governance portal. It records physical wiping and destruction operations conducted by authorized technicians and certified vendors.

---

## 2. Key Features

- **Full Lifecycle Asset Inventory**: Register hardware (Laptops, Servers, Storage Media, Desktops, Network Gear) with unique Asset IDs, brand/model specs, serial number collision prevention, and status tracking.
- **Strict Enforced State Machine**: Backend lifecycle service validates state transitions (e.g., assets cannot skip data wiping or QA verification to jump directly to disposal).
- **Data Sanitization & Wiping Module**: Track sanitization operations (ATA Secure Erase, Cryptographic Erase, DoD 3-pass Overwrite, Degaussing), technician operator logs, and evidence references.
- **QA Wiping Verification**: Manager/Admin compliance inspection queue to audit wiping evidence before approving hardware for disposal.
- **Multi-Method Disposal Management**: Governance desk for approving E-Waste Recycling, Refurbishment, Resell, Internal Reassignment, or Physical Shredding.
- **E-Waste Recycling Workflow Engine**: Vendor tracking dashboard for pickup scheduling, material recovery tracking, and Certificate of Destruction archival.
- **Immutable Audit Trail**: Automatic audit logging for every asset state change, user action, and approval decision with timestamped timeline displays.
- **Executive Analytics Dashboard**: Real-time KPI cards, MongoDB aggregation charts (Recharts status distribution, hardware type breakdown, disposal method distribution), and live activity streams.
- **Compliance & Operations Reports Engine**: Filterable reports for Asset Disposal, Data Wiping, and Compliance Matrices with instant CSV exports and print-ready CSS formatting.
- **Role-Based Access Control (RBAC)**: Fine-grained authorization enforcing permissions across `ADMIN`, `IT_STAFF`, and `MANAGER` user roles.

---

## 3. Technology Stack

### Frontend
- **Framework**: React 19 + Vite 6
- **Styling**: Tailwind CSS v4 (Sleek Slate/Cyan corporate SaaS dashboard theme)
- **State & Context**: AuthContext, ToastContext
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios with JWT interceptors

### Backend
- **Runtime**: Node.js v24
- **Framework**: Express.js
- **Database**: MongoDB (Local Instance: `mongodb://127.0.0.1:27017/it_asset_disposal`)
- **ODM**: Mongoose v8
- **Authentication**: JWT (JSON Web Tokens) with 30-day expiry
- **Password Hashing**: Bcryptjs (10-round salt)
- **Architecture**: Controllers → Services → Models → Routes + Middleware

---

## 4. Architecture & Directory Structure

```
FSD Project/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/         # StatusBadge, Modal, ConfirmDialog, Pagination, LoadingSpinner, StatCard, Timeline, Toast
│   │   ├── context/            # AuthContext, ToastContext
│   │   ├── layouts/            # DashboardLayout, Navbar, Sidebar
│   │   ├── pages/              # Login, Dashboard, Assets, AssetDetails, AssetForm, DataWiping, Verification, Disposal, Recycling, Reports, AuditLogs, UserManagement, ProfileSettings, NotFound
│   │   ├── utils/              # api.js, constants.js, formatters.js
│   │   ├── App.jsx             # React Router config with RoleGuard
│   │   ├── main.jsx
│   │   └── index.css           # Design system & scrollbar utilities
│   ├── package.json
│   └── vite.config.js
├── server/                     # Node.js + Express Backend
│   ├── config/                 # db.js (MongoDB connection)
│   ├── controllers/            # auth, asset, wiping, disposal, recycling, audit, dashboard, reports, user controllers
│   ├── middleware/             # auth.middleware.js, error.middleware.js
│   ├── models/                 # User, Asset, WipingRecord, DisposalRecord, RecyclingRecord, AuditLog schemas
│   ├── routes/                 # Express API routes
│   ├── services/               # lifecycle.service.js, audit.service.js
│   ├── seed.js                 # Seed script with demo data
│   ├── test_e2e.js             # Automated E2E verification test suite
│   ├── app.js                  # Express app setup & CORS
│   ├── server.js               # Entry point
│   ├── .env
│   └── package.json
├── .env.example
├── .gitignore
├── README.md
└── package.json                # Root concurrent scripts
```

---

## 5. User Roles & RBAC Matrix

| Feature Module | ADMIN | IT_STAFF | MANAGER |
| :--- | :---: | :---: | :---: |
| **Executive Dashboard** | Full Access | Full Access | Full Access |
| **View Asset Inventory** | Full Access | Full Access | Full Access |
| **Register & Edit Assets** | Yes | Yes | Read Only |
| **Initiate & Update Data Wiping** | Yes | Yes | Read Only |
| **QA Verify Wiping Evidence** | Yes | Read Only | Yes |
| **Create Disposal Request** | Yes | Yes | Read Only |
| **Approve/Reject Disposal** | Yes | Read Only | Yes |
| **Execute Recycling / Refurbish** | Yes | Yes | Read Only |
| **Export Compliance Reports** | Yes | Read Only | Yes |
| **User Account Provisioning** | Yes | No | No |

---

## 6. Seed Data & Demo Credentials

The database seeder pre-loads realistic IT hardware records across all lifecycle stages along with ready-to-use demo accounts:

| Role | Email | Password | Primary Responsibilities |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@disposal.org` | `Admin@123` | Full system governance, user management, audit review |
| **IT Staff** | `itstaff@disposal.org` | `Staff@123` | Asset registration, hardware wiping, recycling handoff |
| **Manager** | `manager@disposal.org` | `Manager@123` | QA wiping verification, disposal approval desk, reports |

---

## 7. Installation & Running Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB Server running locally on default port `27017`

### Step 1: Install Dependencies
From the workspace root directory, run:
```bash
cmd /c "npm run install-all"
```
Or manually in both directories:
```bash
cd server && npm install
cd ../client && npm install
```

### Step 2: Seed the Database
Populate MongoDB with demo users, hardware inventory, wiping logs, and disposal records:
```bash
cd server && npm run seed
```

### Step 3: Run Backend API Server
Start the Express server on `http://localhost:5000`:
```bash
cd server && npm run dev
```

### Step 4: Run Frontend Client
Start Vite development server on `http://localhost:5173`:
```bash
cd client && npm run dev
```

---

## 8. Verification & Automated E2E Testing

To execute the automated end-to-end verification suite covering all 15 workflow steps:
```bash
cd server && node test_e2e.js
```

---

## 9. Future Enhancements

1. Barcode / QR Code Scanner integration for handheld warehouse scanning.
2. S3 / Cloud storage integration for PDF certificate file attachments.
3. Automated email notifications when assets enter QA verification queues.
