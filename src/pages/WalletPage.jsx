import React, { useState } from 'react'
import { useApp } from '../App'
import { Wallet, ArrowDownCircle, ArrowUpCircle, PlusCircle, TrendingUp } from 'lucide-react'

const TX_TYPES = {
  'Deposit':         { color:'var(--success)', sign:'+' },
  'Withdraw':        { color:'var(--danger)',  sign:'-' },
  'Buy Silver':      { color:'var(--warning)', sign:'-' },
  'Sell Silver':     { color:'var(--success)', sign:'+' },
  'Loan Repayment':  { color:'var(--danger)',  sign:'-' },
  'Loan Disbursed':  { color:'var(--success)', sign:'+' },
}

export default function WalletPage() {
  const { session, getWallet, updateWallet } = useApp()
  const uid = session?.id
  const wallet = getWallet(uid)

  const [depositAmt, setDepositAmt] = useState('')
  const [withdrawAmt, setWithdrawAmt] = useState('')
  const [showDeposit, setShowDeposit] = useState(false)
  const [showWithdraw, setShowWithdraw] = useState(false)

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

  const totalIn  = wallet.transactions.filter(t => t.amount > 0).reduce((s,t) => s + t.amount, 0)
  const totalOut = wallet.transactions.filter(t => t.amount < 0).reduce((s,t) => s + Math.abs(t.amount), 0)

  return (
    <div>
      <div className="gold-line"/>
      <h1 className="section-title">My Wallet</h1>
      <p className="section-subtitle">Manage your funds and view transaction history</p>

      {/* Balance Card */}
      <div className="card card-gold" style={{ marginBottom:24, maxWidth:480 }}>
        <div style={{ textAlign:'center', padding:'8px 0 16px' }}>
          <div style={{ fontSize:13, color:'var(--text-muted)', marginBottom:4 }}>Available Balance</div>
          <div style={{ fontSize:48, fontFamily:'Sora', fontWeight:800, color:'var(--gold)' }}>
            ₹{wallet.balance.toLocaleString('en-IN')}
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
            <div style={{ display:'flex', gap:8, marginTop:8 }}>
              {[500, 1000, 2000, 5000].map(q => (
                <button key={q} className="btn btn-secondary btn-sm" onClick={() => setDepositAmt(String(q))}>₹{q}</button>
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

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom:24 }}>
        {[
          { label:'Total Money In',  value:`₹${totalIn.toLocaleString('en-IN')}`,  color:'var(--success)', icon: ArrowDownCircle },
          { label:'Total Money Out', value:`₹${totalOut.toLocaleString('en-IN')}`, color:'var(--danger)',  icon: ArrowUpCircle },
          { label:'Transactions',    value: wallet.transactions.length,             color:'var(--gold)',    icon: TrendingUp },
        ].map(s => (
          <div key={s.label} className="card" style={{ display:'flex', gap:12, alignItems:'center' }}>
            <s.icon size={28} color={s.color}/>
            <div>
              <div style={{ fontSize:20, fontFamily:'Sora', fontWeight:700 }}>{s.value}</div>
              <div style={{ fontSize:12, color:'var(--text-muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Transaction History */}
      <div className="card">
        <h3 style={{ fontFamily:'Sora', marginBottom:16 }}>Transaction History</h3>
        {wallet.transactions.length === 0 ? (
          <div className="empty-state">
            <Wallet size={36}/><p>No transactions yet.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Note</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Balance After</th>
                </tr>
              </thead>
              <tbody>
                {wallet.transactions.map((t) => {
                  const meta = TX_TYPES[t.type] || { color:'var(--text-primary)', sign:'' }
                  return (
                    <tr key={t.id}>
                      <td>
                        <span className="badge" style={{
                          background:`color-mix(in srgb, ${meta.color} 15%, transparent)`,
                          color: meta.color
                        }}>{t.type}</span>
                      </td>
                      <td style={{ color:'var(--text-secondary)', fontSize:13 }}>{t.note || '—'}</td>
                      <td style={{ color:'var(--text-muted)', fontSize:13 }}>{t.date}</td>
                      <td style={{ fontWeight:600, color: t.amount >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                        {t.amount >= 0 ? '+' : ''}₹{Math.abs(t.amount).toLocaleString('en-IN')}
                      </td>
                      <td>₹{(t.balanceAfter||0).toLocaleString('en-IN')}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
