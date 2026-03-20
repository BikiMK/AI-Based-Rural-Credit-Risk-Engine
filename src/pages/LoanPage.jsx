import React, { useState, useEffect } from 'react'
import { useApp } from '../App'
import {
  Calculator, CreditCard, CheckCircle, Clock, XCircle,
  ChevronDown, ChevronUp, Building, Users, Landmark, Gift, Sparkles
} from 'lucide-react'

const PURPOSES = ['Agriculture', 'Business', 'Education', 'Medical', 'Home Repair', 'Other']
const FUNDING_MODELS = [
  {
    id: 'nbfc', label: 'NBFC Partner', icon: Building,
    examples: 'Bajaj Finance • Muthoot',
    interest: 18, min: 10000, max: 500000,
    speed: 'Fast approval',
    desc: 'A licensed lending company will review and fund your loan directly.'
  },
  {
    id: 'p2p', label: 'P2P Lending', icon: Users,
    examples: 'Individual investors',
    interest: 14, min: 5000, max: 200000,
    speed: '3–5 days',
    desc: 'Your loan request will be listed for individual investors to fund.'
  },
  {
    id: 'govt', label: 'Govt Scheme', icon: Landmark,
    examples: 'PM Mudra • KCC • PM-Kisan',
    interest: 7, min: 10000, max: 1000000,
    speed: '2–4 weeks',
    desc: 'We will match you with a government subsidy scheme you qualify for.'
  },
]

function calcEMI(amount, annualRate, months) {
  if (!amount || !months) return 0
  const r = annualRate / 100 / 12
  if (r === 0) return amount / months
  return (amount * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
}

function genSchedule(amount, annualRate, months) {
  const r = annualRate / 100 / 12
  const emi = calcEMI(amount, annualRate, months)
  let balance = amount
  const rows = []
  for (let i = 1; i <= months; i++) {
    const interest = balance * r
    const principal = emi - interest
    balance = Math.max(0, balance - principal)
    rows.push({ month: i, emi, principal, interest, balance, paid: false })
  }
  return rows
}

function DisbursementModal({ loan, onClose }) {
  const [step, setStep] = useState(0)
  const txnRef = 'TXN' + Math.floor(100000000000 + Math.random() * 900000000000)
  const steps = [
    `Loan approved by lender`,
    `Generating transfer reference: ${txnRef}`,
    `Initiating UPI transfer to linked bank account`,
    `₹${loan.amount.toLocaleString('en-IN')} credited to your wallet`,
  ]
  useEffect(() => {
    steps.forEach((_, i) => {
      setTimeout(() => setStep(i + 1), (i + 1) * 1200)
    })
  }, [])
  const done = step >= steps.length

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:9999,
      display:'flex', alignItems:'center', justifyContent:'center', padding:20
    }}>
      {done && (
        <div style={{ position:'fixed', inset:0, zIndex:9998, pointerEvents:'none', overflow:'hidden' }}>
          {Array.from({length:50}).map((_,i) => (
            <div key={i} style={{
              position:'absolute',
              left: `${Math.random()*100}%`,
              top: '-20px',
              width: 8, height: 8,
              background: ['#D4A017','#22c55e','#ef4444','#3b82f6','#a855f7'][Math.floor(Math.random()*5)],
              borderRadius: Math.random() > 0.5 ? '50%' : 2,
              animation: `confettiFall ${1.5 + Math.random()*2}s ease-in forwards`,
              animationDelay: `${Math.random()*0.5}s`,
            }}/>
          ))}
        </div>
      )}
      <div className="card card-gold" style={{ maxWidth:440, width:'100%', textAlign:'center' }}>
        <div style={{ fontSize:36, marginBottom:12 }}>{done ? '🎉' : '💸'}</div>
        <h2 style={{ fontFamily:'Sora', marginBottom:4 }}>
          {done ? 'Loan Disbursed!' : 'Processing Disbursement…'}
        </h2>
        <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:24 }}>
          {done ? 'Money has been credited to your wallet.' : 'Please wait while we process your loan.'}
        </p>
        <div style={{ textAlign:'left' }}>
          {steps.map((s, i) => (
            <div key={i} style={{
              display:'flex', alignItems:'center', gap:12, padding:'12px 0',
              borderBottom: i < steps.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              opacity: step > i ? 1 : 0.3, transition:'opacity 0.4s'
            }}>
              {step > i
                ? <CheckCircle size={20} color="var(--success)"/>
                : <div style={{ width:20, height:20, borderRadius:'50%', border:'2px solid var(--border)', flexShrink:0 }}/>
              }
              <span style={{ fontSize:14, color: step > i ? 'var(--text-primary)' : 'var(--text-muted)' }}>{s}</span>
            </div>
          ))}
        </div>
        {done && (
          <button className="btn btn-primary btn-full" style={{ marginTop:20 }} onClick={onClose}>
            <CheckCircle size={16}/> Done
          </button>
        )}
      </div>
    </div>
  )
}

