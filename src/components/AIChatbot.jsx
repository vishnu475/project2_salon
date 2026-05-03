import { useState, useEffect, useRef } from 'react'
import { ROOT_URL } from '../config'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Sparkles, User, Bot, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'

function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hello! I am your Salon Luxe AI assistant. How can I help you today?',
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = { id: Date.now(), type: 'user', text: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      const response = await fetch(`${ROOT_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      })
      const data = await response.json()
      
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, type: 'bot', text: data.reply, action: data.action },
      ])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, type: 'bot', text: 'Sorry, I am having trouble connecting right now.' },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="fixed bottom-8 left-8 z-[70] md:bottom-10 md:left-10">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 flex h-[500px] w-[350px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-neutral-900 shadow-2xl backdrop-blur-xl md:w-[400px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-amber-300 px-6 py-4 text-black">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-amber-300">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Luxe AI</h3>
                  <p className="text-[10px] font-medium opacity-70">Always Online</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="rounded-full p-1 hover:bg-black/10">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-none"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex max-w-[85%] gap-3 ${
                      msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ${
                        msg.type === 'user' ? 'bg-amber-300/20' : 'bg-neutral-800 border border-white/5'
                      }`}
                    >
                      {msg.type === 'user' ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    <div className="space-y-2">
                      <div
                        className={`rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                          msg.type === 'user'
                            ? 'bg-amber-300 text-black font-medium'
                            : 'bg-neutral-800 text-neutral-200'
                        }`}
                      >
                        {msg.text}
                      </div>
                      {msg.action === 'book' && (
                        <Link
                          to="/book"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-white/20"
                        >
                          <Calendar size={14} />
                          Go to Booking Page
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 border border-white/5 text-white">
                      <Bot size={14} />
                    </div>
                    <div className="flex items-center gap-1 rounded-2xl bg-neutral-800 px-4 py-3">
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-500" />
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-500 [animation-delay:0.2s]" />
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-500 [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 border-t border-white/5 bg-black/10 px-4 py-3 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setInput('I want to book an appointment')}
                className="whitespace-nowrap rounded-full border border-amber-300/30 bg-amber-300/5 px-3 py-1.5 text-[10px] font-semibold text-amber-300 transition hover:bg-amber-300 hover:text-black"
              >
                📅 Book Now
              </button>
              <button
                onClick={() => setInput('What services do you offer?')}
                className="whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold text-white transition hover:bg-white/10 hover:text-amber-300"
              >
                ✂️ Services
              </button>
              <button
                onClick={() => setInput('Current offers?')}
                className="whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold text-white transition hover:bg-white/10 hover:text-amber-300"
              >
                🎁 Offers
              </button>
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="border-t border-white/5 p-4 bg-black/20">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-neutral-800 px-4 py-1 focus-within:border-amber-300/50">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about services or booking..."
                  className="flex-1 bg-transparent py-2 text-sm text-white outline-none placeholder:text-neutral-500"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="text-amber-300 transition hover:scale-110 disabled:opacity-30"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-300 text-black shadow-2xl transition hover:scale-110 hover:bg-amber-200 active:scale-95"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        <span className="absolute -right-1 -top-1 flex h-4 w-4">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex h-4 w-4 rounded-full bg-amber-500" />
        </span>
      </button>
    </div>
  )
}

export default AIChatbot
