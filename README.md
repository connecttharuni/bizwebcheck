# BizWebCheck – Business Website Availability & Opportunity Finder

**BizWebCheck** is a full-stack, production-grade SaaS web application engineered to identify whether local businesses possess an official website, verify their DNS and live HTTP accessibility with strict SSRF protection, and help digital marketing agencies, freelancers, and sales teams turn unlisted or broken websites into profitable web development client contracts.

---

## 🌟 Key Highlights & Philosophy

1. **Strict Distinction Between Missing Listing & Website Absence**:
   - We **never** claim a business definitely does not have a website solely because a directory provider lacks a URL.
   - We categorize results into five clear statuses:
     - 🟢 **Website Found**: Official URL returned by provider and verified active via live HTTP probe.
     - 🟡 **Website Not Listed**: Provider record has no URL on file. Prime opportunity for new website design outreach.
     - 🔴 **Website Unreachable**: URL listed in directory, but server returned HTTP 4xx/5xx, failed DNS resolution, or timed out.
     - ⚪ **Unable to Verify**: Probed endpoint blocked by SSRF security guard or temporary network limitation.
     - 🔘 **Business Not Found**: No registered business entity found in the searched geographical location.
2. **Provider Abstraction Layer**:
   - Integrates **Google Places API (New)** using Text Search (`places:searchText`) with precise FieldMasking (`places.id,places.displayName,places.formattedAddress,places.primaryType,places.types,places.websiteUri,places.googleMapsUri`).
   - Seamless fallback to a **Realistic Mock Provider** if an API key is not yet provided—allowing 100% out-of-the-box evaluation without setup blockers.
3. **SSRF-Safe Website Verification**:
   - Blocks private IP ranges (RFC 1918: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), loopback (`127.0.0.0/8`, `::1`), link-local (`169.254.0.0/16`), and cloud metadata (`169.254.169.254`).
   - Validates DNS before requesting, limits response payloads to 1MB, checks every hop in redirect chains, and applies strict 6,000ms timeouts.
4. **Complete 17-Page SaaS Experience**:
   - Landing Page, Login, Registration, Forgot Password, Reset Password, User Dashboard, Single Business Search, Search Results, Bulk Search, Saved Leads CRM, Search History, Reports & Analytics, Subscription Plans, Razorpay Payment Checkout, User Profile, Admin Governance Dashboard, Privacy Policy, and Terms & Conditions.
5. **Full Commercial Subscription & Payment Integration**:
   - Tiered plans: **Free Trial** (20 searches), **Starter** (₹499/mo), **Professional** (₹999/mo), **Business** (₹1,999/mo), and **Enterprise**.
   - Integrated with **Razorpay** supporting server-side HMAC-SHA256 signature verification and webhook processing.

---

## 🏗️ Architecture & Technology Stack

```
+---------------------------------------------------------------------------------+
|                                 USER BROWSER                                    |
|  React 18 + Vite + Tailwind CSS + Lucide Icons + Responsive SaaS Dashboard UI   |
+----------------------------------------+----------------------------------------+
                                         | REST API (Axios / Bearer JWT)
                                         v
+---------------------------------------------------------------------------------+
|                             BACKEND API SERVICE                                 |
|                       Node.js + Express.js (Port 5000)                          |
|  +---------------------------------------------------------------------------+  |
|  | Middleware: Auth Guard, Role Guard (ADMIN/CUSTOMER), Quota Meter, Helmet  |  |
|  +---------------------------------------------------------------------------+  |
|  | Controllers: Auth, Search, Leads CRM, Subscriptions, Payments, Admin, Rep |  |
|  +-------------------------------------+-------------------------------------+  |
|                                        |                                        |
|             Provider Abstraction Layer | Verification Engine                    |
|             +------------------------+ | +------------------------------------+ |
|             | Google Places (New)    | | | SSRF Guard (Private IP / DNS)      | |
|             | Mock Fallback Provider | | | HTTP / HTTPS Redirect Inspector    | |
|             +------------------------+ | +------------------------------------+ |
+----------------------------------------+----------------------------------------+
              |                                            |
              v                                            v
+-----------------------------+             +-------------------------------+
|    MONGODB ATLAS / MONGODB  |             |      RAZORPAY GATEWAY         |
| Users, Subscriptions, Leads,|             | Order Creation, HMAC SHA-256  |
| History, Payments, API Logs |             | Signature Verification, Hooks |
+-----------------------------+             +-------------------------------+
```

### Stack Details
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React icons, Axios, Responsive Design.
- **Backend**: Node.js, Express.js, REST APIs, JSON Web Tokens (JWT), bcrypt.js password hashing, Helmet, Morgan, Express Rate Limit.
- **Data Layer**: MongoDB Atlas & Mongoose with an in-memory repository fallback adapter for instant zero-dependency testing.
- **Verification Engine**: Node `dns.promises`, Axios with manual redirect security validation and SSRF IP inspection.
- **Payments**: Razorpay Order Creation, HMAC-SHA256 Signature Verification, Webhooks, Subscription Activation.
- **Deployment**: Vercel/Cloudflare Pages (Frontend `vercel.json`), Render (Backend `render.yaml`, `Dockerfile`).

---

## 🔑 Demo & Test Credentials

The application includes pre-configured demo credentials with active subscriptions and sample leads:

