import React, { useState, useEffect, useRef } from 'react'
import { useApp } from '../App'
import {
  Coins, TrendingUp, TrendingDown, ShoppingCart, DollarSign, BarChart2
} from 'lucide-react'
import {
  LineChart, Line, ResponsiveContainer, Tooltip, XAxis
} from 'recharts'

const BASE_PRICE = 88

export default function SilverPage() {
  const { session, getSilver, saveSilver, silver, getWallet, updateWallet, wallets } = useApp()
  const uid = session?.id
  const portfolio = getSilver(uid)
  const wallet = getWallet(uid)

  const [price, setPrice] = useState(BASE_PRICE)
  const [history, setHistory] = useState(() => Array.from({ length: 10 }, (_, i) => ({
    t: i + 1, price: +(BASE_PRICE + (Math.random() - 0.5) * 2).toFixed(2)
  })))
  const [buyAmt, setBuyAmt] = useState('')
  const [sellGrams, setSellGrams] = useState('')
  const [tab, setTab] = useState('buy')

  // Live price ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setPrice(p => {
        const delta = p * 0.005 * (Math.random() > 0.5 ? 1 : -1)
        const newP = +(p + delta).toFixed(2)
        setHistory(h => [...h.slice(-9), { t: Date.now(), price: newP }])
        return newP
      })
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  function handleBuy() {
    const amt = +buyAmt
    if (!amt || amt <= 0) return
    if (amt > wallet.balance) { alert('Insufficient wallet balance.'); return }
    const grams = +(amt / price).toFixed(4)
    const prevGrams = portfolio.grams || 0
    const prevAvg = portfolio.avgBuyPrice || 0
    const newGrams = +(prevGrams + grams).toFixed(4)
    const newAvg = prevGrams === 0 ? price : +((prevGrams * prevAvg + grams * price) / newGrams).toFixed(2)
    const newPortfolio = {
      grams: newGrams, avgBuyPrice: newAvg,
      purchases: [...(portfolio.purchases || []), { grams, price, date: new Date().toISOString().split('T')[0], amount: amt }]
    }
    saveSilver({ ...silver, [uid]: newPortfolio })
    updateWallet(uid, wallet.balance - amt, {
      id: 't' + Date.now(), type: 'Buy Silver',
      amount: -amt, date: new Date().toISOString().split('T')[0],
      balanceAfter: wallet.balance - amt, note: `Bought ${grams}g silver @ ₹${price}/g`
    })
    setBuyAmt('')
  }

  function handleSell() {
    const g = +sellGrams
    if (!g || g <= 0) return
    if (g > portfolio.grams) { alert('Not enough silver to sell.'); return }
    const proceeds = +(g * price).toFixed(2)
    const newGrams = +(portfolio.grams - g).toFixed(4)
    const newPortfolio = { ...portfolio, grams: newGrams }
    saveSilver({ ...silver, [uid]: newPortfolio })
    updateWallet(uid, wallet.balance + proceeds, {
      id: 't' + Date.now(), type: 'Sell Silver',
      amount: proceeds, date: new Date().toISOString().split('T')[0],
      balanceAfter: wallet.balance + proceeds, note: `Sold ${g}g silver @ ₹${price}/g`
    })
    setSellGrams('')
  }

  const currentValue = +(portfolio.grams * price).toFixed(2)
  const investedValue = +(portfolio.grams * (portfolio.avgBuyPrice || 0)).toFixed(2)
  const pnl = +(currentValue - investedValue).toFixed(2)
  const pnlPct = investedValue > 0 ? +(pnl / investedValue * 100).toFixed(2) : 0
  const buyGrams = buyAmt ? +(+buyAmt / price).toFixed(4) : 0

  return (
    <div>
      {/* Ticker */}
      <div style={{ marginBottom:24 }}>
        <div className="ticker-wrap">
          <div className="ticker-inner" style={{ padding:'0 40px' }}>
            {Array.from({length:4}).map((_,i) => (
              <span key={i} style={{ marginRight:60 }}>
                🥈 SILVER <span style={{ color:'var(--gold)', fontWeight:700 }}>₹{price}/g</span>
                &nbsp;|&nbsp; MCX Silver&nbsp;
                <span style={{ color: pnl >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                  {pnl >= 0 ? '▲' : '▼'} {Math.abs(pnlPct)}%
                </span>
                &nbsp;|&nbsp; 24 Carat Pure &nbsp;&nbsp;
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="gold-line"/>
      <h1 className="section-title">Digital Silver Investment</h1>
      <p className="section-subtitle">Buy and sell digital silver in real-time. Price updates every 30 seconds.</p>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, alignItems:'start' }}>
        {/* Left: Price + Buy/Sell */}
        <div>
          {/* Price Card */}
          <div className="card card-gold" style={{ marginBottom:16, textAlign:'center' }}>
            <div style={{ fontSize:13, color:'var(--text-muted)', marginBottom:4 }}>Live Silver Price</div>
            <div style={{ fontSize:44, fontFamily:'Sora', fontWeight:800, color:'var(--gold)' }}>
              ₹{price}/g
            </div>
            <div style={{ fontSize:13, color:'var(--text-muted)' }}>99.9% Pure • MCX Simulated Rate</div>
            <div style={{ marginTop:16, height:80 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <Line type="monotone" dataKey="price" stroke="var(--gold)" strokeWidth={2} dot={false} />
                  <Tooltip
                    contentStyle={{ background:'var(--bg-card)', border:'1px solid var(--border-subtle)', borderRadius:8, fontSize:12 }}
                    formatter={(v) => [`₹${v}/g`, 'Price']}
                    labelFormatter={() => ''}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Buy/Sell tabs */}
          <div className="card">
            <div style={{ display:'flex', gap:8, marginBottom:20 }}>
              {['buy','sell'].map(t => (
                <button key={t} type="button"
                  className="btn"
                  style={{
                    flex:1, justifyContent:'center',
                    background: tab === t ? (t === 'buy' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)') : 'var(--bg-secondary)',
                    color: tab === t ? (t === 'buy' ? 'var(--success)' : 'var(--danger)') : 'var(--text-muted)',
                    border: tab === t ? `1px solid ${t === 'buy' ? 'rgba(34,197,94,0.4)': 'rgba(239,68,68,0.4)'}` : '1px solid var(--border-subtle)'
                  }}
                  onClick={() => setTab(t)}
                >
                  {t === 'buy' ? <ShoppingCart size={16}/> : <DollarSign size={16}/>}
                  {t.charAt(0).toUpperCase() + t.slice(1)} Silver
                </button>
              ))}
            </div>

            {tab === 'buy' ? (
              <>
                <div className="form-group">
                  <label className="form-label">Amount to Invest (₹)</label>
                  <input className="form-input" type="number" min="1" placeholder="e.g. 500"
                    value={buyAmt} onChange={e => setBuyAmt(e.target.value)} />
                </div>
                {buyAmt > 0 && (
                  <div style={{ padding:12, background:'var(--bg-secondary)', borderRadius:10, marginBottom:12, fontSize:13 }}>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={{ color:'var(--text-muted)' }}>You'll get</span>
                      <span style={{ fontWeight:600, color:'var(--gold)' }}>{buyGrams}g silver</span>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                      <span style={{ color:'var(--text-muted)' }}>Wallet after</span>
                      <span>₹{(wallet.balance - +buyAmt).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}
                <button className="btn btn-success btn-full" onClick={handleBuy} disabled={!buyAmt || +buyAmt > wallet.balance}>
                  <ShoppingCart size={16}/> Buy Silver
                </button>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Grams to Sell (max {portfolio.grams}g)</label>
                  <input className="form-input" type="number" min="0.0001" step="0.0001" max={portfolio.grams}
                    placeholder="e.g. 2.5" value={sellGrams} onChange={e => setSellGrams(e.target.value)} />
                </div>
                {sellGrams > 0 && (
                  <div style={{ padding:12, background:'var(--bg-secondary)', borderRadius:10, marginBottom:12, fontSize:13 }}>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={{ color:'var(--text-muted)' }}>You'll receive</span>
                      <span style={{ fontWeight:600, color:'var(--success)' }}>₹{(+sellGrams * price).toFixed(2)}</span>
                    </div>
                  </div>
                )}
                <button className="btn btn-danger btn-full" onClick={handleSell} disabled={!sellGrams || +sellGrams > portfolio.grams}>
                  <DollarSign size={16}/> Sell Silver
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right: Portfolio */}
        <div>
          <div className="card card-gold" style={{ marginBottom:16 }}>
            <h3 style={{ fontFamily:'Sora', marginBottom:16 }}>My Silver Portfolio</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {[
                { label:'Grams Owned', value:`${portfolio.grams || 0}g`, color:'var(--gold)' },
                { label:'Avg Buy Price', value:`₹${portfolio.avgBuyPrice || 0}/g`, color:'var(--text-primary)' },
                { label:'Current Value', value:`₹${currentValue.toLocaleString('en-IN')}`, color:'var(--gold)' },
                { label:'Invested Value', value:`₹${investedValue.toLocaleString('en-IN')}`, color:'var(--text-primary)' },
              ].map(s => (
                <div key={s.label} style={{ background:'var(--bg-secondary)', borderRadius:10, padding:14 }}>
                  <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:4 }}>{s.label}</div>
                  <div style={{ fontSize:20, fontFamily:'Sora', fontWeight:700, color:s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
            <div style={{
              marginTop:16, padding:16,
              background: pnl >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${pnl >= 0 ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
              borderRadius:10, display:'flex', alignItems:'center', justifyContent:'space-between'
            }}>
              <span style={{ fontSize:14, color:'var(--text-secondary)' }}>Total P&amp;L</span>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:22, fontFamily:'Sora', fontWeight:700, color: pnl >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                  {pnl >= 0 ? '+' : ''}₹{pnl.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize:12, color: pnl >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                  {pnl >= 0 ? '▲' : '▼'} {Math.abs(pnlPct)}%
                </div>
              </div>
            </div>
          </div>

          {/* Price History */}
          <div className="card">
            <h3 style={{ fontFamily:'Sora', fontSize:16, marginBottom:16 }}>Price History (Last 10)</h3>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={history}>
                <XAxis dataKey="t" hide />
                <Line type="monotone" dataKey="price" stroke="var(--gold)" strokeWidth={2.5} dot={{ r:3, fill:'var(--gold)' }} />
                <Tooltip
                  contentStyle={{ background:'var(--bg-card)', border:'1px solid var(--border-subtle)', borderRadius:8, fontSize:12 }}
                  formatter={(v) => [`₹${v}/g`, 'Price']}
                  labelFormatter={() => ''}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
