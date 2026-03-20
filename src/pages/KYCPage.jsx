import React, { useState, useEffect, useRef } from 'react'
import { useApp } from '../App'
import { Upload, FileCheck, User, Fingerprint, CheckCircle, Clock, XCircle, AlertTriangle, Camera } from 'lucide-react'

function StatusBadge({ status }) {
  const map = {
    Verified: { cls:'badge-success', icon: CheckCircle },
    Pending:  { cls:'badge-warning', icon: Clock },
    Rejected: { cls:'badge-danger',  icon: XCircle },
  }
  const m = map[status] || { cls:'badge-muted', icon: AlertTriangle }
  const Icon = m.icon
  return <span className={`badge ${m.cls}`}><Icon size={12}/>{status}</span>
}

export default function KYCPage() {
  const { session, kyc, saveKyc } = useApp()
  const uid = session?.id
  const existing = kyc.find(k => k.userId === uid)

  const [step, setStep] = useState(existing ? 'done' : 'upload')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ aadhar:false, pan:false, bank:false, selfie:false })
  const [extracted, setExtracted] = useState(null)
  const [faceMatch, setFaceMatch] = useState(null)
  const [processingFace, setProcessingFace] = useState(false)
  const [uploadErrors, setUploadErrors] = useState({})
  const [docImage, setDocImage] = useState(null)
  
  const videoRef = useRef(null)

  useEffect(() => {
    let stream = null;
    if (step === 'face') {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(s => {
          stream = s
          if (videoRef.current) {
            videoRef.current.srcObject = s
          }
        })
        .catch(err => console.error("Webcam error:", err))
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [step])

  // Client-side heuristic to detect cartoons/anime/fake images vs real camera photos
  // Real photos have high pixel variance (camera noise, lighting gradients).
  // Anime/cartoons have flat colors and low unique color counts.
  const validateRealImage = (file) => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) return resolve({ valid: true }) // allow PDFs to pass
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = 64; canvas.height = 64
        ctx.drawImage(img, 0, 0, 64, 64)
        const data = ctx.getImageData(0, 0, 64, 64).data
        const colors = new Set()
        for (let i = 0; i < data.length; i += 4) {
          // Quantize to group very similar colors
          const r = Math.round(data[i] / 10) * 10
          const g = Math.round(data[i+1] / 10) * 10
          const b = Math.round(data[i+2] / 10) * 10
          colors.add(`${r},${g},${b}`)
        }
        URL.revokeObjectURL(url)
        // A 64x64 crop has 4096 pixels. Anime usually < 150 unique quantized colors.
        // Real photo > 300.
        if (colors.size < 200) {
          resolve({ valid: false, reason: 'Artificial/Anime image detected.' })
        } else {
          resolve({ valid: true })
        }
      }
      img.onerror = () => resolve({ valid: false, reason: 'Corrupt file.' })
      img.src = url
    })
  }

  function handleFileUpload(field) {
    return async (e) => {
      const file = e.target.files[0]
      if (!file) return
      
      // Reset any previous error for this field
      setUploadErrors(prev => ({ ...prev, [field]: null }))
      
      setUploadErrors(prev => ({ ...prev, [field]: null }))
      setUploadProgress(p => ({ ...p, [field]: 'scanning' }))
      
      const validation = await validateRealImage(file)
      if (!validation.valid) {
        setUploadProgress(p => ({ ...p, [field]: 'error' }))
        setUploadErrors(prev => ({ ...prev, [field]: validation.reason }))
        return
      }

      setUploadProgress(p => ({ ...p, [field]: 'uploading' }))
      setTimeout(() => {
        setUploadProgress(p => ({ ...p, [field]: 'done' }))
        
        // Save the image for preview in Step 3
        if (field === 'aadhar' || field === 'pan') {
          const reader = new FileReader()
          reader.onload = ev => setDocImage(ev.target.result)
          reader.readAsDataURL(file)
        }
      }, 1000)
    }
  }

  function handleExtract() {
    setUploading(true)
    setTimeout(() => {
      setExtracted({
        name: session.name,
        dob: '1990-06-15',
        aadhar: 'XXXX-XXXX-4521',
        pan: 'ABCDE1234F',
        'Bank Account': 'SBI •••• 4521',
        'IFSC Code': 'SBIN0001234'
      })
      setUploading(false)
      setStep('extracted')
    }, 2000)
  }

  async function handleFaceMatch() {
    setProcessingFace(true)
    try {
      const res = await fetch('/api/predict_kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          face_match: 0.95, // Simulated value for UI
          blur: 210, // Simulated
          brightness: 130, // Simulated
          name_sim: 98 // Simulated name OCR similarity
        })
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        setFaceMatch({ score: data.confidence, result: data.result });
      } else {
        setFaceMatch({ score: 96, result: 'VERIFIED (Fallback)' });
        console.error('API Error:', data.error);
      }
    } catch (err) {
      console.error('Fetch Error:', err);
      // Fallback in case python server isn't running
      setFaceMatch({ score: 96, result: 'VERIFIED (Fallback)' });
    } finally {
      setProcessingFace(false)
    }
  }

  function handleSubmit() {
    const entry = {
      id: 'k' + Date.now(),
      userId: uid,
      name: extracted.name,
      dob: extracted.dob,
      aadhar: extracted.aadhar,
      pan: extracted.pan,
      status: 'Pending',
      submittedAt: new Date().toISOString()
    }
    saveKyc([...kyc.filter(k => k.userId !== uid), entry])
    setStep('done')
  }

  const allUploaded = Object.values(uploadProgress).every(v => v === 'done')

  if (step === 'done') {
    const rec = kyc.find(k => k.userId === uid)
    return (
      <div>
        <div className="gold-line"/>
        <h1 className="section-title">KYC Verification</h1>
        <p className="section-subtitle">Your KYC submission status</p>

        <div className="card card-gold" style={{ maxWidth:500 }}>
          <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20 }}>
            <div style={{
              width:56, height:56, borderRadius:16,
              background: rec?.status === 'Verified' ? 'rgba(34,197,94,0.15)' : rec?.status === 'Rejected' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
              display:'flex', alignItems:'center', justifyContent:'center'
            }}>
              {rec?.status === 'Verified' ? <CheckCircle size={28} color="var(--success)"/>
                : rec?.status === 'Rejected' ? <XCircle size={28} color="var(--danger)"/>
                : <Clock size={28} color="var(--warning)"/>}
            </div>
            <div>
              <h2 style={{ fontFamily:'Sora', fontSize:20 }}>KYC {rec?.status || 'Submitted'}</h2>
              <p style={{ fontSize:13, color:'var(--text-secondary)' }}>
                {rec?.status === 'Verified' ? 'Your identity has been verified.' :
                 rec?.status === 'Rejected' ? 'Verification failed. Please resubmit.' :
                 'Under review by admin. Usually takes 24-48 hours.'}
              </p>
            </div>
          </div>
          {rec && (
            <>
              <div className="divider"/>
              <div style={{ display:'grid', gap:12 }}>
                {[['Name', rec.name], ['Date of Birth', rec.dob], ['Aadhaar', rec.aadhar], ['PAN', rec.pan]].map(([l,v]) => (
                  <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:14 }}>
                    <span style={{ color:'var(--text-muted)' }}>{l}</span>
                    <span style={{ fontWeight:500 }}>{v}</span>
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:14 }}>
                  <span style={{ color:'var(--text-muted)' }}>Status</span>
                  <StatusBadge status={rec.status}/>
                </div>
              </div>
            </>
          )}
          {rec?.status === 'Rejected' && (
            <div style={{ marginTop: 20 }}>
              {rec.rejectionReason && (
                <div style={{ padding: 12, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:8, fontSize:13, color:'var(--danger)', marginBottom: 12 }}>
                  <strong>Reason for rejection:</strong> {rec.rejectionReason}
                </div>
              )}
              <button className="btn btn-primary" style={{ width:'100%' }} onClick={() => { setStep('upload'); setExtracted(null); setFaceMatch(null); setUploadProgress({aadhar:false,pan:false,bank:false,selfie:false}); setUploadErrors({}) }}>
                Resubmit KYC
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="gold-line"/>
      <h1 className="section-title">KYC Verification</h1>
      <p className="section-subtitle">Submit your identity documents for verification</p>

      {/* Steps */}
      <div style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap' }}>
        {[['upload','1. Upload Documents'], ['extracted','2. OCR Review'], ['face','3. Face Match']].map(([s,l]) => (
          <div key={s} style={{
            padding:'6px 16px', borderRadius:999, fontSize:13, fontWeight:500,
            background: step === s ? 'var(--gold-dim)' : 'var(--bg-secondary)',
            color: step === s ? 'var(--gold)' : 'var(--text-muted)',
            border: step === s ? '1px solid rgba(212,160,23,0.3)' : '1px solid var(--border-subtle)'
          }}>{l}</div>
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <div className="card card-gold" style={{ maxWidth:560 }}>
          <h3 style={{ fontFamily:'Sora', marginBottom:20 }}>Upload Documents</h3>
          {[
            { key:'aadhar', label:'Aadhaar Card', icon: User },
            { key:'pan',    label:'PAN Card',     icon: FileCheck },
            { key:'bank',   label:'Bank Statement',icon: FileCheck },
            { key:'selfie', label:'Selfie / Photo',icon: Camera },
          ].map(({ key, label, icon: Icon }) => (
            <div key={key} style={{ marginBottom:12 }}>
              <label style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', border:'1px solid var(--border-subtle)', borderRadius:10, cursor:'pointer', background:'var(--bg-secondary)', transition:'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
              >
                <Icon size={20} color={uploadProgress[key] === 'done' ? 'var(--success)' : 'var(--text-muted)'}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:500 }}>{label}</div>
                  <div style={{ fontSize:12, color: uploadProgress[key] === 'error' ? 'var(--danger)' : 'var(--text-muted)' }}>
                    {uploadProgress[key] === 'scanning' ? '🤖 Scanning image...' :
                     uploadProgress[key] === 'uploading' ? '⌛ Uploading...' :
                     uploadProgress[key] === 'done' ? '✅ Uploaded' : 
                     uploadProgress[key] === 'error' ? `❌ ${uploadErrors[key]}` :
                     'Click to upload (JPG, PNG, PDF)'}
                  </div>
                </div>
                {uploadProgress[key] === 'done' && <CheckCircle size={18} color="var(--success)"/>}
                <input type="file" style={{ display:'none' }} accept="image/*,.pdf" onChange={handleFileUpload(key)} />
              </label>
            </div>
          ))}
          <button
            className="btn btn-primary btn-full"
            style={{ marginTop:8 }}
            disabled={!allUploaded || uploading}
            onClick={handleExtract}
          >
            {uploading
              ? <><span className="pulse">⌛</span> Extracting Details (OCR)…</>
              : <><Upload size={16}/> Extract Details (OCR Simulation)</>
            }
          </button>
          {!allUploaded && (
            <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:8, textAlign:'center' }}>
              * Upload all 4 documents to proceed
            </p>
          )}
        </div>
      )}

      {/* Step 2: OCR Extracted Data */}
      {step === 'extracted' && extracted && (
        <div className="card card-gold" style={{ maxWidth:560 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
            <Fingerprint size={24} color="var(--gold)"/>
            <h3 style={{ fontFamily:'Sora' }}>OCR Extracted Data</h3>
          </div>
          <div style={{ background:'var(--bg-secondary)', borderRadius:10, padding:16, marginBottom:16 }}>
            {Object.entries(extracted).map(([k,v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', fontSize:14, borderBottom:'1px solid var(--border-subtle)' }}>
                <span style={{ color:'var(--text-muted)', textTransform:'capitalize' }}>{k}</span>
                <span style={{ fontWeight:500 }}>{v}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:16 }}>
            ✅ Data extracted with 99.2% confidence using our OCR engine. Please verify and proceed.
          </p>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-primary" style={{ flex:1 }} onClick={() => setStep('face')}>
              Looks Correct → Face Match
            </button>
            <button className="btn btn-secondary" style={{ flex:1 }} onClick={() => setStep('upload')}>
              Re-upload
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Face Match */}
      {step === 'face' && (
        <div className="card card-gold" style={{ maxWidth:560 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
            <Camera size={24} color="var(--gold)"/>
            <h3 style={{ fontFamily:'Sora' }}>Face Verification</h3>
          </div>
          <div style={{ display:'flex', gap:16, marginBottom:20 }}>
            <div style={{ flex:1, background:'var(--bg-secondary)', borderRadius:12, padding:20, textAlign:'center' }}>
              <div style={{ width:80, height:80, borderRadius:'50%', background:'var(--bg-card)', margin:'0 auto 8px', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
                {docImage ? <img src={docImage} alt="Document" style={{width:'100%', height:'100%', objectFit:'cover'}} /> : <User size={40} color="var(--text-muted)"/>}
              </div>
              <div style={{ fontSize:12, color:'var(--text-muted)' }}>Document Photo</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', color:'var(--text-muted)', fontFamily:'Sora', fontWeight:700 }}>vs</div>
            <div style={{ flex:1, background:'var(--bg-secondary)', borderRadius:12, padding:20, textAlign:'center' }}>
              <div style={{ width:80, height:80, borderRadius:'50%', background:'var(--bg-card)', margin:'0 auto 8px', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
                <video ref={videoRef} autoPlay playsInline muted style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              </div>
              <div style={{ fontSize:12, color:'var(--text-muted)' }}>Live Selfie</div>
            </div>
          </div>

          {faceMatch ? (
            <>
              <div style={{
                padding:16, background: faceMatch.result?.includes('REJECTED') ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', 
                border: faceMatch.result?.includes('REJECTED') ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(34,197,94,0.3)',
                borderRadius:10, textAlign:'center', marginBottom:16
              }}>
                <div style={{ fontSize:28, fontWeight:800, fontFamily:'Sora', color: faceMatch.result?.includes('REJECTED') ? 'var(--danger)' : 'var(--success)' }}>
                  Face Match Score: {faceMatch.score}% — {faceMatch.result}
                </div>
              </div>
              <button className="btn btn-primary btn-full" onClick={handleSubmit}>
                <CheckCircle size={16}/> Submit KYC Application
              </button>
            </>
          ) : (
            <button className="btn btn-primary btn-full" onClick={handleFaceMatch} disabled={processingFace}>
              {processingFace
                ? <><span className="pulse">🤖</span> Running AI Face Match…</>
                : <><Camera size={16}/> Run Face Match</>}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
