import React, { useState } from 'react'
import { useApp } from '../App'
import {
  Shield, Users, CreditCard, FileCheck, AlertTriangle, CheckCircle,
  XCircle, Clock, TrendingUp, BarChart2, PieChart as PieIcon
} from 'lucide-react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts'

const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#3b82f6']

export default function AdminPanel() {
  const { users, loans, kyc, saveLoans, saveKyc, predictions } = useApp()
  const [activeTab, setActiveTab] = useState('overview')

  // Stats
  const totalUsers = users.length
  const loansPending = loans.filter(l => l.status === 'Pending').length
  const kycPending = kyc.filter(k => k.status === 'Pending').length
  const fraudAlerts = users.filter(u => {
    const p = predictions[u.id]
    if (p && p.score < 20) return true
    const userLoans = loans.filter(l => l.userId === u.id)
    if (userLoans.length >= 3) return true
    return false
  }).length

  // Loan status chart data
  const loanStatusData = [
    { name:'Approved', value: loans.filter(l=>l.status==='Approved').length },
    { name:'Rejected', value: loans.filter(l=>l.status==='Rejected').length },
    { name:'Pending',  value: loans.filter(l=>l.status==='Pending').length },
  ].filter(d => d.value > 0)

  // Credit score distribution
  const scoreRanges = [
    { range:'0-20', count:0 }, { range:'21-40', count:0 },
    { range:'41-60', count:0 }, { range:'61-80', count:0 }, { range:'81-100', count:0 }
  ]
  Object.values(predictions).forEach(p => {
    if (p.score <= 20) scoreRanges[0].count++
    else if (p.score <= 40) scoreRanges[1].count++
    else if (p.score <= 60) scoreRanges[2].count++
    else if (p.score <= 80) scoreRanges[3].count++
    else scoreRanges[4].count++
  })

  function approveLoan(id) {
    saveLoans(loans.map(l => l.id === id ? { ...l, status: 'Approved' } : l))
  }
  function rejectLoan(id) {
    saveLoans(loans.map(l => l.id === id ? { ...l, status: 'Rejected' } : l))
  }
  function approveKyc(id) {
    saveKyc(kyc.map(k => k.id === id ? { ...k, status: 'Verified' } : k))
  }
  function rejectKyc(id) {
    saveKyc(kyc.map(k => k.id === id ? { ...k, status: 'Rejected' } : k))
  }

  const isFraud = (uid) => {
    const p = predictions[uid]
    if (p && p.score < 20) return true
    const userLoans = loans.filter(l => l.userId === uid)
    if (userLoans.length >= 3) return true
    return false
  }

  const TABS = [
    { key:'overview', label:'Overview', icon: TrendingUp },
    { key:'users',    label:'Users',    icon: Users },
    { key:'loans',    label:'Loans',    icon: CreditCard },
    { key:'kyc',      label:'KYC',      icon: FileCheck },
    { key:'fraud',    label:'Fraud',    icon: AlertTriangle },
  ]

  return (
    <div>
      <div className="gold-line"/>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
        <Shield size={24} color="var(--gold)"/>
        <h1 className="section-title" style={{ margin:0 }}>Admin Panel</h1>
      </div>
      <p className="section-subtitle">Platform overview and management</p>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom:24 }}>
        {[
          { label:'Total Users',    value:totalUsers,  color:'var(--info)',    icon: Users },
          { label:'Loans Pending',  value:loansPending, color:'var(--warning)', icon: CreditCard },
          { label:'KYC Pending',    value:kycPending,   color:'var(--gold)',    icon: FileCheck },
          { label:'Fraud Alerts',   value:fraudAlerts,  color:'var(--danger)',  icon: AlertTriangle },
        ].map(s => (
          <div key={s.label} className="card" style={{ display:'flex', gap:14, alignItems:'center' }}>
            <div style={{ width:48, height:48, borderRadius:12, background:`color-mix(in srgb, ${s.color} 15%, transparent)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <s.icon size={22} color={s.color}/>
            </div>
            <div>
              <div style={{ fontSize:28, fontFamily:'Sora', fontWeight:800 }}>{s.value}</div>
              <div style={{ fontSize:12, color:'var(--text-secondary)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key}
            className={`btn btn-sm ${activeTab === key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab(key)}
          >
            <Icon size={14}/> {label}
          </button>
        ))}
      </div>

      {/* Overview Charts */}
      {activeTab === 'overview' && (
        <div className="grid-2">
          <div className="card">
            <h3 style={{ fontFamily:'Sora', marginBottom:16, fontSize:16 }}>Loan Status Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={loanStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({name,value})=>`${name}: ${value}`}>
                  {loanStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                </Pie>
                <Tooltip contentStyle={{ background:'var(--bg-card)', border:'1px solid var(--border-subtle)', borderRadius:8 }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <h3 style={{ fontFamily:'Sora', marginBottom:16, fontSize:16 }}>Credit Score Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={scoreRanges}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)"/>
                <XAxis dataKey="range" tick={{ fill:'var(--text-muted)', fontSize:12 }}/>
                <YAxis tick={{ fill:'var(--text-muted)', fontSize:12 }} allowDecimals={false}/>
                <Tooltip contentStyle={{ background:'var(--bg-card)', border:'1px solid var(--border-subtle)', borderRadius:8 }}/>
                <Bar dataKey="count" name="Users" fill="var(--gold)" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Users Table */}
      {activeTab === 'users' && (
        <div className="card">
          <h3 style={{ fontFamily:'Sora', marginBottom:16 }}>All Users ({users.length})</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Occupation</th><th>Credit Score</th><th>KYC Status</th><th>Fraud</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const p = predictions[u.id]
                  const k = kyc.find(k=>k.userId===u.id)
                  const fraud = isFraud(u.id)
                  return (
                    <tr key={u.id}>
                      <td style={{ fontWeight:500 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div className="avatar" style={{ width:28, height:28, fontSize:11 }}>{u.avatar}</div>
                          {u.name}
                        </div>
                      </td>
                      <td style={{ color:'var(--text-secondary)', fontSize:13 }}>{u.email}</td>
                      <td>{u.occupation}</td>
                      <td>
                        {p
                          ? <span style={{ fontWeight:700, fontFamily:'Sora', color: p.risk==='Low'?'var(--success)':p.risk==='Medium'?'var(--warning)':'var(--danger)' }}>{p.score}</span>
                          : <span style={{ color:'var(--text-muted)' }}>—</span>}
                      </td>
                      <td>
                        {k
                          ? <span className={`badge badge-${k.status==='Verified'?'success':k.status==='Rejected'?'danger':'warning'}`}>{k.status}</span>
                          : <span className="badge badge-muted">None</span>}
                      </td>
                      <td>
                        {fraud
                          ? <span className="badge badge-danger"><AlertTriangle size={12}/>Flagged</span>
                          : <span className="badge badge-success"><CheckCircle size={12}/>Clear</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Loans Table */}
      {activeTab === 'loans' && (
        <div className="card">
          <h3 style={{ fontFamily:'Sora', marginBottom:16 }}>All Loan Applications ({loans.length})</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Applicant</th><th>Amount</th><th>Purpose</th><th>Score</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loans.map(l => {
                  const u = users.find(u=>u.id===l.userId)
                  return (
                    <tr key={l.id}>
                      <td style={{ fontWeight:500 }}>{u?.name || 'Unknown'}</td>
                      <td>₹{l.amount.toLocaleString('en-IN')}</td>
                      <td style={{ color:'var(--text-secondary)', fontSize:13 }}>{l.purpose}</td>
                      <td style={{ fontWeight:600, color: l.score>=70?'var(--success)':l.score>=45?'var(--warning)':'var(--danger)' }}>{l.score}</td>
                      <td>
                        <span className={`badge badge-${l.status==='Approved'?'success':l.status==='Rejected'?'danger':'warning'}`}>
                          {l.status}
                        </span>
                      </td>
                      <td>
                        {l.status === 'Pending' && (
                          <div style={{ display:'flex', gap:6 }}>
                            <button className="btn btn-success btn-sm" onClick={() => approveLoan(l.id)}>
                              <CheckCircle size={13}/> Approve
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => rejectLoan(l.id)}>
                              <XCircle size={13}/> Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* KYC Table */}
      {activeTab === 'kyc' && (
        <div className="card">
          <h3 style={{ fontFamily:'Sora', marginBottom:16 }}>KYC Submissions ({kyc.length})</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>Aadhaar</th><th>PAN</th><th>DOB</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {kyc.map(k => (
                  <tr key={k.id}>
                    <td style={{ fontWeight:500 }}>{k.name}</td>
                    <td style={{ fontFamily:'monospace', fontSize:13 }}>{k.aadhar}</td>
                    <td style={{ fontFamily:'monospace', fontSize:13 }}>{k.pan}</td>
                    <td style={{ color:'var(--text-secondary)', fontSize:13 }}>{k.dob}</td>
                    <td>
                      <span className={`badge badge-${k.status==='Verified'?'success':k.status==='Rejected'?'danger':'warning'}`}>
                        {k.status==='Verified' ? <CheckCircle size={12}/> : k.status==='Rejected' ? <XCircle size={12}/> : <Clock size={12}/>}
                        {k.status}
                      </span>
                    </td>
                    <td>
                      {k.status === 'Pending' && (
                        <div style={{ display:'flex', gap:6 }}>
                          <button className="btn btn-success btn-sm" onClick={() => approveKyc(k.id)}>
                            <CheckCircle size={13}/> Verify
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => rejectKyc(k.id)}>
                            <XCircle size={13}/> Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fraud Detection */}
      {activeTab === 'fraud' && (
        <div className="card">
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
            <AlertTriangle size={20} color="var(--danger)"/>
            <h3 style={{ fontFamily:'Sora' }}>Fraud Detection Flags</h3>
          </div>
          <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:16 }}>
            Users with credit score &lt; 20 or 3+ loan applications are automatically flagged.
          </p>
          {users.filter(u => isFraud(u.id)).length === 0 ? (
            <div className="empty-state">
              <CheckCircle size={36} color="var(--success)"/>
              <p style={{ color:'var(--success)' }}>No fraud alerts at this time.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>User</th><th>Score</th><th>Loan Count</th><th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => isFraud(u.id)).map(u => {
                    const p = predictions[u.id]
                    const userLoans = loans.filter(l => l.userId === u.id)
                    const reasons = []
                    if (p && p.score < 20) reasons.push('Very low credit score')
                    if (userLoans.length >= 3) reasons.push('Multiple rapid applications')
                    return (
                      <tr key={u.id}>
                        <td style={{ fontWeight:500 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <AlertTriangle size={14} color="var(--danger)"/>
                            {u.name}
                          </div>
                        </td>
                        <td style={{ color:p?.score < 20 ? 'var(--danger)' : 'var(--text-primary)' }}>
                          {p?.score ?? '—'}
                        </td>
                        <td>{userLoans.length}</td>
                        <td style={{ fontSize:13, color:'var(--danger)' }}>{reasons.join(', ')}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
