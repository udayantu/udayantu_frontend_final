# UdaYantu - Career Development Platform

## Overview
UdaYantu is a comprehensive career development platform for rural Indian graduates. It offers student registration with OTP verification, an employer portal with a 5-factor weighted candidate matching system, offer management integrated with Razorpay, and robust analytics. The platform includes features for talent pool management, outcomes tracking, and enterprise-grade trust and compliance. It supports a bilingual interface (English/Hindi) to cater to its target audience. The business vision is to streamline career development and placement for rural Indian graduates, addressing market potential by bridging the gap between talent and opportunity.

## User Preferences
- Step-by-step systematic approach ("like a pro CTO")
- Pre-review before major changes
- Clean code with removal of unused imports/state
- Bilingual support (English/Hindi) in all user-facing content

## System Architecture

### UI/UX Decisions
The platform features a 6-tab Student Dashboard (overview, readiness, assessments, interviews, transparency, profile) and an Admin Dashboard with conditional tabs based on RBAC. UI elements are designed for clarity and a Hindi-first approach, with simplified microcopy and professional badging. A Lite Mode toggle is available for low-bandwidth experiences. The employer waitlist form has been optimized for a single-column, centered design with improved responsiveness.

### Technical Implementations
-   **Frontend**: React, Vite, TypeScript, Tailwind CSS, Shadcn UI (port 5000).
-   **Backend**: Local Express server (port 3001) + Supabase (Database).
-   **Authentication**: 
    -   **Students**: OTP-based via local Express server with Supabase auth fallback.
    -   **Replit Auth**: OIDC-based authentication available via `/api/login` endpoint.
-   **Database**: PostgreSQL with Drizzle ORM for Replit Auth (users, sessions tables).
-   **State Management**: TanStack Query for server state.
-   **Forms**: React Hook Form with Zod validation.
-   **Payments**: Razorpay integration.
-   **Bilingual Support**: Implemented with a language toggle and Hindi-first microcopy.

### Feature Specifications
-   **Authentication Flows**:
    -   **Student**: Local Express server OTP (`/api/send-otp`, `/api/verify-otp`) with Supabase auth integration.
    -   **Replit Auth**: Available via `/api/login` - supports Google, GitHub, Apple, and email/password.
    -   **Employer**: LocalStorage-based OTP with email/WhatsApp fallback.
    -   **Main Admin**: Supabase with `user_roles` table and RBAC layer.
-   **Role-Based Access Control (RBAC)**: Implemented for Main Admin with 8 defined roles (Main Admin, Customer Success, Student Success, Content Expert, Data Analyst/BI, Compliance Officer, Mentor/Trainer, Support Agent). Features include user provisioning, invite/suspend controls, device trust, access expiry, and an immutable audit log. PII masking is applied based on roles.
-   **Unified Data Models & Event Bus**: Centralized canonical status definitions for Student, Job, and Assessment lifecycles. An event bus handles typed events with idempotent handlers and supports event replay. A centralized placement metrics service with caching ensures data consistency.
-   **Student Readiness System**: Tracks training progress, session attendance, mentor feedback, and SS-managed interview schedules. Readiness is computed server-side via Supabase Edge Functions, verifying payment status and enabling a "ready packet" emission flow.
-   **Auth Systems Alignment**: Authentication flows for Student, Main Admin, and Employer are separated and use unique storage key namespacing (`udayantu_` prefixes) to prevent collisions. Route protection is properly isolated for each user type's dashboard.
-   **Communication & Handoff System** (Demo/Prototype - uses localStorage):
    -   **Notification Router**: Role-gated message routing that enforces SS/CS mediation. Student messages → SS, Employer messages → CS, Admin receives summaries only. Direct student↔employer paths are blocked.
    -   **Template Library**: 16+ bilingual (Hindi/English) notification templates for WhatsApp, Email, SMS, and in-app channels. All templates are low-bandwidth optimized.
    -   **Handoff Packets**: Three standardized packet types for role-to-role handoffs:
        -   Candidate Ready Packet (SS→CS/Admin): resume, verified scores, clips, attendance, mentor summary
        -   Interview Outcome Packet (CS→SS/Admin): feedback, reskill tags, next steps
        -   Assessment Result Packet (Content→SS/Admin): breakdown, flags, practice plan
    -   **Event Bus**: Typed notification events with subscriber pattern for dashboard updates and cross-module coordination.
    -   **Note**: Uses localStorage keys `udayantu_notification_logs`, `udayantu_handoff_packets` for demo. Production requires Supabase migration.
