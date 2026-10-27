# HotelPro — Fullstack MERN Hotel Management System

HotelPro is a complete, production-grade hotel management and reservation web application built using the **MERN** stack (MongoDB, Express.js, React 18, and Node.js). 

It features an autonomous dual-engine persistence layer (connects to real MongoDB / MongoDB Atlas, or seamlessly falls back to a high-performance local embedded JSON database with zero external setup required), role-based access control, real-time suite availability checks, interactive payment simulation, printable tax invoices, guest reviews, front-desk operations with housekeeping controls, and an executive administrative analytics dashboard.

---

## 🌟 Key Features

### 1. 🏨 Guest Booking & Experience
- **Curated Suites & Rooms Showcase**: High-resolution imagery, room categories (*Standard, Deluxe, Suite, Family*), bed configurations, max occupancy, and amenity checklists.
- **Real-Time Availability Filtering**: Live date picker that excludes booked rooms for chosen check-in and check-out dates.
- **Search, Filter & Sorting**: Search by keyword or room number; filter by category and price range; sort by rate or guest rating.
- **Suite Details & Specs**: Floor space (sq ft), bed types, comprehensive amenities with icons, and verified guest reviews.
- **Interactive Reservation Workflow**: Night calculator, guest count selector, special requests field (airport shuttle, high floor, etc.), and itemized billing summary.
- **Simulated Payment Gateway**: Interactive checkout modal with Credit/Debit Cards, UPI / QR, and Pay-at-Hotel options with animated payment verification.
- **Printable Tax Invoices & Guest Folios**: Print or save PDF tax invoices featuring GSTIN, booking reference, itemized charges, and payment status badges.
- **Guest Feedback & 5-Star Reviews**: Guests can submit star ratings and detailed reviews for completed stays.

### 2. 🛎️ Front Desk & Operations
- **Arrivals & Departures Roster**: Live operational table of today's check-ins, check-outs, and in-house guests.
- **Quick One-Click Actions**: One-click **Check In**, **Check Out**, and **Folio / Invoice** viewing.
- **Interactive Housekeeping Board**: Real-time room status board with color-coded status badges (*Available, Cleaning, Maintenance*) and one-click status toggling.
- **Search & Status Filtering**: Instant search by guest name, room number, or email across all reservation statuses.

### 3. 📊 Executive Admin Dashboard & Inventory
- **Executive Analytics KPIs**: Total Paid Revenue, Occupancy Rate (%), Active Bookings, and Total Registered Accounts.
- **Visual Analytics**: Real-time reservation status distribution breakdown and suite category inventory mix charts.
- **Full Suite Inventory CRUD**:
  - Add new rooms with custom pricing, capacity, size, bed type, image URL, and amenities.
  - Edit existing room specifications with the inline **Edit Room Modal**.
  - Delete rooms with automatic active booking protection.
  - Quick toggle room status between *Available* and *Maintenance*.
- **User Role Management**: Inspect all registered accounts and promote or demote user roles between `guest`, `staff`, and `admin`.

### 4. ⚡ Instant 1-Click Demo Login
- The login portal includes a built-in **1-Click Demo Account Switcher** allowing examiners, evaluators, and reviewers to instantly test the platform under any role without manual typing:
  - **Admin**: `admin@hotelpro.demo` / `Admin123!`
  - **Staff**: `staff@hotelpro.demo` / `Staff123!`
  - **Guest**: `guest@hotelpro.demo` / `Guest123!`

---

## 🏗️ Technology Stack & Architecture

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router v6, Axios, Lucide React, React Toastify |
| **Styling** | Custom Luxury CSS, Playfair Display & DM Sans Typography, Print Media CSS |
| **Backend** | Node.js, Express.js (ES Modules), JWT, bcryptjs, CORS, Dotenv |
| **Database** | MongoDB / Mongoose **+** Autonomous Embedded File Persistence Fallback |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** v18+ (tested on Node v20/v24)
- **MongoDB** (Optional: Automatically uses local embedded engine if MongoDB is not running locally)