| Role | Email | Password | Included Plan |
| :--- | :--- | :--- | :--- |
| **Demo Customer / Agency** | `demo@bizwebcheck.com` | `Demo@123456` | Professional (2,000 Searches) |
| **System Administrator** | `admin@bizwebcheck.com` | `Admin@123456` | Enterprise (50,000 Searches) |

*You can also click the 1-Click "Demo Agency" or "Admin User" buttons on the Login page!*

---

## 🚀 Quick Start Guide (Local Setup)

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v20/v24)
- **npm** or **pnpm**

### 2. Directory Structure
```
bizwebcheck/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment & DB connection
│   │   ├── controllers/     # Auth, Search, Leads, Payments, Admin, Reports
│   │   ├── middleware/      # Auth, AdminOnly, QuotaCheck, ErrorHandler
│   │   ├── models/          # Mongoose Schemas (User, Lead, Subscription, etc.)
│   │   ├── routes/          # Express Routers
│   │   ├── services/        # Provider abstraction, SSRF Verifier, Razorpay
│   │   ├── utils/           # SSRF Guard, CSV/Excel helpers, Seeder
│   │   └── server.js        # Main Express server entrypoint
│   ├── .env.example
│   ├── Dockerfile
│   ├── render.yaml
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Badges, Modals, Navbar, Footer
│   │   ├── context/         # AuthContext (JWT, user state, subscription)
│   │   ├── pages/           # All 17 production pages
│   │   ├── services/        # Axios API Client
│   │   ├── App.jsx          # Route definitions & protected guards
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── vercel.json
│   └── package.json
└── README.md
```

### 3. Run Backend API
```bash
cd backend
# 1. Environment configuration
copy .env.example .env

# 2. Start server (runs on http://localhost:5000)
node src/server.js
```
*(If `MONGODB_URI` is not configured, the backend automatically activates the in-memory fallback store with demo data).*

### 4. Run Frontend App
In a separate terminal:
```bash
cd frontend
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🧪 Testing Verification Scenarios

Try searching the following businesses in the Single Search or Bulk Search to observe all status outcomes:

1. **ABC Bakery & Confectionery (Chennai)**
   - **Result**: `Website Not Listed` (Opportunity Score: 95%)
   - **Recommendation**: Potential website development opportunity. Business lacks an official website in directory records.
2. **Domino's Pizza (Chennai)**
   - **Result**: `Website Found` (Status: Reachable, HTTP 200 OK)
   - **Official URL**: `https://www.dominos.co.in`
3. **Apollo Hospital (Coimbatore)**
   - **Result**: `Website Found` (Status: Reachable, HTTP 200 OK)
   - **Official URL**: `https://www.apollohospitals.com`
4. **Apex Digital Marketing Agency (Chennai)**
   - **Result**: `Website Unreachable` (DNS lookup failed / Expired domain)
   - **Recommendation**: Domain resolution failed. Opportunity for server recovery, DNS fix, or new website build.

---

## 💳 Razorpay Payment Integration & Testing

BizWebCheck enforces that **paid subscriptions are activated only after cryptographic server-side signature verification**.

1. **Creating Orders**:
   - Client sends `POST /api/payments/create-order` with chosen `plan` and `billingCycle`.
   - Server initializes an order with Razorpay and responds with `orderId`.
2. **Checkout Flow**:
   - The user opens Razorpay Checkout modal with options configured with key, amount, and customer details.
   - On completion, Razorpay provides `razorpay_payment_id`, `razorpay_order_id`, and `razorpay_signature`.
3. **Server Verification**:
   - Client sends tokens to `POST /api/payments/verify`.
   - Server computes:
     `HMAC-SHA256(order_id + "|" + payment_id, RAZORPAY_KEY_SECRET)`
   - Only when signatures match is the subscription upgraded in the database and search credits provisioned.
4. **Test Mode Simulation**:
   - On the `/payment` page, click **"Simulate Successful Payment & Verify Signature"** to test end-to-end upgrade workflows without entering real financial cards.

---

## 🌐 Production Deployment

### Deploying Frontend to Vercel
1. Push code to GitHub repository.
2. In Vercel, click **New Project** and select the `frontend/` directory as the root.
3. Framework Preset: **Vite**.
4. Output Directory: **`dist`**.
5. Set Environment Variable:
   - `VITE_API_URL`: Your deployed backend URL (e.g. `https://bizwebcheck-api.onrender.com`).
6. Deploy. Vercel automatically honors `vercel.json` for SPA rewrites.

### Deploying Backend to Render
1. In Render, select **New Web Service** and point to your GitHub repo's `backend/` directory.
2. Runtime: **Node.js**.
3. Build Command: `npm install`.
4. Start Command: `node src/server.js`.
5. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `CLIENT_URL`: `https://your-frontend-app.vercel.app`
   - `JWT_SECRET`: A secure random 64-character string
   - `MONGODB_URI`: Your MongoDB Atlas cluster connection string
   - `GOOGLE_PLACES_API_KEY`: Your Google Cloud Places API (New) key
   - `RAZORPAY_KEY_ID`: Your Razorpay Key ID
   - `RAZORPAY_KEY_SECRET`: Your Razorpay Key Secret

---

## 📄 License & Commercial Notice

BizWebCheck is designed for commercial deployment as a B2B SaaS. All rights reserved. Powered by Google Places API (New) with respectful field masking and responsible verification protocols.
