import React, { useState, useRef, useEffect } from 'react'
import { useApp } from '../App'
import { MessageCircle, X, Send, Bot } from 'lucide-react'

// ─── Local AI Knowledge Base ────────────────────────────────────────────────────
// Each entry has: patterns (keywords/phrases to match), response, and optionally
// a follow-up suggestion. The engine finds the best matching intent.

const KNOWLEDGE_BASE = [
  // Credit Score
  {
    tags: ['improve', 'increase', 'boost', 'score', 'credit', 'raise'],
    response: `To improve your credit score:\n• ✅ **Pay off existing loans** – reduces debt burden\n• ✅ **Use digital payments** – UPI/mobile banking boosts your score\n• ✅ **Increase income** – report higher, consistent earnings\n• ✅ **Own land** – land ownership adds to your creditworthiness\n• ✅ **Avoid new loans** – take only what you need\n\nEven a 10-point improvement can unlock better loan rates! 🎯`
  },
  {
    tags: ['score', 'credit score', 'calculate', 'how score', 'scoring', 'how is'],
    response: `Your GrāmFinance credit score (0–100) is calculated using **5 alternative factors** — no bank history needed!\n\n• 📊 Monthly Income → 30 points\n• 📱 Digital Payments (UPI/apps) → 20 points\n• 🌾 Land Ownership → 15 points\n• 💸 No Existing Loans → 20 points\n• 🏢 Occupation Stability → 15 points\n\nGo to **Credit Score** in the sidebar to calculate yours!`
  },
  {
    tags: ['risk', 'low risk', 'medium risk', 'high risk', 'risk level'],
    response: `GrāmFinance classifies you into 3 risk levels:\n\n🟢 **Low Risk** (Score 70–100) – Best interest rates, high loan limits\n🟡 **Medium Risk** (Score 45–69) – Moderate rates, some restrictions\n🔴 **High Risk** (Score 0–44) – Higher rates, lower loan limits\n\nYou can move to a lower risk category by improving income, clearing debts, and using digital payments more! 💪`
  },

  // Loans
  {
    tags: ['apply', 'loan', 'apply for loan', 'how to apply', 'get loan', 'borrow'],
    response: `Applying for a loan on GrāmFinance is simple:\n\n1️⃣ First, **complete your KYC** (Aadhaar, PAN upload)\n2️⃣ **Calculate your Credit Score** in the Credit Score section\n3️⃣ Go to **Loans** → click **Apply for Loan**\n4️⃣ Enter: Amount, Purpose, and Tenure (months)\n5️⃣ The **EMI calculator** shows your monthly payment\n6️⃣ Submit → Admin reviews and approves!\n\nYour credit score determines the interest rate 📋`
  },
  {
    tags: ['emi', 'monthly payment', 'installment', 'repay', 'how much emi'],
    response: `Your EMI is calculated as:\n\n**EMI = P × r × (1+r)ⁿ / ((1+r)ⁿ − 1)**\n\nWhere:\n• P = Loan amount (Principal)\n• r = Monthly interest rate (annual rate ÷ 12 ÷ 100)\n• n = Tenure in months\n\nYour interest rate depends on your credit score:\n🟢 Score 70+ → **10% p.a.**\n🟡 Score 45–69 → **14% p.a.**\n🔴 Score below 45 → **18% p.a.**\n\nThe EMI calculator shows this automatically when you apply! 🧮`
  },
  {
    tags: ['interest', 'interest rate', 'rate', 'percentage'],
    response: `GrāmFinance offers **risk-based interest rates**:\n\n• 🟢 **Low Risk** (score ≥70) → 10% per annum\n• 🟡 **Medium Risk** (score 45–69) → 14% per annum\n• 🔴 **High Risk** (score <45) → 18% per annum\n\nImprove your credit score to get a lower rate and save more money on interest! 💰`
  },
  {
    tags: ['loan status', 'approved', 'rejected', 'pending', 'check loan'],
    response: `Your loan application goes through 3 stages:\n\n⏳ **Pending** – Application submitted, under review\n✅ **Approved** – Loan sanctioned! You can start paying EMIs\n❌ **Rejected** – You can reapply after improving your score\n\nYou can check your loan status anytime in the **Loans** section. Once approved, use the **Pay EMI** button each month from your wallet! 📋`
  },

  // Silver Investment
  {
    tags: ['silver', 'invest', 'investment', 'buy silver', 'good investment', 'why silver'],
    response: `🥈 **Digital Silver is a great savings option for rural families!**\n\nWhy invest in silver:\n• 📈 Historically beats inflation over time\n• 🏪 Can buy small amounts (even ₹100 worth)\n• 💧 High liquidity — sell anytime\n• 🌾 Familiar to rural communities\n• 🔒 Safe store of value during crop failures\n\nOn GrāmFinance, silver price updates every 30 seconds at real MCX-simulated rates. Buy small, save regularly! 🎯`
  },
  {
    tags: ['sell silver', 'how to sell', 'cash out', 'silver profit', 'profit loss'],
    response: `To sell your silver on GrāmFinance:\n\n1️⃣ Go to **Silver Invest** in the sidebar\n2️⃣ Select the **Sell** tab\n3️⃣ Enter the **grams** you want to sell\n4️⃣ You'll see the amount you'll receive\n5️⃣ Click **Sell Silver** → money goes to your Wallet instantly!\n\nYour **Profit & Loss** updates in real-time based on your average buy price vs current price 📊`
  },
  {
    tags: ['silver price', 'price', 'rate today', 'current price', 'how much'],
    response: `The silver price on GrāmFinance starts at **₹88/gram** and updates every **30 seconds** with ±0.5% random fluctuation — simulating real MCX market conditions.\n\nYou can see:\n• Live current price with a sparkline chart\n• Your portfolio's current value\n• Average buy price\n• Total Profit or Loss\n\nCheck the **Silver Invest** page for live data! 🥈`
  },

  // KYC
  {
    tags: ['kyc', 'verify', 'verification', 'document', 'aadhaar', 'pan', 'identity'],
    response: `KYC (Know Your Customer) verifies your identity. Here's the process:\n\n1️⃣ **Upload Documents**: Aadhaar card, PAN card, bank statement, and a selfie\n2️⃣ **OCR Extraction**: System auto-reads your name, DOB, ID number\n3️⃣ **Face Match**: Your selfie is compared with document photo (~96% match)\n4️⃣ **Submission**: Admin reviews and approves within 24–48 hours\n\n✅ KYC Verified → Better loan eligibility\n⏳ KYC Pending → Being reviewed\n❌ KYC Rejected → Please resubmit with clearer documents`
  },

  // Wallet
  {
    tags: ['wallet', 'balance', 'add money', 'deposit', 'withdraw', 'funds'],
    response: `Your GrāmFinance Wallet is your main financial hub! 💼\n\n• 💰 **Add Funds**: Simulate depositing money (₹500, ₹1000, ₹2000, ₹5000)\n• 🏧 **Withdraw**: Transfer money out\n• 📋 **Transaction History**: Full record of all deposits, withdrawals, silver trades, and loan repayments\n• 🔗 **All modules connect**: Silver trades and loan EMIs automatically update your wallet balance\n\nYour current balance is always shown in the top bar! 👀`
  },

  // General financial advice
  {
    tags: ['save', 'saving', 'savings', 'save money', 'tip', 'advice', 'suggest'],
    response: `💡 **Smart saving tips for rural families:**\n\n1. 🥈 **Invest small in silver** – ₹200–500/month builds wealth\n2. 📱 **Use UPI for all payments** – boosts your credit score\n3. 💳 **Avoid multiple loans** – repay one before taking another\n4. 🌾 **Plan crop cycle finances** – borrow before sowing, repay after harvest\n5. 📊 **Check your credit score** regularly to track progress\n\nSmall steps every month create big financial security! 🙏`
  },
  {
    tags: ['farmer', 'agriculture', 'crop', 'farm', 'kisan', 'harvest'],
    response: `🌾 **GrāmFinance is built for farmers like you!**\n\nKeys to a good farmer credit score:\n• Report your **actual land size** (more land = higher score)\n• Mention your **crop type** (wheat, rice, cotton are valued)\n• Use **UPI/digital payments** for seeds, fertilizers\n• Show **stable farming income** each season\n\nYou can apply for crop loans up to ₹1,20,000 depending on your score. Check the **Loans** section for Crop Input loans! 🚜`
  },
  {
    tags: ['daily wage', 'labourer', 'worker', 'manual', 'unskilled'],
    response: `As a daily wage worker, here's how to build credit:\n\n✅ **Use digital payments daily** – even small UPI transactions help\n✅ **Keep existing loans manageable** – pay on time\n✅ **Save regularly** in the wallet – shows financial discipline\n✅ **Build up income over time** – report any side income too\n\nStart with a small loan (₹5,000–₹10,000), repay on time, and your score will improve! You can borrow more next time 📈`
  },
  {
    tags: ['small business', 'shop', 'business', 'trade', 'entrepreneur', 'shopkeeper'],
    response: `🏪 **GrāmFinance supports small business owners!**\n\nYour credit profile:\n• Small business occupation gives a **12-point bonus** in scoring\n• Business income over ₹25,000/month → excellent score potential\n• Business loans available for **expansion, stock, equipment**\n• Apply for loans up to ₹97,200 with a high score\n\nTip: Use digital payments (UPI/Paytm) for all business transactions to maximize your Digital Payments score! 💼`
  },

  // App navigation
  {
    tags: ['how to use', 'navigate', 'get started', 'start', 'begin', 'tutorial', 'help'],
    response: `Welcome to GrāmFinance! Here's how to get started:\n\n**Step 1** → Complete **KYC Verify** (upload your documents)\n**Step 2** → Visit **Credit Score** and calculate your score\n**Step 3** → Explore **Loans** if you need funds\n**Step 4** → Invest spare money in **Silver Invest**\n**Step 5** → Track everything in your **Wallet**\n\nThe sidebar on the left has all sections. The top bar shows your wallet balance. I'm here to help anytime! 🙏`
  },
  {
    tags: ['admin', 'approve', 'reject', 'admin panel', 'lender'],
    response: `The **Admin Panel** is for lenders/managers:\n\n• 📊 **Overview** – Charts showing loan status and credit score distribution\n• 👥 **Users** – All borrowers with KYC status and credit scores\n• 💳 **Loans** – Approve or Reject pending loan applications\n• 📁 **KYC** – Verify or Reject identity documents\n• 🚩 **Fraud** – Users flagged for very low scores or multiple rapid applications\n\nAdmin login: admin@gramfinance.com / admin123`
  },

  // Greetings & small talk
  {
    tags: ['hello', 'hi', 'hey', 'namaste', 'good morning', 'good evening', 'greet'],
    response: `Namaste! 🙏 I'm GrāmBot, your AI financial guide!\n\nI can help you with:\n• 📊 Credit score tips\n• 💳 Loan applications & EMI\n• 🥈 Silver investment\n• 💼 Wallet management\n• 📋 KYC process\n\nWhat would you like to know today?`
  },
  {
    tags: ['thank', 'thanks', 'thank you', 'shukriya', 'dhanyawad'],
    response: `You're most welcome! 🙏 Khush raho, samridh raho! (Stay happy and prosperous!)\n\nFeel free to ask me anything about loans, credit scores, silver investment, or any other feature. I'm always here to help! 😊`
  },
  {
    tags: ['bye', 'goodbye', 'see you', 'later', 'exit'],
    response: `Alvida! 👋 Come back anytime you have questions. GrāmFinance is here to support your financial journey. Best of luck with your savings and loans! 🙏🌾`
  },
]

