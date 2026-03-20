import React, { useState, useRef } from 'react'
import { useApp } from '../App'
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, CheckCircle, RefreshCcw } from 'lucide-react'

// Generate 6-digit OTP
function genOTP() { return Math.floor(100000 + Math.random() * 900000).toString() }

export default function AuthPage() {
  const { login, users, saveUsers } = useApp()
  const [mode, setMode] = useState('login')   // login | register | otp
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'user' })
  const [otp, setOtp] = useState('')
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [pendingUser, setPendingUser] = useState(null)
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const inputRef = useRef()

  function set(k, v) { setForm(f => ({...f, [k]: v})); setError('') }

  function handleLogin(e) {
    e.preventDefault()
    setError('')
    // Admin check
    if (form.email === 'admin@gramfinance.com' && form.password === 'admin123') {
      login({ id:'admin', name:'Admin', email:'admin@gramfinance.com', role:'admin', avatar:'AD' })
      return
    }
    const user = users.find(u => u.email === form.email && u.password === form.password)
    if (!user) { setError('Invalid email or password.'); return }
    login(user)
  }

  function handleRegister(e) {
    e.preventDefault()
    setError('')
    if (!form.name || !form.email || !form.password) { setError('All fields are required.'); return }
    if (users.find(u => u.email === form.email)) { setError('Email already registered.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    const newOtp = genOTP()
    setGeneratedOtp(newOtp)
    const newUser = {
      id: 'u' + Date.now(),
      name: form.name, email: form.email, password: form.password,
      role: form.role, avatar: form.name.split(' ').map(n=>n[0]).join('').toUpperCase(),
      occupation: 'Other', income: 0, landSize: 0, cropType: '', existingLoans: 0,
      paymentUsage: 'Low', createdAt: new Date().toISOString()
    }
    setPendingUser(newUser)
    setMode('otp')
  }

  function handleOtp(e) {
    e.preventDefault()
    setError('')
    if (otp !== generatedOtp) { setError('Incorrect OTP. Please try again.'); return }
    setLoading(true)
    setTimeout(() => {
      saveUsers([...users, pendingUser])
      setLoading(false)
      setSuccess('Account created! Logging in…')
      setTimeout(() => login(pendingUser), 1000)
    }, 800)
  }

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>GrāmFinance</h1>
          <p>AI-powered rural finance for Bharat</p>
        </div>

        {/* Tab toggle */}
        {mode !== 'otp' && (
          <div style={{ display:'flex', background:'var(--bg-secondary)', borderRadius:10, padding:4, marginBottom:24 }}>
            {['login','register'].map(m => (
              <button
                key={m}
                className="btn"
                style={{
                  flex:1, justifyContent:'center', borderRadius:8,
                  background: mode === m ? 'var(--bg-card)' : 'transparent',
                  color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                  border: mode === m ? '1px solid var(--border-subtle)' : 'none'
                }}
                onClick={() => { setMode(m); setError('') }}
              >
                {m === 'login' ? 'Login' : 'Register'}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div style={{
            padding:'10px 14px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)',
            borderRadius:10, color:'var(--danger)', fontSize:14, marginBottom:16
          }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{
            padding:'10px 14px', background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.3)',
            borderRadius:10, color:'var(--success)', fontSize:14, marginBottom:16,
            display:'flex', alignItems:'center', gap:8
          }}>
            <CheckCircle size={16} /> {success}
          </div>
        )}

        {/* LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position:'relative' }}>
                <Mail size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
                <input className="form-input" style={{ paddingLeft:38 }} type="email" placeholder="you@example.com"
                  value={form.email} onChange={e => set('email', e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position:'relative' }}>
                <Lock size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
                <input className="form-input" style={{ paddingLeft:38, paddingRight:38 }} type={showPass?'text':'password'}
                  placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} required />
                <button type="button" style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer' }}
                  onClick={() => setShowPass(s=>!s)}>
                  {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            <button className="btn btn-primary btn-full btn-lg" type="submit">
              Login <ArrowRight size={16}/>
            </button>
            <div style={{ textAlign:'center', marginTop:16, fontSize:13, color:'var(--text-muted)' }}>
              Demo admin: admin@gramfinance.com / admin123
            </div>
          </form>
        )}

        {/* REGISTER */}
        {mode === 'register' && (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position:'relative' }}>
                <User size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
                <input className="form-input" style={{ paddingLeft:38 }} type="text" placeholder="Ramesh Kumar"
                  value={form.name} onChange={e => set('name', e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position:'relative' }}>
                <Mail size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
                <input className="form-input" style={{ paddingLeft:38 }} type="email" placeholder="you@example.com"
                  value={form.email} onChange={e => set('email', e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position:'relative' }}>
                <Lock size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
                <input className="form-input" style={{ paddingLeft:38, paddingRight:38 }} type={showPass?'text':'password'}
                  placeholder="Min. 6 characters" value={form.password} onChange={e => set('password', e.target.value)} required />
                <button type="button" style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer' }}
                  onClick={() => setShowPass(s=>!s)}>
                  {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Account Type</label>
              <select className="form-select" value={form.role} onChange={e => set('role', e.target.value)}>
                <option value="user">Borrower (User)</option>
                <option value="admin">Admin / Lender</option>
              </select>
            </div>
            <button className="btn btn-primary btn-full btn-lg" type="submit">
              Create Account <ArrowRight size={16}/>
            </button>
          </form>
        )}

        {/* OTP */}
        {mode === 'otp' && (
          <div>
            <div style={{ textAlign:'center', marginBottom:24 }}>
              <div style={{
                display:'inline-flex', alignItems:'center', gap:8,
                background:'var(--gold-dim)', border:'1px solid rgba(212,160,23,0.3)',
                borderRadius:12, padding:'16px 24px', marginBottom:16
              }}>
                <Phone size={20} color="var(--gold)"/>
                <div>
                  <div style={{ fontSize:12, color:'var(--text-muted)' }}>Your OTP Code (demo)</div>
                  <div style={{ fontSize:28, fontWeight:800, fontFamily:'Sora', color:'var(--gold)', letterSpacing:6 }}>
                    {generatedOtp}
                  </div>
                </div>
              </div>
              <p style={{ fontSize:13, color:'var(--text-secondary)' }}>
                Enter the 6-digit OTP shown above to verify your account
              </p>
            </div>
            <form onSubmit={handleOtp}>
              <div className="form-group">
                <label className="form-label">Enter OTP</label>
                <input
                  className="form-input"
                  type="text"
                  maxLength={6}
                  placeholder="6-digit code"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g,''))}
                  style={{ textAlign:'center', fontSize:22, letterSpacing:6, fontFamily:'Sora', fontWeight:700 }}
                  required
                />
              </div>
              <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
                {loading ? <span className="spin" style={{width:18,height:18,border:'2px solid',borderColor:'currentColor transparent',borderRadius:'50%',display:'inline-block'}}/> : null}
                Verify OTP <CheckCircle size={16}/>
              </button>
              <button type="button" className="btn btn-secondary btn-full" style={{ marginTop:8 }}
                onClick={() => { setGeneratedOtp(genOTP()); setOtp('') }}>
                <RefreshCcw size={14}/> Regenerate OTP
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
