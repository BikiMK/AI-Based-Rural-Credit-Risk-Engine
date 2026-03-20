import React, { useState } from 'react'
import { useApp } from '../App'
import { CreditCard, Calculator, CheckCircle, Clock, XCircle, PlusCircle } from 'lucide-react'

function calcEMI(P, annualRate, n) {
  if (!P || !n) return 0
  const r = annualRate / 12 / 100
  if (r === 0) return P / n
  return Math.round(P * r * Math.pow(1+r, n) / (Math.pow(1+r, n) - 1))
}

export default function LoanPage() {
  const { session, loans, saveLoans, predictions, getWallet, updateWallet } = useApp()
  const uid = session?.id
  const userLoans = loans.filter(l => l.userId === uid)
  const pred = predictions[uid]
  const wallet = getWallet(uid)

  const [form, setForm] = useState({ amount:'', purpose:'', tenure:'12' })
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const interestRate = pred
    ? pred.risk === 'Low' ? 10 : pred.risk === 'Medium' ? 14 : 18
    : 18

  const emi = calcEMI(+form.amount, interestRate, +form.tenure)

  function set(k, v) { setForm(f => ({...f, [k]: v})) }

  function handleApply(e) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      const newLoan = {
        id: 'l' + Date.now(),
        userId: uid,
        amount: +form.amount,
        purpose: form.purpose,
        tenure: +form.tenure,
        score: pred?.score || 0,
        status: 'Pending',
        appliedAt: new Date().toISOString(),
        emi
      }
      saveLoans([...loans, newLoan])
      setForm({ amount:'', purpose:'', tenure:'12' })
      setShowForm(false)
      setLoading(false)
    }, 1000)
  }

  function handleRepay(loan) {
    if (wallet.balance < loan.emi) { alert('Insufficient wallet balance.'); return }
    updateWallet(uid, wallet.balance - loan.emi, {
      id: 't' + Date.now(), type: 'Loan Repayment',
      amount: -loan.emi, date: new Date().toISOString().split('T')[0],
      balanceAfter: wallet.balance - loan.emi, note: `EMI for loan #${loan.id.slice(-6)}`
    })
  }

  return (
    <div>
      <div className="gold-line"/>
      <div className="flex-between" style={{ marginBottom:8 }}>
        <div>
          <h1 className="section-title">Loan Applications</h1>
          <p className="section-subtitle">Apply for loans and track your application status</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          <PlusCircle size={16}/> Apply for Loan
        </button>
      </div>

      {/* Interest rate info */}
      {pred && (
        <div style={{
          display:'flex', alignItems:'center', gap:10, marginBottom:20,
          padding:'10px 16px', background:'var(--bg-card)', border:'1px solid var(--border-subtle)',
          borderRadius:10, fontSize:13
        }}>
          <CreditCard size={16} color="var(--gold)"/>
          <span>Your credit score: <strong style={{ color:'var(--gold)' }}>{pred.score}</strong></span>
          <span style={{ color:'var(--text-muted)' }}>•</span>
          <span>Interest rate: <strong style={{ color:'var(--success)' }}>{interestRate}% p.a.</strong></span>
          <span style={{ color:'var(--text-muted)' }}>•</span>
          <span>Max loan: <strong style={{ color:'var(--gold)' }}>₹{pred.loanSuggestion.toLocaleString('en-IN')}</strong></span>
        </div>
      )}

      {/* Application form */}
      {showForm && (
        <div className="card card-gold" style={{ marginBottom:24, maxWidth:520 }}>
          <h3 style={{ fontFamily:'Sora', marginBottom:20 }}>New Loan Application</h3>
          <form onSubmit={handleApply}>
            <div className="form-group">
              <label className="form-label">Loan Amount (₹)</label>
              <input className="form-input" type="number" min="1000" max={pred?.loanSuggestion || 100000}
                placeholder="e.g. 50000" value={form.amount} onChange={e => set('amount', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Purpose</label>
              <select className="form-select" value={form.purpose} onChange={e => set('purpose', e.target.value)} required>
                <option value="">Select purpose…</option>
                {['Crop inputs','Farm equipment','Medical expenses','House repair','Education','Business expansion','Other'].map(p => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tenure</label>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {[6, 12, 18, 24, 36].map(t => (
                  <button type="button" key={t}
                    className="btn btn-sm"
                    style={{
                      background: form.tenure == t ? 'var(--gold-dim)' : 'var(--bg-secondary)',
                      color: form.tenure == t ? 'var(--gold)' : 'var(--text-muted)',
                      border: form.tenure == t ? '1px solid rgba(212,160,23,0.4)' : '1px solid var(--border-subtle)'
                    }}
                    onClick={() => set('tenure', String(t))}
                  >{t} months</button>
                ))}
              </div>
            </div>

            {/* EMI Preview */}
            {form.amount && emi > 0 && (
              <div style={{ padding:'16px', background:'var(--bg-secondary)', borderRadius:10, marginBottom:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:8 }}>
                  <span style={{ color:'var(--text-muted)' }}><Calculator size={12} style={{ display:'inline' }}/> Monthly EMI</span>
                  <span style={{ fontWeight:700, fontSize:18, fontFamily:'Sora', color:'var(--gold)' }}>₹{emi.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text-muted)' }}>
                  <span>Interest Rate</span><span>{interestRate}% p.a.</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text-muted)' }}>
                  <span>Total Repayment</span><span>₹{(emi * +form.tenure).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text-muted)' }}>
                  <span>Total Interest</span><span>₹{(emi * +form.tenure - +form.amount).toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}

            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn-primary" style={{ flex:1 }} type="submit" disabled={loading}>
                {loading ? 'Submitting…' : 'Submit Application'}
              </button>
              <button className="btn btn-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Loan History */}
      <div className="card">
        <h3 style={{ fontFamily:'Sora', marginBottom:16 }}>Your Loan History</h3>
        {userLoans.length === 0 ? (
          <div className="empty-state">
            <CreditCard size={40}/>
            <p>No loan applications yet. Apply for your first loan!</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Purpose</th>
                  <th>Amount</th>
                  <th>Tenure</th>
                  <th>EMI</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {userLoans.map(l => (
                  <tr key={l.id}>
                    <td>{l.purpose}</td>
                    <td>₹{l.amount.toLocaleString('en-IN')}</td>
                    <td>{l.tenure} mo</td>
                    <td>₹{(l.emi||0).toLocaleString('en-IN')}</td>
                    <td>{l.score}</td>
                    <td>
                      <span className={`badge badge-${l.status==='Approved'?'success':l.status==='Rejected'?'danger':'warning'}`}>
                        {l.status==='Approved' ? <CheckCircle size={12}/> : l.status==='Rejected' ? <XCircle size={12}/> : <Clock size={12}/>}
                        {l.status}
                      </span>
                    </td>
                    <td>
                      {l.status === 'Approved' && l.emi > 0 && (
                        <button className="btn btn-secondary btn-sm" onClick={() => handleRepay(l)}>
                          Pay EMI
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
