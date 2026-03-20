import React, { createContext, useContext, useState, useEffect } from 'react'
import AuthPage from './pages/AuthPage'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import KYCPage from './pages/KYCPage'
import CreditEngine from './pages/CreditEngine'
import LoanPage from './pages/LoanPage'
import SilverPage from './pages/SilverPage'
import WalletPage from './pages/WalletPage'
import AdminPanel from './pages/AdminPanel'
import ChatBot from './components/ChatBot'

// ─── Global Context ────────────────────────────────────────────────────────────
export const AppContext = createContext(null)

export function useApp() { return useContext(AppContext) }

// ─── Demo Seed Data ────────────────────────────────────────────────────────────
const DEMO_USERS = [
  {
    id: 'u1', name: 'Ramesh Kumar', email: 'ramesh@example.com', password: 'pass123',
    role: 'user', occupation: 'Farmer', income: 22000, landSize: 3, cropType: 'Wheat',
    existingLoans: 5000, paymentUsage: 'Medium', avatar: 'RK',
    createdAt: '2024-01-10T10:00:00Z'
  },
  {
    id: 'u2', name: 'Sunita Devi', email: 'sunita@example.com', password: 'pass123',
    role: 'user', occupation: 'Daily wage', income: 8000, landSize: 0, cropType: '',
    existingLoans: 10000, paymentUsage: 'Low', avatar: 'SD',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'u3', name: 'Mohan Patel', email: 'mohan@example.com', password: 'pass123',
    role: 'user', occupation: 'Small business', income: 35000, landSize: 1, cropType: '',
    existingLoans: 0, paymentUsage: 'High', avatar: 'MP',
    createdAt: '2024-01-20T10:00:00Z'
  },
  {
    id: 'u4', name: 'Priya Singh', email: 'priya@example.com', password: 'pass123',
    role: 'user', occupation: 'Farmer', income: 15000, landSize: 2, cropType: 'Rice',
    existingLoans: 8000, paymentUsage: 'Medium', avatar: 'PS',
    createdAt: '2024-02-01T10:00:00Z'
  },
  {
    id: 'u5', name: 'Arjun Yadav', email: 'arjun@example.com', password: 'pass123',
    role: 'user', occupation: 'Daily wage', income: 11000, landSize: 0, cropType: '',
    existingLoans: 3000, paymentUsage: 'Low', avatar: 'AY',
    createdAt: '2024-02-10T10:00:00Z'
  },
]

const DEMO_PREDICTIONS = {
  u1: { score: 74, risk: 'Low', loanSuggestion: 88800, reasons: ['Good monthly income', 'Moderate digital payments', 'Manageable existing loans'] },
  u2: { score: 38, risk: 'High', loanSuggestion: 45600, reasons: ['Low monthly income', 'Low digital payment usage', 'High existing loan burden'] },
  u3: { score: 81, risk: 'Low', loanSuggestion: 97200, reasons: ['High monthly income', 'High digital payment usage', 'No existing loans'] },
  u4: { score: 52, risk: 'Medium', loanSuggestion: 62400, reasons: ['Average monthly income', 'Moderate digital payments', 'Some existing loans'] },
  u5: { score: 44, risk: 'Medium', loanSuggestion: 52800, reasons: ['Below-average income', 'Low digital usage', 'Minor existing loans'] },
}

