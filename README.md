# 🌾 GrāmFinance — AI Rural Finance Platform

> An AI-powered fintech web application built for rural India — providing credit scoring, KYC verification, loans, digital silver investment, and financial advisory — even without traditional bank history.

![GrāmFinance](https://img.shields.io/badge/GrāmFinance-AI%20Rural%20Finance-gold?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-purple?style=for-the-badge&logo=vite)

---

## 🚀 Live Demo

Run locally:
```bash
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| 🛡️ Admin | admin@gramfinance.com | admin123 |
| 👤 User | ramesh@example.com | pass123 |
| 👤 User | mohan@example.com | pass123 |

---

## 🧩 Features (7 Modules)

### 1. 🔐 User Authentication
- Email + password registration with **OTP verification** (shown on screen for demo)
- Face verification simulation
- Role-based access: `user` (borrower) and `admin` (lender)
- JWT-like session stored in localStorage

### 2. 📋 KYC Document Verification
- Upload Aadhaar, PAN, bank statement, and selfie
- **OCR simulation**: auto-fills extracted dummy fields with loading animation
- **Face match simulation**: "Match: 96%"
- Status flow: Pending → Verified → Rejected
- Admin approve/reject controls

### 3. 🤖 AI Credit Risk Engine *(Core Feature)*
Calculates a **0–100 credit score** using 5 alternative data points — no bank history needed:

| Factor | Weight |
|--------|--------|
| Monthly Income | 30 pts |
| Digital Payment Usage | 20 pts |
| No Existing Loans | 20 pts |
| Land Ownership | 15 pts |
| Occupation Stability | 15 pts |

- **Animated circular gauge** (0 → score on load)
- Risk badge: 🟢 Low / 🟡 Medium / 🔴 High
- Suggested loan amount (score × ₹1,200)
- **XAI (Explainable AI)** top 3 contributing factors with progress bars

### 4. 💳 Loan Application System
- Apply with amount, purpose, and tenure
- **EMI calculator**: `P × r × (1+r)^n / ((1+r)^n - 1)`
- Interest rate determined by credit score (10% / 14% / 18%)
- Loan history with status badges
- Admin approval/rejection
- EMI repayment from wallet

### 5. 🥈 Digital Silver Investment
- Simulated silver price at ₹88/g, updates every 30 seconds (±0.5%)
- Live scrolling ticker
- Buy / Sell with wallet integration
- Portfolio: grams owned, avg buy price, current value, **P&L** (color-coded)
- Recharts sparkline of last 10 prices

### 6. 💼 Wallet System
- Starting balance ₹5,000 per user
- Full transaction history (deposits, withdrawals, silver trades, loan EMIs)
- Quick-add buttons (₹500, ₹1000, ₹2000, ₹5000)
- Balance always visible in top nav bar

### 7. 🤖 GrāmBot — AI Financial Advisor
- Floating chat button (bottom right)
- **Local AI model** — 20+ intent patterns, no external API needed
- Covers: credit scoring, loans, silver, KYC, farming, small business
- Quick-reply chips
- Typing indicator animation

---

## 🛡️ Admin Panel

- **Stats**: Total Users, Loans Pending, KYC Pending, Fraud Alerts
- **Users Table**: KYC status, credit score, fraud flag per user
- **Loan Management**: Approve / Reject pending applications
- **KYC Management**: Verify / Reject document submissions
- **Fraud Detection**: Auto-flags users with score < 20 or 3+ rapid applications
- **Recharts**: Pie chart (loan status) + Bar chart (credit score distribution)

---

## 📊 Demo Data

5 pre-seeded users on first load:

| Name | Occupation | Income | Score | Risk | KYC |
|------|-----------|--------|-------|------|-----|
| Ramesh Kumar | Farmer | ₹22,000 | 74 | 🟢 Low | Verified |
| Sunita Devi | Daily wage | ₹8,000 | 38 | 🔴 High | Pending |
| Mohan Patel | Small business | ₹35,000 | 81 | 🟢 Low | Verified |
| Priya Singh | Farmer | ₹15,000 | 52 | 🟡 Medium | Verified |
| Arjun Yadav | Daily wage | ₹11,000 | 44 | 🟡 Medium | Rejected |

---

## 🎨 Design

- **Theme**: Dark earthy — Forest Green `#0D2818`, Gold `#D4A017`, Off-White `#F5F0E8`
- **Fonts**: Sora (headings) + DM Sans (body) via Google Fonts
- **Icons**: Lucide React
- **Charts**: Recharts
- **Animations**: Score gauge, page fade-in, price ticker, chat bubble slide-in

---

## 🗂️ Project Structure

```
src/
├── App.jsx              # Root, global context, seed data, routing
├── index.css            # Full design system
├── components/
│   ├── Layout.jsx       # Sidebar + topbar + profile modal
│   └── ChatBot.jsx      # Local AI chatbot (no API required)
└── pages/
    ├── AuthPage.jsx     # Login + Register + OTP
    ├── Dashboard.jsx    # Overview + quick actions
    ├── KYCPage.jsx      # 3-step KYC flow
    ├── CreditEngine.jsx # AI score gauge + XAI
    ├── LoanPage.jsx     # EMI calculator + loan history
    ├── SilverPage.jsx   # Live price + portfolio
    ├── WalletPage.jsx   # Balance + transactions
    └── AdminPanel.jsx   # Full admin dashboard
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| React 18 | UI framework |
| Vite | Build tool & dev server |
| Recharts | Data visualizations |
| Lucide React | Icon set |
| localStorage | State persistence (no backend) |
| CSS Variables | Design system |

---

## ⚙️ Installation

```bash
# Clone the repo
git clone https://github.com/BikiMK/AI-Based-Rural-Credit-Risk-Engine.git
cd "AI-Based-Rural-Credit-Risk-Engine"

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 📄 License

MIT License — free to use for educational and demo purposes.

---

*Built with ❤️ for rural Bharat 🌾*
