import React, { useState } from 'react'
import { useApp } from '../App'
import {
  LayoutDashboard, FileCheck, Gauge, CreditCard, Coins, Wallet, Shield,
  Menu, X, LogOut, Bell, Settings
} from 'lucide-react'

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard',   icon: LayoutDashboard },
  { key: 'kyc',       label: 'KYC Verify',  icon: FileCheck },
  { key: 'credit',    label: 'Credit Score', icon: Gauge },
  { key: 'loans',     label: 'Loans',        icon: CreditCard },
  { key: 'silver',    label: 'Silver Invest',icon: Coins },
  { key: 'wallet',    label: 'Wallet',       icon: Wallet },
]

const ADMIN_ITEMS = [
  { key: 'admin', label: 'Admin Panel', icon: Shield },
]

export default function Layout({ children }) {
  const { session, logout, page, setPage, getWallet, sidebarOpen, setSidebarOpen, users, saveUsers, login } = useApp()
  const [showSettings, setShowSettings] = useState(false)

  const wallet = getWallet(session?.id)
  const initials = session?.avatar || session?.name?.split(' ').map(n=>n[0]).join('') || 'U'
  const avatarImg = session?.avatarBase64 || null
  const navItems = session?.role === 'admin' ? [...NAV_ITEMS, ...ADMIN_ITEMS] : NAV_ITEMS

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target.result
      const updatedUser = { ...session, avatarBase64: base64 }
      // Update global session and redirect back to current page internally via login()
      saveUsers(users.map(u => u.id === session.id ? updatedUser : u))
      login(updatedUser)
      // Restore page because login() routes to dashboard by default
      setPage(page)
    }
    reader.readAsDataURL(file)
  }

  const renderAvatarContent = () => {
    if (avatarImg) return <img src={avatarImg} alt="avatar" style={{width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%'}}/>
    return initials
  }

  return (
    <>
      {/* Sidebar overlay for mobile */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <h2>GrāmFinance</h2>
          <p>AI Rural Finance Platform</p>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Main</div>
          {navItems.slice(0, 6).map(item => {
            const Icon = item.icon
            return (
              <div
                key={item.key}
                className={`nav-item ${page === item.key ? 'active' : ''}`}
                onClick={() => { setPage(item.key); setSidebarOpen(false) }}
              >
                <Icon size={18} />
                {item.label}
              </div>
            )
          })}
          {session?.role === 'admin' && (
            <>
              <div className="nav-section-label">Administration</div>
              <div
                className={`nav-item ${page === 'admin' ? 'active' : ''}`}
                onClick={() => { setPage('admin'); setSidebarOpen(false) }}
              >
                <Shield size={18} />
                Admin Panel
              </div>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
            <div className="avatar">{renderAvatarContent()}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:14, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {session?.name}
              </div>
              <div style={{ fontSize:12, color:'var(--text-muted)' }}>{session?.role}</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-secondary btn-sm" style={{ flex:1 }} onClick={() => setShowSettings(true)}>
              <Settings size={14} /> Settings
            </button>
            <button className="btn btn-danger btn-sm" style={{ flex:1 }} onClick={logout}>
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Top bar */}
      <header className={`topbar ${sidebarOpen ? '' : ''}`}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <button
            className="btn btn-secondary btn-icon"
            style={{ display:'flex' }}
            onClick={() => setSidebarOpen(o => !o)}
          >
            <Menu size={20} />
          </button>
          <span style={{ fontFamily:'Sora', fontWeight:700, fontSize:18, color:'var(--gold)' }}>
            GrāmFinance
          </span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div className="wallet-badge">
            <Wallet size={14} />
            ₹{wallet.balance.toLocaleString('en-IN')}
          </div>
          <div className="avatar" onClick={() => setShowSettings(true)} title="Profile">
            {renderAvatarContent()}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="main-content">
        {children}
      </main>

      {/* Profile Modal */}
      {showSettings && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.6)',
          display:'flex', alignItems:'center', justifyContent:'center',
          zIndex:300, padding:20
        }}>
          <div className="card card-gold" style={{ maxWidth:380, width:'100%' }}>
            <div className="flex-between" style={{ marginBottom:20 }}>
              <h3 style={{ fontFamily:'Sora' }}>My Profile</h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setShowSettings(false)}>
                <X size={18} />
              </button>
            </div>
            <div style={{ textAlign:'center', marginBottom:20 }}>
              <label 
                className="avatar" 
                style={{ width:64, height:64, fontSize:24, margin:'0 auto 12px', cursor:'pointer', position:'relative', overflow:'hidden' }}
                title="Click to change profile picture"
              >
                {renderAvatarContent()}
                <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', opacity:0, transition:'opacity 0.2s' }}
                     onMouseEnter={e => e.currentTarget.style.opacity = 1}
                     onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                  <span style={{ fontSize:10, color:'#fff', fontWeight:600 }}>EDIT</span>
                </div>
                <input type="file" accept="image/*" style={{ display:'none' }} onChange={handleAvatarUpload} />
              </label>
              <div style={{ fontSize:18, fontWeight:700, fontFamily:'Sora' }}>{session?.name}</div>
              <div style={{ fontSize:13, color:'var(--text-muted)' }}>{session?.email}</div>
              <span className="badge badge-gold" style={{ marginTop:8 }}>{session?.role}</span>
            </div>
            <div style={{ background:'var(--bg-secondary)', borderRadius:10, padding:14, marginBottom:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:8 }}>
                <span style={{ color:'var(--text-muted)' }}>Occupation</span>
                <span>{session?.occupation || 'N/A'}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                <span style={{ color:'var(--text-muted)' }}>Member since</span>
                <span>{session?.createdAt ? new Date(session.createdAt).toLocaleDateString('en-IN') : 'N/A'}</span>
              </div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn-danger" style={{ flex:1 }} onClick={() => { logout(); setShowSettings(false) }}>
                <LogOut size={14}/> Logout
              </button>
              <button className="btn btn-secondary" style={{ flex:1 }} onClick={() => setShowSettings(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