### Option A: Unified Fullstack Mode (Easiest)
From the project root directory:

```bash
# 1. Install dependencies for both backend and frontend
npm run install:all

# 2. Build the frontend
npm run build

# 3. Seed demo accounts and rooms
npm run seed

# 4. Start the fullstack platform
npm start
```
Open **`http://localhost:5000`** in your browser. Both the React application and the Express REST API will run together on port 5000.

---

### Option B: Dual Terminal Development Mode

#### Terminal 1 — Backend:
```bash
cd backend
npm install
npm run seed
npm run dev
```
Backend API runs on **`http://localhost:5000`**.

#### Terminal 2 — Frontend:
```bash
cd frontend
npm install
npm run dev
```
Frontend development server runs on **`http://localhost:5173`** with hot module replacement (HMR).

---

## 🔑 Demo Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@hotelpro.demo` | `Admin123!` | Executive dashboard, Room CRUD, User role management |
| **Staff** | `staff@hotelpro.demo` | `Staff123!` | Front desk arrivals, check-in/out, housekeeping board |
| **Guest** | `guest@hotelpro.demo` | `Guest123!` | Suite search, instant booking, checkout, invoices, reviews |

*(You can also use the 1-click buttons on the `/login` page to sign in automatically).*

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Create new guest account |
| `POST` | `/api/auth/login` | Public | Sign in and receive JWT token |
| `GET` | `/api/auth/me` | Protected | Fetch current user session details |
| `PUT` | `/api/auth/profile` | Protected | Update profile name and phone |

### Rooms & Inventory (`/api/rooms`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/rooms` | Public | Filter rooms by search, category, dates, and price |
| `GET` | `/api/rooms/:id` | Public | Get single room details and guest reviews |
| `POST` | `/api/rooms` | Admin | Create a new room in inventory |
| `PUT` | `/api/rooms/:id` | Admin | Update room details, pricing, and specs |
| `PATCH` | `/api/rooms/:id/status` | Staff/Admin | Update room status (*available, cleaning, maintenance*) |
| `DELETE` | `/api/rooms/:id` | Admin | Delete room (with active reservation check) |
| `GET` | `/api/rooms/:id/reviews`| Public | Fetch all customer reviews for room |
| `POST` | `/api/rooms/:id/reviews`| Guest | Post customer review and update room rating |

### Bookings & Reservations (`/api/bookings`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/bookings` | Guest | Create a new reservation with date checks |
| `GET` | `/api/bookings/mine` | Guest | Retrieve current guest's booking history |
| `GET` | `/api/bookings/:id` | Owner/Staff | Retrieve single booking for invoice / folio |
| `POST` | `/api/bookings/:id/pay` | Owner/Staff | Process simulated payment and generate TXN ID |
| `PATCH` | `/api/bookings/:id/cancel`| Owner/Admin | Cancel confirmed reservation and refund payment |
| `GET` | `/api/bookings` | Staff/Admin | List all bookings with search and status filters |
| `PATCH` | `/api/bookings/:id/status`| Staff/Admin | Update stay status (*confirmed, checked_in, checked_out*) |

### Administrative Overview (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/overview` | Admin | Revenue KPIs, occupancy rate, and status breakdown |
| `GET` | `/api/admin/users` | Admin | List all registered user accounts |
| `PATCH` | `/api/admin/users/:id/role` | Admin | Change account role (*guest, staff, admin*) |

---

## 🗄️ Database & Autonomous Engine Note

The project is built to be resilient in all testing environments:
1. **With MongoDB**: If a MongoDB instance (local or MongoDB Atlas via `MONGO_URI`) is reachable, Mongoose connects and operates standard cloud collections.
2. **Without MongoDB**: If no MongoDB daemon is running, the backend automatically switches to its built-in Autonomous JSON Engine at `backend/data/hotelpro_db.json`. All CRUD operations, joins (populate), queries, and aggregates function seamlessly and persist across restarts.

---

## 📄 License
This project is open-source under the MIT License.