-   **CS Mediation Service** (Demo/Prototype - uses localStorage):
    -   **Pending Actions Queue**: All employer actions (interview scheduling, offer sending, joining confirmation) are queued for CS approval before execution. Actions include SLA deadlines (4-48 hours based on priority) and status tracking.
    -   **Escalation System**: Employers can escalate issues to CS with urgency levels. Escalations are tracked with resolution workflow.
    -   **CS Actions Dashboard**: Admin tab for CS/Admin roles to approve/reject pending actions, resolve escalations, and emit Interview Outcome Packets to SS/Admin.
    -   **Candidate Pipeline**: 5-stage pipeline (New→Shortlisted→Interview→Offered→Joined) with aging badges and SLA status indicators. Stage transitions to Interview, Offered, and Joined require CS approval.
    -   **PII Protection**: Candidate cards show masked student IDs and display names only; full contact info never exposed to employers.
    -   **Bilingual Banners**: All employer pages (Candidates, TalentPool, OfferManagement) display Hindi/English CS mediation warnings explaining that direct student contact is not permitted.
    -   **Note**: Uses localStorage keys `udayantu_cs_pending_actions`, `udayantu_cs_escalations`. Production requires Supabase tables with RLS policies.
-   **Compliance & Governance Modules** (Demo/Prototype - uses localStorage):
    -   **Consent Center**: Centralized consent management with 12-month expiry, re-consent prompts, and audit-ready JSON export. Supports data_processing, communication, analytics, and marketing consent types with Hindi-first labels.
    -   **Cookie Consent**: GDPR/CCPA compliant cookie consent with essential/analytics/marketing/functional categories, language toggle, and audit logging.
    -   **Refund/PAP Engine**: Placement Assurance Program (PAP) eligibility tracking with 5-point checklist (program completion, 90% attendance, assessments passed, professional conduct, 90-day placement period). Includes appeal workflow and 14-day SLA tracker.
    -   **Data Privacy Requests**: GDPR-compliant data export/delete request workflow with role-based approvals (Admin-only for processing). 30-day SLA tracking.
    -   **Compliance Tickets**: Ticket system for SS/CS roles to manage refund requests, data requests, consent inquiries, and PAP appeals with priority levels and SLA monitoring.
    -   **Note**: Current implementation uses localStorage for demo purposes. Future migration to Supabase tables required for cross-user workflows and persistent data. Key storage keys: `udayantu_consent_preferences`, `udayantu_refund_cases`, `udayantu_compliance_tickets`, `udayantu_data_requests`.

### System Design Choices
-   **Modularity**: Clear separation of concerns with distinct modules for RBAC, authentication, and data models.
-   **Scalability**: Leverages Supabase for backend services, including Edge Functions for server-side logic and OTP.
-   **Data Consistency**: Canonical status definitions and an event bus ensure consistent data across the platform.
-   **Security**: RBAC with PII masking, immutable audit logs, and planned backend enforcement with Supabase RLS policies and server-side OTP.

## External Dependencies
-   **Supabase**: Authentication, Database, Edge Functions.
-   **Razorpay**: Payment gateway for offer management.
-   **WhatsApp**: Used for reminders and potentially OTP fallback in employer authentication.

## Recent Changes (January 2026)

### Replit Auth Integration
1. **Added Replit Auth**: Integrated OIDC-based authentication via `/api/login` endpoint supporting Google, GitHub, Apple, and email/password login.
2. **Database Schema**: Created `users` and `sessions` tables using Drizzle ORM for Replit Auth user management.
3. **Express Server Migration**: Converted server from JavaScript to TypeScript (`server/index.ts`) with tsx runtime.

### Architecture Changes
1. **Dual Server Setup**: Vite dev server (port 5000) with proxy to Express API server (port 3001).
2. **API Proxy**: Vite config includes proxy for `/api` routes to the Express server.
3. **Student OTP Flow**: Local Express server handles OTP endpoints with demo mode fallback.

### Admin Login & RBAC Fixes
1. **Auth.tsx Session Handling Fix**: Fixed critical bug where the OTP verification expected `credentials` but the verify-otp Edge Function returns `session` tokens. Changed to use `supabase.auth.setSession()` instead of `signInWithPassword()`.

2. **RBAC Supabase Sync**: Updated `useAdminRBAC` hook to sync with Supabase `user_roles` table. When a user with admin role logs in via Supabase Auth, the system now automatically creates a corresponding local RBAC user with `main_admin` role.

3. **AdminDashboard Integration**: The admin dashboard now properly integrates both Supabase auth (for authentication) and the local RBAC system (for fine-grained permissions and PII masking).

### Known Issues
- The Supabase Edge Functions show LSP diagnostics (not affecting runtime) as they use Deno imports.
- RBAC system uses localStorage for demo purposes - production should migrate to Supabase tables with RLS policies.
- Student OTP with Supabase may fail for synthetic emails - demo mode handles this gracefully.

## Key Files
- `server/index.ts` - Express server with Replit Auth and OTP endpoints
- `server/db.ts` - Drizzle database connection
- `server/replit_integrations/auth/` - Replit Auth module
- `shared/schema.ts` - Database schema exports
- `src/hooks/use-auth.ts` - React hook for Replit Auth
- `src/lib/api.ts` - Frontend API client for OTP endpoints
- `vite.config.ts` - Vite config with API proxy