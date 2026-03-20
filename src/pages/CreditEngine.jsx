import React, { useState, useEffect, useRef } from 'react'
import { useApp } from '../App'
import { Gauge, TrendingUp, TrendingDown, Info, CheckCircle, AlertTriangle } from 'lucide-react'

// ─── Weighted Scoring Algorithm ────────────────────────────────────────────────
function calcScore({ income, occupation, landSize, existingLoans, paymentUsage }) {
  const incomeNorm = Math.min(income / 50000, 1) * 30
  const paymentScore = { Low: 5, Medium: 13, High: 20 }[paymentUsage]
  const landNorm = Math.min(landSize / 10, 1) * 15
  const loanPenalty = Math.min(existingLoans / 100000, 1) * 20
  const noLoanBonus = 20 - loanPenalty
  const occupationBonus = { Farmer: 15, 'Small Business Owner': 13, Salaried: 14, 'Daily Wage Worker': 8, Other: 10 }[occupation] || 10
  
  const rawScore = incomeNorm + paymentScore + landNorm + noLoanBonus + occupationBonus
  const score = Math.min(Math.round(rawScore), 100)
  const risk = score >= 70 ? 'Low' : score >= 45 ? 'Medium' : 'High'
  const suggestedLoan = score * 1200

  // Top 3 reasons
  let factors = []
  if (income > 30000) factors.push({ label: `Strong monthly income of ₹${income.toLocaleString('en-IN')} boosted your score by +${Math.round(incomeNorm)} pts`, positive: true, score: incomeNorm, max: 30 })
  if (paymentUsage === 'High') factors.push({ label: `Excellent digital payment history added +20 pts`, positive: true, score: 20, max: 20 })
  if (landSize > 2) factors.push({ label: `Land ownership of ${landSize} acres shows asset stability (+${Math.round(landNorm)} pts)`, positive: true, score: landNorm, max: 15 })
  if (existingLoans > 50000) factors.push({ label: `Existing loans of ₹${existingLoans.toLocaleString('en-IN')} reduced your score by -${Math.round(loanPenalty)} pts`, positive: false, score: noLoanBonus, max: 20 })
  if (occupation === 'Farmer') factors.push({ label: `Farming occupation recognized as productive (+15 pts)`, positive: true, score: 15, max: 15 })

  // Fallbacks if not enough reasons
  if (factors.length < 3 && existingLoans === 0) factors.push({ label: `Zero existing loans contributes positively to your profile (+20 pts)`, positive: true, score: 20, max: 20 })
  if (factors.length < 3 && paymentUsage === 'Medium') factors.push({ label: `Moderate digital payments added +13 pts`, positive: true, score: 13, max: 20 })
  if (factors.length < 3 && occupationBonus >= 10) factors.push({ label: `Stable occupation adds +${occupationBonus} pts`, positive: true, score: occupationBonus, max: 15 })

  factors.sort((a, b) => b.score - a.score)
  
  return { score, risk, loanSuggestion: suggestedLoan, factors: factors.slice(0, 3) }
}