const DEMO_KYC = [
  { id: 'k1', userId: 'u1', name: 'Ramesh Kumar', dob: '1985-03-15', aadhar: '4567 8901 2345', pan: 'ABCPK1234R', status: 'Verified', submittedAt: '2024-01-11T10:00:00Z' },
  { id: 'k2', userId: 'u2', name: 'Sunita Devi',  dob: '1992-07-22', aadhar: '5678 9012 3456', pan: 'DEFQS5678T', status: 'Pending',  submittedAt: '2024-01-16T10:00:00Z' },
  { id: 'k3', userId: 'u3', name: 'Mohan Patel',  dob: '1978-11-08', aadhar: '6789 0123 4567', pan: 'GHIRT9012U', status: 'Verified', submittedAt: '2024-01-21T10:00:00Z' },
  { id: 'k4', userId: 'u4', name: 'Priya Singh',  dob: '1990-05-14', aadhar: '7890 1234 5678', pan: 'JKLVS3456V', status: 'Verified',  submittedAt: '2024-02-02T10:00:00Z' },
  { id: 'k5', userId: 'u5', name: 'Arjun Yadav',  dob: '1988-09-30', aadhar: '8901 2345 6789', pan: 'MNOPW7890W', status: 'Rejected', submittedAt: '2024-02-11T10:00:00Z' },
]

const DEMO_LOANS = [
  { id: 'l1', userId: 'u1', amount: 50000, purpose: 'Crop inputs', tenure: 12, score: 74, status: 'Approved', appliedAt: '2024-01-20T10:00:00Z', emi: 4394 },
  { id: 'l2', userId: 'u2', amount: 20000, purpose: 'Medical expenses', tenure: 6, score: 38, status: 'Rejected', appliedAt: '2024-01-25T10:00:00Z', emi: 0 },
  { id: 'l3', userId: 'u3', amount: 80000, purpose: 'Business expansion', tenure: 24, score: 81, status: 'Approved', appliedAt: '2024-01-28T10:00:00Z', emi: 3581 },
  { id: 'l4', userId: 'u4', amount: 35000, purpose: 'Farm equipment', tenure: 18, score: 52, status: 'Pending', appliedAt: '2024-02-05T10:00:00Z', emi: 2104 },
  { id: 'l5', userId: 'u5', amount: 15000, purpose: 'House repair', tenure: 12, score: 44, status: 'Pending', appliedAt: '2024-02-15T10:00:00Z', emi: 1321 },
]

const DEMO_WALLETS = {
  u1: { balance: 12500, transactions: [{ id: 't1', type: 'Deposit', amount: 12500, date: '2024-01-10', balanceAfter: 12500, note: 'Initial deposit' }] },
  u2: { balance: 5000,  transactions: [{ id: 't2', type: 'Deposit', amount: 5000,  date: '2024-01-15', balanceAfter: 5000, note: 'Initial deposit' }] },
  u3: { balance: 28000, transactions: [{ id: 't3', type: 'Deposit', amount: 28000, date: '2024-01-20', balanceAfter: 28000, note: 'Initial deposit' }] },
  u4: { balance: 7200,  transactions: [{ id: 't4', type: 'Deposit', amount: 7200,  date: '2024-02-01', balanceAfter: 7200, note: 'Initial deposit' }] },
  u5: { balance: 5000,  transactions: [{ id: 't5', type: 'Deposit', amount: 5000,  date: '2024-02-10', balanceAfter: 5000, note: 'Initial deposit' }] },
}

const DEMO_SILVER = {
  u1: { grams: 12.5, avgBuyPrice: 86, purchases: [{ grams:12.5, price:86, date:'2024-02-01' }] },
  u3: { grams: 28.4, avgBuyPrice: 85, purchases: [{ grams:28.4, price:85, date:'2024-02-10' }] },
}

function seedDemoData() {
  if (!localStorage.getItem('gramfinance_seeded')) {
    localStorage.setItem('gramfinance_users', JSON.stringify(DEMO_USERS))
    localStorage.setItem('gramfinance_predictions', JSON.stringify(DEMO_PREDICTIONS))
    localStorage.setItem('gramfinance_kyc', JSON.stringify(DEMO_KYC))
    localStorage.setItem('gramfinance_loans', JSON.stringify(DEMO_LOANS))
    localStorage.setItem('gramfinance_wallet', JSON.stringify(DEMO_WALLETS))
    localStorage.setItem('gramfinance_silver', JSON.stringify(DEMO_SILVER))
    localStorage.setItem('gramfinance_seeded', '1')
  }
}

