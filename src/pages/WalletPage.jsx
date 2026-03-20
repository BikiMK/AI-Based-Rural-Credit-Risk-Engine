import React, { useState } from 'react'
import { useApp } from '../App'
import {
  Wallet, ArrowDownCircle, ArrowUpCircle, PlusCircle, TrendingUp,
  Coins, CreditCard, RefreshCw, ChevronLeft, ChevronRight
} from 'lucide-react'

const TX_TYPES = {
  'Deposit':          { color:'var(--success)', sign:'+', icon: ArrowDownCircle },
  'Withdraw':         { color:'var(--danger)',  sign:'-', icon: ArrowUpCircle },
  'Buy Silver':       { color:'var(--warning)', sign:'-', icon: Coins },
  'Sell Silver':      { color:'var(--success)', sign:'+', icon: Coins },
  'Loan Repayment':   { color:'var(--danger)',  sign:'-', icon: RefreshCw },
  'Loan Disbursed':   { color:'var(--success)', sign:'+', icon: CreditCard },
}

const FILTERS = ['All', 'Credits', 'Debits', 'Silver', 'Loans']
const PAGE_SIZE = 10

export default function WalletPage() {
  const { session, getWallet, updateWallet } = useApp()
  const uid = session?.id
  const wallet = getWallet(uid)

  const [depositAmt, setDepositAmt] = useState('')
  const [withdrawAmt, setWithdrawAmt] = useState('')
  const [showDeposit, setShowDeposit] = useState(false)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [filter, setFilter] = useState('All')
  const [page, setPage] = useState(0)

  function handleDeposit() {
    const amt = +depositAmt
    if (!amt || amt <= 0) return
    updateWallet(uid, wallet.balance + amt, {
      id: 't' + Date.now(), type: 'Deposit',
      amount: amt, date: new Date().toISOString().split('T')[0],
      balanceAfter: wallet.balance + amt, note: 'Manual deposit'
    })
    setDepositAmt(''); setShowDeposit(false)
  }

  function handleWithdraw() {
    const amt = +withdrawAmt
    if (!amt || amt <= 0) return
    if (amt > wallet.balance) { alert('Insufficient balance.'); return }
    updateWallet(uid, wallet.balance - amt, {
      id: 't' + Date.now(), type: 'Withdraw',
      amount: -amt, date: new Date().toISOString().split('T')[0],
      balanceAfter: wallet.balance - amt, note: 'Manual withdrawal'
    })
    setWithdrawAmt(''); setShowWithdraw(false)
  }

  // Monthly stats
  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`
  const monthlyTx = wallet.transactions.filter(t => t.date?.startsWith(thisMonth))
  const monthCredit = monthlyTx.filter(t => t.amount > 0).reduce((s,t) => s + t.amount, 0)
  const monthDebit  = monthlyTx.filter(t => t.amount < 0).reduce((s,t) => s + Math.abs(t.amount), 0)
  const netFlow = monthCredit - monthDebit

  // All-time totals
  const totalIn  = wallet.transactions.filter(t => t.amount > 0).reduce((s,t) => s + t.amount, 0)
  const totalOut = wallet.transactions.filter(t => t.amount < 0).reduce((s,t) => s + Math.abs(t.amount), 0)

  // Filtered transactions
  const filtered = wallet.transactions.filter(t => {
    if (filter === 'All') return true
    if (filter === 'Credits') return t.amount > 0
    if (filter === 'Debits') return t.amount < 0
    if (filter === 'Silver') return t.type?.toLowerCase().includes('silver')
    if (filter === 'Loans') return t.type?.toLowerCase().includes('loan')
    return true
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = [...filtered].reverse().slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  function goPage(n) {
    setPage(Math.max(0, Math.min(totalPages - 1, n)))
  }

  return (
    <div>
      <div className="gold-line"/>
      <h1 className="section-title">My Wallet</h1>
      <p className="section-subtitle">Manage your funds and view transaction history</p>

      {/* Balance Card */}
      <div className="card card-gold" style={{ marginBottom:24, maxWidth:520 }}>
        <div style={{ textAlign:'center', padding:'8px 0 16px' }}>
          <div style={{ fontSize:13, color:'var(--text-muted)', marginBottom:4 }}>Available Balance</div>
          <div style={{ fontSize:52, fontFamily:'Sora', fontWeight:800, color:'var(--gold)' }}>
            {new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(wallet.balance)}
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-success" style={{ flex:1, justifyContent:'center' }} onClick={() => { setShowDeposit(s=>!s); setShowWithdraw(false) }}>
            <PlusCircle size={16}/> Add Funds
          </button>
          <button className="btn btn-secondary" style={{ flex:1, justifyContent:'center' }} onClick={() => { setShowWithdraw(s=>!s); setShowDeposit(false) }}>
            <ArrowUpCircle size={16}/> Withdraw
          </button>
        </div>

        {showDeposit && (
          <div style={{ marginTop:16, padding:16, background:'var(--bg-secondary)', borderRadius:10 }}>
            <label className="form-label">Amount to Add (₹)</label>
            <div style={{ display:'flex', gap:8 }}>
              <input className="form-input" type="number" min="1" placeholder="500" value={depositAmt} onChange={e => setDepositAmt(e.target.value)} style={{ flex:1 }}/>
              <button className="btn btn-success" onClick={handleDeposit}>Add</button>
            </div>
            <div style={{ display:'flex', gap:8, marginTop:8, flexWrap:'wrap' }}>
              {[500, 1000, 2000, 5000, 10000].map(q => (
                <button key={q} className="btn btn-secondary btn-sm" onClick={() => setDepositAmt(String(q))}>
                  ₹{q.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>
        )}
        {showWithdraw && (
          <div style={{ marginTop:16, padding:16, background:'var(--bg-secondary)', borderRadius:10 }}>
            <label className="form-label">Amount to Withdraw (₹)</label>
            <div style={{ display:'flex', gap:8 }}>
              <input className="form-input" type="number" min="1" max={wallet.balance} placeholder="500" value={withdrawAmt} onChange={e => setWithdrawAmt(e.target.value)} style={{ flex:1 }}/>
              <button className="btn btn-danger" onClick={handleWithdraw}>Withdraw</button>
            </div>
          </div>
        )}
      </div>

      {/* Monthly + All-time stats */}
      <div className="grid-3" style={{ marginBottom:24 }}>
        {[
          { label:'Credited This Month',  value: new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(monthCredit), color:'var(--success)', icon: ArrowDownCircle },
          { label:'Debited This Month',   value: new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(monthDebit),  color:'var(--danger)',  icon: ArrowUpCircle },
          {
            label:'Net Flow This Month',
            value: (netFlow >= 0 ? '+' : '') + new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(netFlow),
            color: netFlow >= 0 ? 'var(--success)' : 'var(--danger)', icon: TrendingUp
          },
        ].map(s => (
          <div key={s.label} className="card" style={{ display:'flex', gap:12, alignItems:'center' }}>
            <s.icon size={26} color={s.color}/>
            <div>
              <div style={{ fontSize:18, fontFamily:'Sora', fontWeight:700, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:12, color:'var(--text-muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Transaction History */}
      <div className="card">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:10 }}>
          <h3 style={{ fontFamily:'Sora' }}>Transaction History</h3>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {FILTERS.map(f => (
              <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => { setFilter(f); setPage(0) }}>{f}</button>
            ))}
          </div>
        </div>

        {paged.length === 0 ? (
          <div className="empty-state">
            <Wallet size={36}/><p>No transactions {filter !== 'All' ? `in "${filter}"` : 'yet'}.</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Type</th><th>Description</th><th>Date</th><th>Amount</th><th>Balance After</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((t) => {
                    const meta = TX_TYPES[t.type] || { color:'var(--text-primary)', icon: ArrowDownCircle }
                    const Icon = meta.icon
                    return (
                      <tr key={t.id}>
                        <td>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <Icon size={15} color={meta.color}/>
                            <span className="badge" style={{
                              background:`color-mix(in srgb, ${meta.color} 15%, transparent)`,
                              color: meta.color
                            }}>{t.type}</span>
                          </div>
                        </td>
                        <td style={{ color:'var(--text-secondary)', fontSize:13 }}>{t.note || '—'}</td>
                        <td style={{ color:'var(--text-muted)', fontSize:13 }}>{t.date}</td>
                        <td style={{ fontWeight:600, color: t.amount >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                          {t.amount >= 0 ? '+' : ''}
                          {new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(Math.abs(t.amount))}
                        </td>
                        <td>{new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(t.balanceAfter||0)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:16 }}>
                <span style={{ fontSize:13, color:'var(--text-muted)' }}>
                  Page {page+1} of {totalPages} ({filtered.length} transactions)
                </span>
                <div style={{ display:'flex', gap:6 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => goPage(page-1)} disabled={page === 0}>
                    <ChevronLeft size={15}/> Prev
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => goPage(page+1)} disabled={page >= totalPages-1}>
                    Next <ChevronRight size={15}/>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