// ─── Animated SVG Gauge ────────────────────────────────────────────────────────
function ScoreGauge({ score, risk }) {
  const [displayed, setDisplayed] = useState(0)
  const radius = 80
  const stroke = 14
  const cx = 100
  const cy = 100
  const circumference = Math.PI * radius  // half circle
  const offset = circumference - (displayed / 100) * circumference
  const color = risk === 'Low' ? '#22c55e' : risk === 'Medium' ? '#f59e0b' : '#ef4444'

  useEffect(() => {
    let frame
    let start = null
    const duration = 1500
    function animate(ts) {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      setDisplayed(Math.round(progress * score))
      if (progress < 1) frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [score])

  return (
    <svg width={200} height={120} className="gauge-svg">
      {/* Track */}
      <path
        d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
        fill="none"
        stroke="var(--bg-secondary)"
        strokeWidth={stroke}
        strokeLinecap="round"
      />
      {/* Fill */}
      <path
        d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${circumference}`}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.05s linear' }}
      />
      {/* Score text */}
      <text x={cx} y={cy - 8} textAnchor="middle" fontSize={38} fontWeight={800} fontFamily="Sora" fill={color}>
        {displayed}
      </text>
      <text x={cx} y={cy + 16} textAnchor="middle" fontSize={13} fill="var(--text-secondary)">
        out of 100
      </text>
    </svg>
  )
}

const INITIAL = { income: '', occupation: 'Farmer', landSize: '', cropType: 'Wheat', existingLoans: '', paymentUsage: 'Medium' }

export default function CreditEngine() {
  const { session, predictions, savePredictions, setPage } = useApp()
  const uid = session?.id
  const [form, setForm] = useState(INITIAL)
  const [result, setResult] = useState(predictions[uid] || null)
  const [loading, setLoading] = useState(false)

  function set(k, v) { setForm(f => ({...f, [k]: v})) }

  function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      const r = calcScore({
        income: +form.income,
        occupation: form.occupation,
        landSize: +form.landSize || 0,
        existingLoans: +form.existingLoans || 0,
        paymentUsage: form.paymentUsage
      })
      const final = { ...r }
      setResult(final)
      savePredictions({ ...predictions, [uid]: final })
      setLoading(false)
    }, 1200)
  }

  return (
    <div>
      <div className="gold-line"/>
      <h1 className="section-title">AI Credit Risk Engine</h1>
      <p className="section-subtitle">Get an AI-powered credit score using alternative data — no bank history needed</p>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, alignItems:'start' }}>
        {/* Input form */}
        <div className="card">
          <h3 style={{ fontFamily:'Sora', marginBottom:20 }}>Your Financial Profile</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Monthly Income (₹)</label>
              <input className="form-input" type="number" min="0" placeholder="e.g. 15000"
                value={form.income} onChange={e => set('income', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Occupation Type</label>
              <select className="form-select" value={form.occupation} onChange={e => set('occupation', e.target.value)}>
                <option>Farmer</option><option>Daily Wage Worker</option><option>Small Business Owner</option><option>Salaried</option><option>Other</option>
              </select>
            </div>
            {form.occupation === 'Farmer' && (
              <>
                <div className="form-group">
                  <label className="form-label">Land Size (acres)</label>
                  <input className="form-input" type="number" min="0" step="0.5" placeholder="e.g. 2.5"
                    value={form.landSize} onChange={e => set('landSize', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Crop Type</label>
                  <select className="form-select" value={form.cropType} onChange={e => set('cropType', e.target.value)}>
                    {['Wheat','Rice','Cotton','Sugarcane','Vegetables','Other'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </>
            )}
            <div className="form-group">
              <label className="form-label">Existing Loans (₹)</label>
              <input className="form-input" type="number" min="0" placeholder="e.g. 5000 (0 if none)"
                value={form.existingLoans} onChange={e => set('existingLoans', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Digital Payment Usage</label>
              <div style={{ display:'flex', gap:8 }}>
                {['Low','Medium','High'].map(p => (
                  <button type="button" key={p}
                    className="btn"
                    style={{
                      flex:1, justifyContent:'center',
                      background: form.paymentUsage === p ? 'var(--gold-dim)' : 'var(--bg-secondary)',
                      color: form.paymentUsage === p ? 'var(--gold)' : 'var(--text-muted)',
                      border: form.paymentUsage === p ? '1px solid rgba(212,160,23,0.4)' : '1px solid var(--border-subtle)'
                    }}
                    onClick={() => set('paymentUsage', p)}
                  >{p}</button>
                ))}
              </div>
            </div>
            <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={!form.income || loading}>
              {loading
                ? <><span className="pulse">🤖</span> Calculating…</>
                : <><Gauge size={18}/> Calculate Credit Score</>
              }
            </button>
          </form>
        </div>

        {/* Result */}
        {result ? (
          <div>
            <div className="card card-gold" style={{ textAlign:'center', marginBottom:16 }}>
              <h3 style={{ fontFamily:'Sora', marginBottom:16 }}>Your Credit Score</h3>
              <ScoreGauge score={result.score} risk={result.risk} />
              <div style={{ marginTop:8 }}>
                <span className={`badge badge-${result.risk === 'Low' ? 'success' : result.risk === 'Medium' ? 'warning' : 'danger'}`}
                  style={{ fontSize:14, padding:'6px 18px' }}>
                  {result.risk} Risk
                </span>
              </div>
              <div style={{ marginTop:16, padding:'12px 20px', background:'var(--bg-secondary)', borderRadius:10 }}>
                <div style={{ fontSize:12, color:'var(--text-muted)' }}>Suggested Loan Amount</div>
                <div style={{ fontSize:28, fontFamily:'Sora', fontWeight:700, color:'var(--gold)' }}>
                  ₹{result.loanSuggestion.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontFamily:'Sora', marginBottom:16, fontSize:16 }}>Score Breakdown (XAI)</h3>
              {result.factors.map((f, i) => (
                <div key={i} style={{ marginBottom:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4, fontSize:13 }}>
                    <span style={{ fontWeight:500 }}>{f.label}</span>
                    <span style={{ color: f.positive ? 'var(--success)' : 'var(--warning)' }}>
                      {f.score.toFixed(1)} / {f.max}
                    </span>
                  </div>
                  <div className="progress-bar-outer">
                    <div className="progress-bar-inner" style={{
                      width: `${(f.score / f.max) * 100}%`,
                      background: f.positive ? 'var(--success)' : 'var(--warning)'
                    }}/>
                  </div>
                </div>
              ))}
              <div className="divider"/>
              <button 
                className="btn btn-primary btn-full" 
                style={{ marginTop: 16 }}
                onClick={() => setPage('loans')}
              >
                Apply for this loan <TrendingUp size={16} style={{ display:'inline', marginLeft:6 }}/>
              </button>
            </div>
          </div>
        ) : (
          <div className="card" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:300, gap:12, border:'1px dashed var(--border)' }}>
            <Gauge size={48} color="var(--text-muted)"/>
            <p style={{ color:'var(--text-muted)', textAlign:'center' }}>
              Fill in your details and click "Calculate Credit Score" to see your AI-powered assessment
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