// ─── Simple Router ─────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gramfinance_session')) } catch { return null }
  })
  const [page, setPage] = useState('dashboard')
  const [users, setUsers] = useState([])
  const [loans, setLoans] = useState([])
  const [kyc, setKyc] = useState([])
  const [wallets, setWallets] = useState({})
  const [silver, setSilver] = useState({})
  const [predictions, setPredictions] = useState({})
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gramfinance_apikey') || '')

  useEffect(() => { seedDemoData(); loadAll() }, [])

  function loadAll() {
    setUsers(JSON.parse(localStorage.getItem('gramfinance_users') || '[]'))
    setLoans(JSON.parse(localStorage.getItem('gramfinance_loans') || '[]'))
    setKyc(JSON.parse(localStorage.getItem('gramfinance_kyc') || '[]'))
    setWallets(JSON.parse(localStorage.getItem('gramfinance_wallet') || '{}'))
    setSilver(JSON.parse(localStorage.getItem('gramfinance_silver') || '{}'))
    setPredictions(JSON.parse(localStorage.getItem('gramfinance_predictions') || '{}'))
  }

  function saveUsers(u) { setUsers(u); localStorage.setItem('gramfinance_users', JSON.stringify(u)) }
  function saveLoans(l) { setLoans(l); localStorage.setItem('gramfinance_loans', JSON.stringify(l)) }
  function saveKyc(k)   { setKyc(k);   localStorage.setItem('gramfinance_kyc', JSON.stringify(k)) }
  function saveWallets(w) { setWallets(w); localStorage.setItem('gramfinance_wallet', JSON.stringify(w)) }
  function saveSilver(s)  { setSilver(s);  localStorage.setItem('gramfinance_silver', JSON.stringify(s)) }
  function savePredictions(p){ setPredictions(p); localStorage.setItem('gramfinance_predictions', JSON.stringify(p)) }

  function login(user) {
    setSession(user)
    localStorage.setItem('gramfinance_session', JSON.stringify(user))
    setPage(user.role === 'admin' ? 'admin' : 'dashboard')
  }
  function logout() {
    setSession(null)
    localStorage.removeItem('gramfinance_session')
    setPage('dashboard')
  }

  function getWallet(uid) {
    return wallets[uid] || { balance: 5000, transactions: [] }
  }
  function updateWallet(uid, newBalance, tx) {
    const prev = getWallet(uid)
    const updated = { balance: newBalance, transactions: [tx, ...prev.transactions] }
    saveWallets({ ...wallets, [uid]: updated })
  }
  function getSilver(uid) {
    return silver[uid] || { grams: 0, avgBuyPrice: 0, purchases: [] }
  }

  const ctx = {
    session, login, logout, page, setPage,
    users, saveUsers,
    loans, saveLoans,
    kyc, saveKyc,
    wallets, saveWallets, getWallet, updateWallet,
    silver, saveSilver, getSilver,
    predictions, savePredictions,
    sidebarOpen, setSidebarOpen,
    apiKey, setApiKey: (k) => { setApiKey(k); localStorage.setItem('gramfinance_apikey', k) },
    reloadAll: loadAll,
  }

  if (!session) return (
    <AppContext.Provider value={ctx}>
      <AuthPage />
    </AppContext.Provider>
  )

  const renderPage = () => {
    const isAdmin = session.role === 'admin'
    switch(page) {
      case 'dashboard':  return isAdmin ? <AdminPanel /> : <Dashboard />
      case 'admin':      return <AdminPanel />
      case 'kyc':        return <KYCPage />
      case 'credit':     return <CreditEngine />
      case 'loans':      return <LoanPage />
      case 'silver':     return <SilverPage />
      case 'wallet':     return <WalletPage />
      default:           return <Dashboard />
    }
  }

  return (
    <AppContext.Provider value={ctx}>
      <Layout>
        <div className="page-enter" key={page}>
          {renderPage()}
        </div>
      </Layout>
      <ChatBot />
    </AppContext.Provider>
  )
}
