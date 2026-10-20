# CareBis Prime Health — Backend API & LIMS Engine

> High-throughput Node.js & Express v5 REST API, real-time WebSocket server, and Laboratory Information Management System (LIMS) engine for **CareBis Prime Health (CareVo)**.

For the comprehensive, full-system specification covering every single domain, phase, clinical taxonomy, entity relationships, security architecture, and operational workflows, refer to:
👉 **[Master Project Documentation (README.md)](../README.md)**

---

## Quick Start (Backend)

### Prerequisites
- Node.js `>=20.19.0`
- MongoDB local instance or MongoDB Atlas URI
- npm `v10+`

### Setup & Development
```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables (.env)
cp .env.example .env

# 3. Seed baseline database records (Admin, Lab Tech, Doctor, Client, Packages, Labs)
npm run seed

# 4. Optional: Seed full catalog of individual diagnostic tests
npm run seed:tests

# 5. Start development server with live watch mode
npm run dev
```

The API will listen at `http://localhost:3000/api/v1`.

### Production Build & Tests
```bash
# Run test suite
npm run test

# Run type checking
npm run typecheck

# Build TypeScript to dist/
npm run build

# Start production server
npm run start
```

---

## Architectural Highlights

- **Framework**: Express v5 with native asynchronous error boundary support.
- **Database**: MongoDB with Mongoose v9, compound indexing, and write-only immutable audit collections.
- **Validation**: Strict schema-based request validation with Zod.
- **Security**:
  - Argon2id password hashing.
  - Dual MFA: TOTP (RFC 6238) + 6-digit Email OTP via Resend.
  - Field-Level Encryption (FLE) using AES-256-GCM for sensitive medical notes and recommendations.
  - Dual JWT token rotation with httpOnly, SameSite, Secure cookies.
  - Express security suite: Helmet, NoSQL injection sanitization, HPP parameter pollution protection, and IP rate limiting.
- **Integrations**:
  - **Paystack**: Payment initialization, checkout, and HMAC SHA-512 webhook signature verification.
  - **Resend**: Transactional HTML email alerts.
  - **Moolre SMS**: Instant SMS dispatch to Ghanaian mobile subscribers (`+233`).
  - **Socket.io**: Real-time push notifications across connected client rooms.
