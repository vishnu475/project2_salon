import { useState } from 'react'
import { ROOT_URL } from '../config'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Upload, X, Loader2, Wand2 } from 'lucide-react'

function AIMakeover() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState('upload') // upload, processing, result
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)

  const handleUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPreview(URL.createObjectURL(file))
      setStep('processing')
      
      // Simulate AI transformation
      fetch(`${ROOT_URL}/api/ai/virtual-makeover`, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          setTimeout(() => {
            setResult(data)
            setStep('result')
          }, 3000)
        })
    }
  }

  const reset = () => {
    setStep('upload')
    setPreview(null)
    setResult(null)
    setIsOpen(false)
  }

  return (
    <>
      {/* Floating Toggle */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-amber-300 to-amber-500 text-black shadow-lg shadow-amber-500/20 transition hover:scale-110 active:scale-95"
      >
        <Sparkles size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-6 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-neutral-900 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
                <div className="flex items-center gap-2">
                  <Wand2 size={18} className="text-amber-300" />
                  <h3 className="font-semibold text-white">AI Virtual Makeover</h3>
                </div>
                <button onClick={reset} className="text-neutral-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8">
                {step === 'upload' && (
                  <div className="text-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/5 text-amber-300">
                      <Upload size={32} />
                    </div>
                    <h4 className="text-lg font-bold text-white">Try a New Look</h4>
                    <p className="mt-2 text-sm text-neutral-400">Upload your photo and our AI will suggest the perfect hair & skin style for you.</p>
                    
                    <label className="mt-8 block cursor-pointer rounded-2xl bg-amber-300 py-4 text-sm font-bold text-black transition hover:bg-amber-200">
                      Upload Photo
                      <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
                    </label>
                  </div>
                )}

                {step === 'processing' && (
                  <div className="py-10 text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-amber-300" />
                    <h4 className="mt-6 text-lg font-bold text-white">Analyzing Features</h4>
                    <p className="mt-2 text-sm text-neutral-400">Our AI is mapping your face structure and hair texture...</p>
                    {preview && (
                      <div className="mt-8 mx-auto h-40 w-40 overflow-hidden rounded-full border-4 border-amber-300/20">
                        <img src={preview} alt="Preview" className="h-full w-full object-cover grayscale blur-[2px]" />
                      </div>
                    )}
                  </div>
                )}

                {step === 'result' && result && (
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="flex-1 rounded-2xl border border-white/10 bg-black/20 p-2">
                        <p className="mb-2 text-[10px] uppercase tracking-widest text-neutral-500 text-center">Before</p>
                        <img src={preview} alt="Before" className="h-40 w-full rounded-xl object-cover" />
                      </div>
                      <div className="flex-1 rounded-2xl border border-amber-300/30 bg-amber-300/5 p-2">
                        <p className="mb-2 text-[10px] uppercase tracking-widest text-amber-300 text-center font-bold">AI Suggestion</p>
                        <img src={result.transformedImage} alt="After" className="h-40 w-full rounded-xl object-cover shadow-lg shadow-amber-500/10" />
                      </div>
                    </div>
                    
                    <div className="rounded-2xl bg-white/5 p-4">
                      <p className="text-xs font-bold text-amber-300 uppercase tracking-widest mb-2">AI Analysis</p>
                      <p className="text-sm text-neutral-300 leading-relaxed">{result.details}</p>
                    </div>

                    <div className="flex gap-3">
                      <button onClick={reset} className="flex-1 rounded-xl border border-white/10 py-3 text-xs font-bold text-white hover:bg-white/5">
                        Try Another
                      </button>
                      <button onClick={() => { reset(); window.location.hash = '#contact'; }} className="flex-1 rounded-xl bg-amber-300 py-3 text-xs font-bold text-black hover:bg-amber-200">
                        Book This Look
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AIMakeover