// ─── Local AI Engine ────────────────────────────────────────────────────────────
function localAIResponse(userInput) {
  const input = userInput.toLowerCase().trim()

  // Score each knowledge base entry
  let bestMatch = null
  let bestScore = 0

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0
    for (const tag of entry.tags) {
      if (input.includes(tag)) {
        // Longer tag matches score higher (more specific)
        score += tag.split(' ').length * 2
      }
      // Partial word match
      const words = tag.split(' ')
      for (const word of words) {
        if (word.length > 3 && input.includes(word)) {
          score += 1
        }
      }
    }
    if (score > bestScore) {
      bestScore = score
      bestMatch = entry
    }
  }

  if (bestScore > 0 && bestMatch) {
    return bestMatch.response
  }

  // Default fallback
  const fallbacks = [
    `I'm not sure about that specific question. Try asking me about:\n• 📊 How to improve your credit score\n• 💳 How to apply for a loan\n• 🥈 Silver investment tips\n• 💼 Wallet and transactions\n• 📋 KYC verification process`,
    `That's a great question! For best results, try asking about credit scores, loans, savings, or silver investment. I'm trained specifically on GrāmFinance's features and rural finance topics. 🙏`,
    `I'm your GrāmFinance specialist! I can best help with questions about:\n• Your credit score and how to improve it\n• Loan applications and EMI calculations\n• Digital silver investment\n• KYC document verification`,
  ]
  return fallbacks[Math.floor(Math.random() * fallbacks.length)]
}

