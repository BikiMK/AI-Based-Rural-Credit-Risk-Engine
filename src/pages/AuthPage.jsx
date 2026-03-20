import React, { useState, useRef } from 'react'
import { useApp } from '../App'
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, CheckCircle, RefreshCcw, Camera, Shield } from 'lucide-react'

function genOTP() { return Math.floor(100000 + Math.random() * 900000).toString() }

export default function AuthPage() {
  const { login, users, saveUsers } = useApp()
  const [mode, setMode] = useState('login')   // login | register | otp | face
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'', confirmPassword:'', role:'user' })
  const [otp, setOtp] = useState('')
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [pendingUser, setPendingUser] = useState(null)
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [faceCaptured, setFaceCaptured] = useState(false)

  function set(k, v) { setForm(f => ({...f, [k]: v})); setError('') }

  function autoFillAdmin() {
    setForm(f => ({...f, email:'admin@gramfinance.com', password:'admin123'}))
  }

  function handleLogin(e) {
    e.preventDefault(); setError('')
    if (form.email === 'admin@gramfinance.com' && form.password === 'admin123') {
      login({ id:'admin', name:'Admin', email:'admin@gramfinance.com', role:'admin', avatar:'AD' }); return
    }
    const user = users.find(u => u.email === form.email && u.password === form.password)
    if (!user) { setError('Invalid email or password.'); return }
    login(user)
  }

  function handleRegister(e) {
    e.preventDefault(); setError('')
    if (!form.name || !form.email || !form.password) { setError('All fields are required.'); return }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return }
    if (users.find(u => u.email === form.email)) { setError('Email already registered.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    const newOtp = genOTP(); setGeneratedOtp(newOtp)
    setPendingUser({
      id: 'u' + Date.now(), name: form.name, email: form.email,
      phone: form.phone, password: form.password, role: form.role,
      avatar: form.name.split(' ').map(n=>n[0]).join('').toUpperCase(),
      occupation: 'Other', income: 0, landSize: 0, cropType: 'None',
      existingLoans: 0, paymentUsage: 'Low', createdAt: new Date().toISOString()
    })
    setMode('otp')
  }

  function handleOtp(e) {
    e.preventDefault(); setError('')
    if (otp !== generatedOtp) { setError('Incorrect OTP. Try again.'); return }
    setMode('face')
  }

  function handleFaceCapture() {
    setLoading(true)
    setTimeout(() => { setFaceCaptured(true); setLoading(false) }, 1500)
  }

  function handleFaceDone() {
    setLoading(true)
    setTimeout(() => {
      saveUsers([...users, pendingUser])
      setLoading(false)
      setSuccess('Account created! Logging you in…')
      setTimeout(() => login(pendingUser), 800)
    }, 500)
  }

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>GrāmFinance</h1>
          <p>AI-powered rural finance for Bharat</p>
        </div>

        {/* Tab toggle */}
        {(mode === 'login' || mode === 'register') && (
          <div style={{ display:'flex', background:'var(--bg-secondary)', borderRadius:10, padding:4, marginBottom:24 }}>
            {['login','register'].map(m => (
              <button key={m} className="btn"
                style={{
                  flex:1, justifyContent:'center', borderRadius:8,
                  background: mode === m ? 'var(--bg-card)' : 'transparent',
                  color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                  border: mode === m ? '1px solid var(--border-subtle)' : 'none'
                }}
                onClick={() => { setMode(m); setError('') }}
              >{m === 'login' ? 'Login' : 'Register'}</button>
            ))}
          </div>
        )}

        {error && <div style={{ padding:'10px 14px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:10, color:'var(--danger)', fontSize:14, marginBottom:16 }}>{error}</div>}
        {success && <div style={{ padding:'10px 14px', background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.3)', borderRadius:10, color:'var(--success)', fontSize:14, marginBottom:16, display:'flex', alignItems:'center', gap:8 }}><CheckCircle size={16}/>{success}</div>}

        {/* LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position:'relative' }}>
                <Mail size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
                <input className="form-input" style={{ paddingLeft:38 }} type="email" placeholder="you@example.com"
                  value={form.email} onChange={e => set('email', e.target.value)} required/>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position:'relative' }}>
                <Lock size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
                <input className="form-input" style={{ paddingLeft:38, paddingRight:38 }} type={showPass?'text':'password'}
                  placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} required/>
                <button type="button" style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer' }}
                  onClick={() => setShowPass(s=>!s)}>{showPass ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
              </div>
            </div>
            <button className="btn btn-primary btn-full btn-lg" type="submit">Login <ArrowRight size={16}/></button>
            {/* Admin shortcut */}
            <div style={{ textAlign:'center', marginTop:14 }}>
              <button type="button"
                style={{ background:'none', border:'none', cursor:'pointer', fontSize:13, color:'var(--gold)', textDecoration:'underline' }}
                onClick={autoFillAdmin}>
                🛡️ Login as Admin (demo)
              </button>
            </div>
          </form>
        )}

        {/* REGISTER */}
        {mode === 'register' && (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position:'relative' }}>
                <User size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
                <input className="form-input" style={{ paddingLeft:38 }} type="text" placeholder="Ramesh Kumar"
                  value={form.name} onChange={e => set('name', e.target.value)} required/>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position:'relative' }}>
                <Mail size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
                <input className="form-input" style={{ paddingLeft:38 }} type="email" placeholder="you@example.com"
                  value={form.email} onChange={e => set('email', e.target.value)} required/>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div style={{ position:'relative' }}>
                <Phone size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
                <input className="form-input" style={{ paddingLeft:38 }} type="tel" placeholder="+91 98765 43210"
                  value={form.phone} onChange={e => set('phone', e.target.value)}/>
              </div>
            </div>
            <div className="grid-2" style={{ gap:12 }}>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label className="form-label">Password</label>
                <input className="form-input" type="password" placeholder="Min. 6 chars"
                  value={form.password} onChange={e => set('password', e.target.value)} required/>
              </div>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label className="form-label">Confirm Password</label>
                <input className="form-input" type="password" placeholder="Repeat password"
                  value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} required/>
              </div>
            </div>
            <div className="form-group" style={{ marginTop:16 }}>
              <label className="form-label">Account Type</label>
              <select className="form-select" value={form.role} onChange={e => set('role', e.target.value)}>
                <option value="user">Borrower (User)</option>
                <option value="admin">Admin / Lender</option>
              </select>
            </div>
            <button className="btn btn-primary btn-full btn-lg" type="submit">Create Account <ArrowRight size={16}/></button>
          </form>
        )}

        {/* OTP */}
        {mode === 'otp' && (
          <div>
            <div style={{ textAlign:'center', marginBottom:24 }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:12, background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.3)', borderRadius:12, padding:'14px 24px', marginBottom:12 }}>
                <Shield size={20} color="var(--success)"/>
                <div>
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>Demo OTP (shown for testing):</div>
                  <div style={{ fontSize:30, fontWeight:800, fontFamily:'Sora', color:'var(--success)', letterSpacing:8 }}>{generatedOtp}</div>
                </div>
              </div>
              <p style={{ fontSize:13, color:'var(--text-secondary)' }}>Enter the 6-digit OTP above to verify your account</p>
            </div>
            <form onSubmit={handleOtp}>
              <div className="form-group">
                <label className="form-label">Enter OTP</label>
                <input className="form-input" type="text" maxLength={6} placeholder="6-digit code"
                  value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,''))}
                  style={{ textAlign:'center', fontSize:22, letterSpacing:8, fontFamily:'Sora', fontWeight:700 }} required/>
              </div>
              <button className="btn btn-primary btn-full btn-lg" type="submit">Verify OTP <CheckCircle size={16}/></button>
              <button type="button" className="btn btn-secondary btn-full" style={{ marginTop:8 }}
                onClick={() => { setGeneratedOtp(genOTP()); setOtp('') }}>
                <RefreshCcw size={14}/> Regenerate OTP
              </button>
            </form>
          </div>
        )}

        {/* FACE CAPTURE */}
        {mode === 'face' && (
          <div>
            <div style={{ textAlign:'center', marginBottom:20 }}>
              <h3 style={{ fontFamily:'Sora', marginBottom:4 }}>Face Verification</h3>
              <p style={{ fontSize:13, color:'var(--text-secondary)' }}>Capture your face to complete verification</p>
            </div>
            {/* Webcam-style UI box */}
            <div style={{
              width:'100%', height:200, background:'#0a1f12', border:'2px solid var(--border)',
              borderRadius:16, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              marginBottom:16, position:'relative', overflow:'hidden'
            }}>
              {!faceCaptured ? (
                <>
                  {/* Face outline guide */}
                  <div style={{
                    width:100, height:120, border:'2px dashed var(--gold)', borderRadius:'50%',
                    display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12
                  }}>
                    <User size={48} color="var(--text-muted)"/>
                  </div>
                  <div style={{ fontSize:12, color:'var(--text-muted)' }}>Position your face inside the oval</div>
                  {/* Corner brackets */}
                  {[['0','0'],['0','auto'],['auto','0'],['auto','auto']].map(([t,b],i) => (
                    <div key={i} style={{
                      position:'absolute', width:16, height:16,
                      top: t !== 'auto' ? 12 : 'auto', bottom: b !== 'auto' ? 12 : 'auto',
                      left: i < 2 ? 12 : 'auto', right: i >= 2 ? 12 : 'auto',
                      borderTop: (i===0||i===2) ? '2px solid var(--gold)' : 'none',
                      borderBottom: (i===1||i===3) ? '2px solid var(--gold)' : 'none',
                      borderLeft: (i===0||i===1) ? '2px solid var(--gold)' : 'none',
                      borderRight: (i===2||i===3) ? '2px solid var(--gold)' : 'none',
                    }}/>
                  ))}
                </>
              ) : (
                <>
                  <div style={{ fontSize:48, marginBottom:8 }}>😊</div>
                  <div style={{ color:'var(--success)', fontWeight:600, fontSize:14 }}>
                    <CheckCircle size={16} style={{ display:'inline', marginRight:6 }}/>
                    Face captured successfully
                  </div>
                </>
              )}
            </div>

            {!faceCaptured ? (
              <button className="btn btn-primary btn-full" onClick={handleFaceCapture} disabled={loading}>
                {loading
                  ? <><span className="pulse">📸</span> Capturing…</>
                  : <><Camera size={16}/> Capture Selfie</>}
              </button>
            ) : (
              <button className="btn btn-primary btn-full btn-lg" onClick={handleFaceDone} disabled={loading}>
                {loading ? 'Creating account…' : <>Continue <ArrowRight size={16}/></>}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