export default function LoanPage() {
  const { session, loans, saveLoans, getWallet, updateWallet, predictions, setPage } = useApp()
  const uid = session?.id
  const pred = predictions[uid]
  const wallet = getWallet(uid)

  const [tab, setTab] = useState('apply') // apply | history
  const [fundingModel, setFundingModel] = useState('p2p')
  const [amount, setAmount] = useState(pred?.suggestedLoan || 20000)
  const [purpose, setPurpose] = useState('Agriculture')
  const [tenure, setTenure] = useState(12)
  const [showSchedule, setShowSchedule] = useState(false)
  const [scheduleState, setScheduleState] = useState(null) // paid rows
  const [disbursing, setDisbursing] = useState(null) // loan being disbursed for animation

  const fm = FUNDING_MODELS.find(f => f.id === fundingModel)
  const rate = fm?.interest || 14
  const emi = +calcEMI(amount, rate, tenure).toFixed(2)
  const total = +(emi * tenure).toFixed(2)
  const totalInterest = +(total - amount).toFixed(2)
  const schedule = genSchedule(amount, rate, tenure)

  const myLoans = loans.filter(l => l.userId === uid)

  useEffect(() => {
    if (pred?.suggestedLoan) setAmount(pred.suggestedLoan)
  }, [pred])

  function handleApply(e) {
    e.preventDefault()
    if (!pred?.score) { alert('Please calculate your credit score first!'); setPage('credit'); return }
    const newLoan = {
      id: 'l' + Date.now(), userId: uid, userName: session.name,
      amount: +amount, purpose, tenure: +tenure, creditScore: pred.score,
      riskLevel: pred.risk, fundingModel: fm.label, interestRate: rate,
      emi, status: 'Pending', appliedAt: new Date().toISOString().split('T')[0],
      repaymentSchedule: schedule.map(r => ({...r}))
    }
    saveLoans([...loans, newLoan])
    setTab('history')
  }

  function markPaid(loanId, monthIdx) {
    saveLoans(loans.map(l => {
      if (l.id !== loanId) return l
      const upd = [...(l.repaymentSchedule || [])]
      upd[monthIdx] = { ...upd[monthIdx], paid: !upd[monthIdx].paid }
      if (!upd[monthIdx].paid) {
        // un-pay → add back to wallet
      } else {
        // pay → deduct wallet
        updateWallet(uid, wallet.balance - upd[monthIdx].emi, {
          id: 't' + Date.now(), type: 'Loan Repayment',
          amount: -upd[monthIdx].emi, date: new Date().toISOString().split('T')[0],
          balanceAfter: wallet.balance - upd[monthIdx].emi,
          note: `EMI month ${monthIdx+1} for loan #${loanId.slice(-4)}`
        })
      }
      return { ...l, repaymentSchedule: upd }
    }))
  }

  return (
    <div>
      {disbursing && (
        <DisbursementModal loan={disbursing} onClose={() => setDisbursing(null)}/>
      )}

      <div className="gold-line"/>
      <h1 className="section-title">Loan Application System</h1>
      <p className="section-subtitle">Apply for a loan using your AI credit score, or manage existing loans</p>

      <div style={{ display:'flex', gap:8, marginBottom:24 }}>
        {[['apply','Apply for Loan'],['history','My Loans']].map(([k,l]) => (
          <button key={k} className={`btn btn-sm ${tab === k ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === 'apply' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, alignItems:'start' }}>
          {/* Left: Form */}
          <div>
            {/* Credit score banner */}
            {pred && (
              <div style={{ marginBottom:16, padding:14, background:'var(--bg-secondary)', borderRadius:12, display:'flex', gap:12, alignItems:'center' }}>
                <div style={{ fontSize:32, fontFamily:'Sora', fontWeight:800, color: pred.risk==='Low'?'var(--success)':pred.risk==='Medium'?'var(--warning)':'var(--danger)' }}>{pred.score}</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600 }}>Your Credit Score</div>
                  <span className={`badge badge-${pred.risk==='Low'?'success':pred.risk==='Medium'?'warning':'danger'}`}>{pred.risk} Risk</span>
                </div>
              </div>
            )}

            <form onSubmit={handleApply}>
              <div className="card" style={{ marginBottom:16 }}>
                <h3 style={{ fontFamily:'Sora', marginBottom:16, fontSize:16 }}>Loan Details</h3>
                <div className="form-group">
                  <label className="form-label">Loan Amount (₹)</label>
                  <input className="form-input" type="number" min="1000" value={amount}
                    onChange={e => setAmount(+e.target.value)}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Purpose</label>
                  <select className="form-select" value={purpose} onChange={e => setPurpose(e.target.value)}>
                    {PURPOSES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Tenure: <strong>{tenure} months</strong></label>
                  <input type="range" min="6" max="60" step="6" value={tenure}
                    onChange={e => setTenure(+e.target.value)}
                    style={{ width:'100%', accentColor:'var(--gold)' }}/>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--text-muted)' }}>
                    <span>6 mo</span><span>60 mo</span>
                  </div>
                </div>
              </div>

              {/* Funding model selector */}
              <div className="card" style={{ marginBottom:16 }}>
                <h3 style={{ fontFamily:'Sora', marginBottom:12, fontSize:16 }}>Choose Loan Funding Model</h3>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                  {FUNDING_MODELS.map(fm => {
                    const Icon = fm.icon
                    const isSelected = fundingModel === fm.id
                    return (
                      <div key={fm.id} onClick={() => setFundingModel(fm.id)} style={{
                        padding:12, borderRadius:12, cursor:'pointer', transition:'all 0.2s',
                        border: isSelected ? '2px solid var(--gold)' : '1px solid var(--border-subtle)',
                        background: isSelected ? 'rgba(212,160,23,0.08)' : 'var(--bg-secondary)',
                        boxShadow: isSelected ? '0 0 16px rgba(212,160,23,0.2)' : 'none',
                      }}>
                        <Icon size={20} color={isSelected?'var(--gold)':'var(--text-muted)'} style={{ marginBottom:6 }}/>
                        <div style={{ fontWeight:700, fontSize:13, fontFamily:'Sora', color:isSelected?'var(--gold)':'var(--text-primary)', marginBottom:2 }}>{fm.label}</div>
                        <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:4 }}>{fm.examples}</div>
                        <div style={{ fontSize:12, color:'var(--success)', fontWeight:600 }}>{fm.interest}% p.a.</div>
                        <div style={{ fontSize:11, color:'var(--text-muted)' }}>{fm.speed}</div>
                        <div style={{ fontSize:10, color:'var(--text-muted)' }}>₹{(fm.min/1000).toFixed(0)}K–₹{(fm.max/100000).toFixed(0)}L</div>
                      </div>
                    )
                  })}
                </div>
                <p style={{ fontSize:12, color:'var(--text-secondary)', marginTop:10, padding:'8px 12px', background:'var(--bg-secondary)', borderRadius:8 }}>
                  ℹ️ {FUNDING_MODELS.find(f=>f.id===fundingModel)?.desc}
                </p>
              </div>

              <button className="btn btn-primary btn-full btn-lg" type="submit">
                <Gift size={16}/> Submit Loan Application
              </button>
            </form>
          </div>

          {/* Right: EMI calculator */}
          <div>
            <div className="card card-gold" style={{ marginBottom:16 }}>
              <h3 style={{ fontFamily:'Sora', marginBottom:16, fontSize:16 }}>
                <Calculator size={16} style={{ display:'inline', marginRight:8 }}/>
                EMI Calculator
              </h3>
              <div style={{ display:'grid', gap:10 }}>
                {[
                  { label:'Monthly EMI', value:`₹${emi.toLocaleString('en-IN', {maximumFractionDigits:0})}`, big:true },
                  { label:'Total Payment', value:`₹${total.toLocaleString('en-IN', {maximumFractionDigits:0})}` },
                  { label:'Total Interest', value:`₹${totalInterest.toLocaleString('en-IN', {maximumFractionDigits:0})}`, color:'var(--warning)' },
                  { label:'Interest Rate', value:`${rate}% p.a.` },
                  { label:'Tenure', value:`${tenure} months` },
                ].map(row => (
                  <div key={row.label} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--border-subtle)' }}>
                    <span style={{ color:'var(--text-secondary)', fontSize:13 }}>{row.label}</span>
                    <span style={{ fontWeight: row.big ? 800 : 600, fontFamily: row.big ? 'Sora' : 'inherit', fontSize: row.big ? 20 : 14, color: row.color || 'var(--text-primary)' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Repayment schedule */}
            <div className="card">
              <button type="button" className="btn btn-secondary btn-full" style={{ marginBottom:showSchedule?16:0 }}
                onClick={() => setShowSchedule(s=>!s)}>
                {showSchedule ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}
                {showSchedule ? 'Hide' : 'View'} Repayment Schedule ({tenure} months)
              </button>
              {showSchedule && (
                <div className="table-container" style={{ maxHeight:320, overflowY:'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Month</th><th>EMI</th><th>Principal</th><th>Interest</th><th>Balance</th><th>Paid</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedule.map((row, idx) => (
                        <tr key={idx} style={{ background: row.paid ? 'rgba(34,197,94,0.08)' : 'transparent' }}>
                          <td>{row.month}</td>
                          <td>₹{row.emi.toFixed(0)}</td>
                          <td style={{ color:'var(--success)', fontSize:13 }}>₹{row.principal.toFixed(0)}</td>
                          <td style={{ color:'var(--warning)', fontSize:13 }}>₹{row.interest.toFixed(0)}</td>
                          <td>₹{row.balance.toFixed(0)}</td>
                          <td>
                            <input type="checkbox" checked={row.paid} readOnly
                              style={{ accentColor:'var(--gold)', cursor:'pointer', width:15, height:15 }}/>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* My Loans tab */}
      {tab === 'history' && (
        <div>
          {myLoans.length === 0 ? (
            <div className="empty-state">
              <CreditCard size={36}/><p>No loan applications yet.</p>
              <button className="btn btn-primary" onClick={() => setTab('apply')}>Apply Now</button>
            </div>
          ) : myLoans.map(loan => {
            const schedule = loan.repaymentSchedule || genSchedule(loan.amount, loan.interestRate, loan.tenure)
            const [showSched, setShowSched] = useState(false)
            return (
              <div key={loan.id} className="card" style={{ marginBottom:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
                  <div>
                    <div style={{ fontSize:24, fontFamily:'Sora', fontWeight:800 }}>₹{loan.amount.toLocaleString('en-IN')}</div>
                    <div style={{ fontSize:13, color:'var(--text-muted)' }}>{loan.purpose} • {loan.tenure} months • {loan.fundingModel}</div>
                  </div>
                  <span className={`badge badge-${loan.status==='Approved'?'success':loan.status==='Rejected'?'danger':'warning'}`}>
                    {loan.status==='Approved'?<CheckCircle size={12}/>:loan.status==='Rejected'?<XCircle size={12}/>:<Clock size={12}/>}
                    {loan.status}
                  </span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:16 }}>
                  {[
                    { label:'Monthly EMI', value:`₹${loan.emi?.toFixed(0)||'—'}` },
                    { label:'Interest Rate', value:`${loan.interestRate}% p.a.` },
                    { label:'Applied On', value:loan.appliedAt },
                  ].map(s => (
                    <div key={s.label} style={{ background:'var(--bg-secondary)', borderRadius:8, padding:10 }}>
                      <div style={{ fontSize:11, color:'var(--text-muted)' }}>{s.label}</div>
                      <div style={{ fontWeight:600, fontSize:14 }}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {loan.status === 'Approved' && (
                  <>
                    <button type="button" className="btn btn-secondary btn-sm"
                      onClick={() => setShowSched(s=>!s)} style={{ marginBottom:showSched?12:0 }}>
                      {showSched ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
                      Repayment Schedule
                    </button>
                    {showSched && (
                      <div className="table-container" style={{ maxHeight:280, overflowY:'auto' }}>
                        <table>
                          <thead>
                            <tr><th>Month</th><th>EMI</th><th>Principal</th><th>Interest</th><th>Balance</th><th>Mark Paid</th></tr>
                          </thead>
                          <tbody>
                            {schedule.map((row, idx) => (
                              <tr key={idx} style={{ background: row.paid ? 'rgba(34,197,94,0.08)' : 'transparent' }}>
                                <td>{row.month}</td>
                                <td>₹{row.emi.toFixed(0)}</td>
                                <td style={{ color:'var(--success)', fontSize:13 }}>₹{row.principal.toFixed(0)}</td>
                                <td style={{ color:'var(--warning)', fontSize:13 }}>₹{row.interest.toFixed(0)}</td>
                                <td>₹{row.balance.toFixed(0)}</td>
                                <td>
                                  <input type="checkbox" checked={!!row.paid} onChange={() => markPaid(loan.id, idx)}
                                    style={{ accentColor:'var(--gold)', cursor:'pointer', width:15, height:15 }}/>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
                {loan.status === 'Rejected' && loan.rejectionReason && (
                  <div style={{ padding:10, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:8, fontSize:13, color:'var(--danger)' }}>
                    ✗ Rejection reason: {loan.rejectionReason}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
