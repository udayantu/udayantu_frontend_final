# 🚀 UdaYantu - Upskilling & Career Placement Platform

UdaYantu is a premium, high-conversion upskilling and career placement ecosystem designed to bridge the employability gap for rural and Tier 3-4 graduates (B.A., B.Sc., B.Com., M.A., M.Sc., M.Com.) across India. The portal connects candidates directly to global employers through role-specific training, real-time assessment trackers, and automated hiring pipelines.

---

## 🛠️ Key Technical Architecture

### 1. High-Conversion Frontend
* **Core Framework**: React 18 SPA built on **Vite** for sub-second hot-module reloading and optimized production bundles.
* **Component Library**: **shadcn/ui** primitives built with Radix UI and styled using TailwindCSS.
* **Micro-Animations**: Seamless interface transitions powered by **Framer Motion**.
* **Global Navigation & Layout**: Includes a premium responsive desktop navbar and a dedicated **Bottom Mobile Navigation Bar** tailored for smartphone viewports.

### 2. Client-Side Authentication (Firebase OTP)
* **SMS Gateway Integration**: Native integration with **Firebase Phone Authentication** providing **10,000 free monthly SMS dispatches** out-of-the-box.
* **Spam Prevention**: Utilizes Firebase's invisible reCAPTCHA verifier to prevent automated spam attempts.
* **Local Session Caching**: Features client-side local caching (`udayantu_mock_user`) to keep local sandboxes fully operational without database latency.

### 3. Realtime Supabase Database Sync
* **Synchronized Operations**: Connected to a live, real-time **Supabase PostgreSQL database** using the official client wrapper.
* **Offline Fail-safes**: Syncs with browser `localStorage` to ensure continued functionality and offline data preservation.

### 4. Admin Management Dashboard
* **Operations Control**: Features comprehensive student directories, assessment scoring, outcomes dashboards, and waitlist management.
* **Data Visualization**: Live vector donut and trend line charts for placements statistics and hiring ratios.
* **Data Portability**: Integrated CSV Import & Export handlers for candidate databases.
* **Communications Center**: Broadcast announcement wizards via SMS, Email, and WhatsApp templates.

---

## 📁 Key File Structure

```text
├── src/
│   ├── components/
│   │   ├── admin/             # Stats, Outcomes, and Directory panels
│   │   │   ├── AdminCommunications.tsx  # Campaign Broadcaster
│   │   │   ├── AdminReports.tsx         # Report Compilations
│   │   │   └── AdminEmployers.tsx       # Employer CRM directory
│   │   ├── ui/                # shadcn primitives
│   │   ├── Navbar.tsx         # Responsive Nav + Bottom Mobile Bar
│   │   └── AuthModal.tsx      # Firebase Registration & Login
│   ├── hooks/
│   │   └── useAuth.tsx        # Firebase & Local Cache Auth Sync
│   ├── lib/
│   │   └── firebase.ts        # Firebase Core & Auth Initialization
│   ├── pages/
│   │   ├── Auth.tsx           # Standalone Firebase OTP Login
│   │   ├── AdminDashboard.tsx # Operator Nav Panel
│   │   └── EmployerLogin.tsx  # Employer access portal
│   └── main.tsx               # App entry point
├── server/
│   └── index.ts               # Local Express server with Dotenv loading
├── index.html                 # Main template with #recaptcha-container
└── .env                       # Environment secrets configurations
```

---

## 🚀 Local Development Setup

Follow these steps to spin up the local development ecosystem:

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 2. Clone the Repository & Install Dependencies
```bash
git clone https://github.com/udayantu/udayantu_frontend_final.git
cd udayantu_frontend_final
npm install
```

### 3. Configure Local Credentials
Create a `.env` file at the root of your directory and add the configuration keys:

```env
# Supabase Parameters
VITE_SUPABASE_PROJECT_ID="ptlgpjixohgmhvrqfmdw"
VITE_SUPABASE_URL="https://ptlgpjixohgmhvrqfmdw.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1..."

# Firebase Phone Auth Keys
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="udayantu-db62e.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="udayantu-db62e"
VITE_FIREBASE_STORAGE_BUCKET="udayantu-db62e.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="449537517766"
VITE_FIREBASE_APP_ID="1:449537517766:web:b1a26ea..."
```

### 4. Start the Dev Server
Launch Vite and the local Express server concurrently:
```bash
npm run dev:full
```
* **Frontend**: Open [http://localhost:5001](http://localhost:5001) in your browser.
* **Express Server**: Runs on port `3001` to serve mock data fallback structures.

---

## 🧪 Testing Firebase OTP Locally (No Charges)

To verify the OTP flow without setting up payment details on your Firebase project:
1. Go to your **Firebase Console** > **Authentication** > **Sign-in method** > click **Phone**.
2. Expand **Phone numbers for testing**.
3. Add your number (e.g., `+917292858748`) and choose a verification code (e.g., `123456`).
4. Click **Save**.

You can now sign in instantly on your local site using this verification code!