// Parse markdown-like bold (**text**) for rendering
function renderText(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return part
  })
}

const QUICK_REPLIES = [
  'How to improve my score?',
  'Is silver a good investment?',
  'How do I apply for a loan?',
  'How is EMI calculated?',
]

const INITIAL_MSG = {
  role: 'assistant',
  content: 'Namaste! 🙏 I\'m GrāmBot, your AI financial advisor. I can help with credit scores, loans, savings, and digital silver investment. What\'s on your mind today?'
}

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([INITIAL_MSG])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  function send(text) {
    const userMsg = (text || input).trim()
    if (!userMsg) return
    setInput('')
    setMessages(m => [...m, { role: 'user', content: userMsg }])
    setLoading(true)

    // Simulate a short "thinking" delay for realism
    const delay = 600 + Math.random() * 600
    setTimeout(() => {
      const reply = localAIResponse(userMsg)
      setMessages(m => [...m, { role: 'assistant', content: reply }])
      setLoading(false)
    }, delay)
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <>
      {open && (
        <div className="chat-window slide-in-right">
          <div className="chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--gold), #a07210)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Bot size={18} color="#0D2818" />
              </div>
              <div>
                <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 14 }}>GrāmBot</div>
                <div style={{ fontSize: 11, color: 'var(--success)' }}>● AI Model Active</div>
              </div>
            </div>
            <button className="btn btn-secondary btn-icon" onClick={() => setOpen(false)}>
              <X size={16} />
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`chat-msg ${m.role === 'assistant' ? 'bot slide-in-left' : 'user slide-in-right'}`}
              >
                {m.role === 'assistant' && (
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>GrāmBot</div>
                )}
                <div style={{ whiteSpace: 'pre-line' }}>
                  {renderText(m.content)}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-msg bot">
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>GrāmBot</div>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: 'var(--gold)',
                      animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick reply chips — show for first 3 messages */}
          {messages.length <= 3 && (
            <div className="quick-chips">
              {QUICK_REPLIES.map(q => (
                <button key={q} className="chip" style={{ fontSize: 12 }} onClick={() => send(q)}>
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="chat-input-row">
            <input
              className="chat-input"
              placeholder="Ask GrāmBot anything…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
            />
            <button
              className="btn btn-primary btn-icon"
              onClick={() => send()}
              disabled={!input.trim() || loading}
              style={{ borderRadius: '50%' }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      <button className="chat-fab" onClick={() => setOpen(o => !o)} title="Chat with GrāmBot">
        {open ? <X size={24} color="#0D2818" /> : <MessageCircle size={24} color="#0D2818" />}
      </button>
    </>
  )
}
