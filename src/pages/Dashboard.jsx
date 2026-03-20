import React from 'react'
import { useApp } from '../App'
import {
  TrendingUp, FileCheck, CreditCard, Coins, Wallet, ArrowUpRight,
  Gauge, AlertTriangle, CheckCircle, Clock, XCircle
} from 'lucide-react'

function StatCard({ icon: Icon, label, value, sub, color = 'var(--gold)' }) {
  return (
    <div className="card" style={{ display:'flex', gap:16, alignItems:'center' }}>
      <div style={{
        width:48, height:48, borderRadius:12,
        background:`color-mix(in srgb, ${color} 15%, transparent)`,
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
      }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={{ fontSize:24, fontFamily:'Sora', fontWeight:700 }}>{value}</div>
        <div style={{ fontSize:13, color:'var(--text-secondary)' }}>{label}</div>
        {sub && <div style={{ fontSize:12, color:'var(--text-muted)' }}>{sub}</div>}
      </div>
    </div>
  )
}

function QuickAction({ icon: Icon, label, color, onClick }) {
  return (
    <button className="card" onClick={onClick}
      style={{ border:'1px solid var(--border-subtle)', cursor:'pointer', textAlign:'center', transition:'all 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = color}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
    >
      <div style={{
        width:44, height:44, borderRadius:12,
        background:`color-mix(in srgb, ${color} 15%, transparent)`,
        display:'flex', alignItems:'center', justifyContent:'center',
        margin:'0 auto 10px'
      }}>
        <Icon size={20} color={color}/>
      </div>
      <div style={{ fontSize:13, fontWeight:500 }}>{label}</div>
    </button>
  )
}

export default function Dashboard() {
  const { session, loans, kyc, getWallet, predictions, setPage } = useApp()
  const uid = session?.id
  const userLoans = loans.filter(l => l.userId === uid)
  const userKyc = kyc.find(k => k.userId === uid)
  const wallet = getWallet(uid)
  const pred = predictions[uid]

  const activeLoans = userLoans.filter(l => l.status === 'Approved').length
  const pendingLoans = userLoans.filter(l => l.status === 'Pending').length

  const kycBadge = userKyc
    ? userKyc.status === 'Verified'
      ? { label:'KYC Verified', color:'var(--success)', icon: CheckCircle }
      : userKyc.status === 'Pending'
        ? { label:'KYC Pending', color:'var(--warning)', icon: Clock }
        : { label:'KYC Rejected', color:'var(--danger)', icon: XCircle }
    : { label:'KYC Not Started', color:'var(--text-muted)', icon: AlertTriangle }

  const KycIcon = kycBadge.icon

  return (
    <div>
      {/* Hero */}
      <div className="card card-gold" style={{
        marginBottom:24,
        background:'linear-gradient(135deg, var(--bg-card) 0%, rgba(212,160,23,0.08) 100%)',
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
          <div>
            <div className="gold-line"/>
            <h1 style={{ fontSize:26, fontWeight:800 }}>
              Namaste, {session?.name?.split(' ')[0]} 🙏
            </h1>
            <p style={{ color:'var(--text-secondary)', marginTop:4 }}>
              Here's an overview of your financial health today.
            </p>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:12 }}>
              <KycIcon size={16} color={kycBadge.color}/>
              <span style={{ fontSize:13, color:kycBadge.color, fontWeight:500 }}>{kycBadge.label}</span>
            </div>
          </div>
          {pred && (
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:4 }}>Credit Score</div>
              <div style={{
                fontSize:52, fontFamily:'Sora', fontWeight:800,
                color: pred.risk === 'Low' ? 'var(--success)' : pred.risk === 'Medium' ? 'var(--warning)' : 'var(--danger)'
              }}>
                {pred.score}
              </div>
              <div style={{
                display:'inline-block', padding:'2px 12px', borderRadius:999, fontSize:12, fontWeight:600,
                background: pred.risk === 'Low' ? 'rgba(34,197,94,0.15)' : pred.risk === 'Medium' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                color: pred.risk === 'Low' ? 'var(--success)' : pred.risk === 'Medium' ? 'var(--warning)' : 'var(--danger)'
              }}>
                {pred.risk} Risk
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom:24 }}>
        <StatCard icon={Wallet} label="Wallet Balance" value={`₹${wallet.balance.toLocaleString('en-IN')}`} color="var(--gold)" />
        <StatCard icon={CreditCard} label="Active Loans" value={activeLoans} sub={`${pendingLoans} pending`} color="var(--info)" />
        <StatCard icon={Gauge} label="Credit Score" value={pred ? pred.score : '—'} sub={pred ? `${pred.risk} Risk` : 'Not calculated'} color={pred?.risk === 'Low' ? 'var(--success)' : 'var(--warning)'} />
        <StatCard icon={Coins} label="Silver Holding" value={pred ? `₹${pred.loanSuggestion.toLocaleString('en-IN')}` : '₹0'} sub="Suggested loan" color="var(--gold)" />
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontFamily:'Sora', fontSize:18, marginBottom:16 }}>Quick Actions</h2>
        <div className="grid-4">
          <QuickAction icon={FileCheck}   label="Verify KYC"     color="var(--info)"    onClick={() => setPage('kyc')} />
          <QuickAction icon={Gauge}       label="Check Score"    color="var(--gold)"    onClick={() => setPage('credit')} />
          <QuickAction icon={CreditCard}  label="Apply for Loan" color="var(--success)" onClick={() => setPage('loans')} />
          <QuickAction icon={Coins}       label="Buy Silver"     color="var(--warning)" onClick={() => setPage('silver')} />
        </div>
      </div>

      {/* Recent Loans */}
      {userLoans.length > 0 && (
        <div className="card">
          <div className="flex-between" style={{ marginBottom:16 }}>
            <h2 style={{ fontFamily:'Sora', fontSize:18 }}>Recent Loan Applications</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => setPage('loans')}>
              View All <ArrowUpRight size={14}/>
            </button>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Purpose</th>
                  <th>Amount</th>
                  <th>Tenure</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {userLoans.slice(0,3).map(l => (
                  <tr key={l.id}>
                    <td>{l.purpose}</td>
                    <td>₹{l.amount.toLocaleString('en-IN')}</td>
                    <td>{l.tenure} months</td>
                    <td>
                      <span className={`badge badge-${l.status==='Approved'?'success':l.status==='Rejected'?'danger':'warning'}`}>
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!pred && (
        <div className="card" style={{ textAlign:'center', padding:40, border:'1px dashed var(--border)' }}>
          <Gauge size={40} color="var(--gold)" style={{ marginBottom:12 }}/>
          <h3 style={{ fontFamily:'Sora', marginBottom:8 }}>Get Your Credit Score</h3>
          <p style={{ color:'var(--text-secondary)', marginBottom:16 }}>
            Fill in your financial details to get an AI-powered credit risk assessment.
          </p>
          <button className="btn btn-primary" onClick={() => setPage('credit')}>
            Calculate Now
          </button>
        </div>
      )}
    </div>
  )
}
