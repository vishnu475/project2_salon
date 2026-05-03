import { motion, AnimatePresence } from 'framer-motion'
import { CreditCard, ShieldCheck, X, Loader2, CheckCircle2, QrCode, Smartphone, Timer, Scissors } from 'lucide-react'
import { useState, useEffect } from 'react'

function PaymentModal({ isOpen, onClose, onPaymentSuccess, amount, serviceName }) {
  const [step, setStep] = useState('input') // input, processing, success
  const [method, setMethod] = useState('card') // card, qr
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvc: '' })
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes

  useEffect(() => {
    if (!isOpen || step !== 'input') return
    
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          onClose()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isOpen, step, onClose])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handlePayment = (e) => {
    if (e) e.preventDefault()
    setStep('processing')
    
    // Simulate payment delay
    setTimeout(() => {
      setStep('success')
      // Actual booking happens when we call onPaymentSuccess
      onPaymentSuccess(method === 'card' ? 'Credit Card' : 'PhonePe QR')
    }, 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-6 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-neutral-900 shadow-2xl"
      >
        {step !== 'success' && (
          <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">Secure Checkout</h3>
              <span className="flex items-center gap-1 rounded-full bg-amber-300/10 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                <Timer size={10} />
                {formatTime(timeLeft)}
              </span>
            </div>
            <button onClick={onClose} className="text-neutral-500 hover:text-white">
              <X size={20} />
            </button>
          </div>
        )}

        <div className="p-8">
          {step === 'input' && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-white/5 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-neutral-400">Total Amount</p>
                    <p className="mt-1 text-2xl font-bold text-amber-300">{amount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Time Remaining</p>
                    <p className={`text-sm font-mono font-bold ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                      {formatTime(timeLeft)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-neutral-500 mt-2">For: {serviceName}</p>
              </div>

              {/* Method Toggle */}
              <div className="flex gap-2 rounded-xl bg-black/40 p-1">
                <button
                  onClick={() => setMethod('card')}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition ${
                    method === 'card' ? 'bg-amber-300 text-black' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <CreditCard size={14} />
                  Card
                </button>
                <button
                  onClick={() => setMethod('qr')}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition ${
                    method === 'qr' ? 'bg-amber-300 text-black' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <QrCode size={14} />
                  QR Code
                </button>
              </div>

              {method === 'card' ? (
                <form onSubmit={handlePayment} className="space-y-4">
                  <div className="space-y-3">
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                      <input
                        type="text"
                        placeholder="Card Number"
                        value={cardData.number}
                        onChange={(e) => setCardData({ ...cardData, number: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                        className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-sm outline-none focus:border-amber-300 text-white"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardData.expiry}
                        onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-amber-300 text-white"
                        required
                      />
                      <input
                        type="password"
                        placeholder="CVC"
                        value={cardData.cvc}
                        onChange={(e) => setCardData({ ...cardData, cvc: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-amber-300 text-white"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-amber-300 py-4 text-sm font-bold text-black transition hover:bg-amber-200"
                  >
                    Pay Now
                  </button>
                </form>
              ) : (
                <div className="flex flex-col items-center gap-6 py-2">
                  <div className="rounded-2xl bg-white p-2 shadow-xl overflow-hidden">
                    <img
                      src="/assets/qr-code.png"
                      alt="PhonePe QR Code"
                      className="h-52 w-52 object-contain"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-white flex items-center justify-center gap-2">
                      <Smartphone size={16} className="text-amber-300" />
                      Scan with PhonePe
                    </p>
                    <p className="mt-1 text-[10px] text-neutral-500 uppercase tracking-widest">Instant Booking Confirmation</p>
                  </div>
                  <button
                    onClick={() => handlePayment()}
                    className="w-full rounded-xl bg-amber-300 py-4 text-sm font-bold text-black transition hover:bg-amber-200"
                  >
                    I have paid
                  </button>
                </div>
              )}

              <p className="flex items-center justify-center gap-2 text-[10px] text-neutral-500">
                <ShieldCheck size={12} />
                Secure & Encrypted Transaction
              </p>
            </div>
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-amber-300" />
              <h3 className="mt-6 text-lg font-semibold text-white">Verifying Transaction</h3>
              <p className="mt-2 text-sm text-neutral-400">Please wait while we confirm your payment with the bank...</p>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center py-6 text-center">
              {/* Top: Logo */}
              <div className="flex flex-col items-center gap-2 mb-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-300/10 text-amber-300">
                  <Scissors size={32} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white uppercase italic">Salon Luxe</h2>
              </div>

              {/* Middle: Success Message */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-8"
              >
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-6 py-3 text-emerald-500 border border-emerald-500/20">
                  <CheckCircle2 size={24} className="fill-emerald-500/20" />
                  <span className="text-lg font-bold">Payment Successful</span>
                </div>
              </motion.div>

              {/* Bottom: Details */}
              <div className="w-full space-y-4 rounded-2xl bg-white/5 p-6 text-left border border-white/5">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-xs text-neutral-500 uppercase tracking-widest">Service</span>
                  <span className="text-sm font-semibold text-white">{serviceName}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-xs text-neutral-500 uppercase tracking-widest">Amount Paid</span>
                  <span className="text-sm font-bold text-amber-300">{amount}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-xs text-neutral-500 uppercase tracking-widest">Status</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full uppercase">Confirmed</span>
                </div>
                <p className="pt-2 text-[11px] text-neutral-400 text-center leading-relaxed">
                  Confirmation sent to your email. Please show this screen at reception.
                </p>
              </div>

              <button
                onClick={onClose}
                className="mt-10 w-full rounded-2xl bg-white/5 border border-white/10 py-4 text-sm font-bold text-white transition hover:bg-white/10 active:scale-95"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default PaymentModal
