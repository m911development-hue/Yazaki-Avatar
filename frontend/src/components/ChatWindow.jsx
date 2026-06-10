import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { useChat } from '../store/ChatContext'

// Global voice stop button
function VoiceStopBar({ isSpeaking, onStop }) {
  if (!isSpeaking) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      style={{
        position: 'fixed', bottom: '100px', left: '50%',
        transform: 'translateX(-50%)', zIndex: 999,
        background: 'rgba(239,68,68,0.15)',
        border: '1px solid rgba(239,68,68,0.5)',
        borderRadius: '50px', padding: '10px 24px',
        display: 'flex', alignItems: 'center', gap: '10px',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 0 30px rgba(239,68,68,0.3)'
      }}
    >
      <motion.div
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
        style={{
          width: '10px', height: '10px',
          borderRadius: '50%', background: '#EF4444'
        }}
      />
      <span style={{ color: '#FCA5A5', fontSize: '13px', fontWeight: 500 }}>
        AI is speaking...
      </span>
      <button
        onClick={onStop}
        style={{
          background: 'rgba(239,68,68,0.3)',
          border: '1px solid rgba(239,68,68,0.6)',
          borderRadius: '20px', padding: '4px 14px',
          color: 'white', cursor: 'pointer', fontSize: '12px',
          fontWeight: 600, transition: 'all 0.2s'
        }}
        onMouseEnter={e => e.target.style.background = 'rgba(239,68,68,0.6)'}
        onMouseLeave={e => e.target.style.background = 'rgba(239,68,68,0.3)'}
      >
        ⏹ Stop
      </button>
    </motion.div>
  )
}

function MessageBubble({ msg }) {
  const [copied, setCopied] = useState(false)
  const isBot = msg.role === 'assistant'

  const copy = () => {
    navigator.clipboard.writeText(msg.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex', gap: '12px',
        justifyContent: isBot ? 'flex-start' : 'flex-end',
        marginBottom: '16px'
      }}
    >
      {isBot && (
        <div style={{
          width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
          background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', marginTop: '2px',
          boxShadow: '0 0 12px rgba(59,130,246,0.4)'
        }}>🤖</div>
      )}

      <div style={{ maxWidth: '72%', position: 'relative' }}>
        <div style={{
          padding: '12px 16px',
          borderRadius: isBot ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
          background: isBot
            ? 'linear-gradient(135deg, rgba(31,41,55,0.95), rgba(17,24,39,0.95))'
            : 'linear-gradient(135deg, #3B82F6, #6366F1)',
          border: isBot ? '1px solid rgba(55,65,81,0.8)' : 'none',
          boxShadow: isBot ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(59,130,246,0.4)',
          color: 'white', fontSize: '14px', lineHeight: '1.6'
        }}>
          {isBot ? (
            <ReactMarkdown
              components={{
                p: ({children}) => <p style={{margin: '4px 0'}}>{children}</p>,
                ul: ({children}) => <ul style={{margin: '6px 0', paddingLeft: '20px'}}>{children}</ul>,
                li: ({children}) => <li style={{margin: '2px 0'}}>{children}</li>,
                strong: ({children}) => <strong style={{color: '#93C5FD'}}>{children}</strong>,
                a: ({href, children}) => (
                  <a href={href} target="_blank" rel="noopener noreferrer"
                    style={{color: '#60A5FA', textDecoration: 'underline'}}>{children}</a>
                )
              }}
            >
              {msg.content}
            </ReactMarkdown>
          ) : (
            <p style={{margin: 0}}>{msg.content}</p>
          )}
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          marginTop: '4px',
          justifyContent: isBot ? 'flex-start' : 'flex-end'
        }}>
          <span style={{ fontSize: '11px', color: '#4B5563' }}>{msg.timestamp}</span>
          {isBot && (
            <button
              onClick={copy}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '12px', color: copied ? '#10B981' : '#6B7280',
                padding: '2px 6px', borderRadius: '4px', transition: 'all 0.2s'
              }}
            >
              {copied ? '✅ Copied' : '📋 Copy'}
            </button>
          )}
        </div>
      </div>

      {!isBot && (
        <div style={{
          width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
          background: 'rgba(55,65,81,0.8)', border: '1px solid #374151',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', marginTop: '2px'
        }}>👤</div>
      )}
    </motion.div>
  )
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}
    >
      <div style={{
        width: '34px', height: '34px', borderRadius: '10px',
        background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '16px', boxShadow: '0 0 12px rgba(59,130,246,0.4)'
      }}>🤖</div>
      <div style={{
        padding: '14px 18px', borderRadius: '4px 16px 16px 16px',
        background: 'linear-gradient(135deg, rgba(31,41,55,0.95), rgba(17,24,39,0.95))',
        border: '1px solid rgba(55,65,81,0.8)',
        display: 'flex', alignItems: 'center', gap: '6px'
      }}>
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6' }}
            animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </motion.div>
  )
}

function WelcomeScreen() {
  const { sendMessage } = useChat()
  const suggestions = [
    "What services does Metaverse911 offer?",
    "Tell me about VR training solutions",
    "What is Metaverse911?",
    "Tell me about AR solutions"
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        height: '100%', gap: '24px', textAlign: 'center', padding: '40px'
      }}
    >
      <motion.div
        animate={{ boxShadow: ['0 0 20px rgba(59,130,246,0.3)', '0 0 40px rgba(59,130,246,0.6)', '0 0 20px rgba(59,130,246,0.3)'] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          width: '80px', height: '80px', borderRadius: '24px',
          background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '36px'
        }}
      >🤖</motion.div>

      <div>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'white', margin: '0 0 8px 0' }}>
          M911 Copilot
        </h2>
        <p style={{ color: '#9CA3AF', fontSize: '15px', maxWidth: '400px', lineHeight: 1.6 }}>
          Your AI assistant for everything about Metaverse911 — services, VR/AR solutions, projects & more.
        </p>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '10px', width: '100%', maxWidth: '480px'
      }}>
        {suggestions.map((q, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => sendMessage(q)}
            style={{
              padding: '12px 14px',
              background: 'rgba(31,41,55,0.8)',
              border: '1px solid #374151',
              borderRadius: '12px', cursor: 'pointer',
              color: '#D1D5DB', fontSize: '13px',
              textAlign: 'left', lineHeight: 1.4,
              transition: 'all 0.2s', fontFamily: 'Inter, sans-serif'
            }}
          >
            💬 {q}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

export default function ChatWindow() {
  const { messages, loading } = useChat()
  const bottomRef = useRef(null)
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Voice Output
  useEffect(() => {
    const lastMsg = messages[messages.length - 1]
    if (lastMsg?.role === 'assistant' && lastMsg?.content && !lastMsg?.error) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(lastMsg.content)
      utterance.lang = 'en-US'
      utterance.rate = 0.95
      utterance.pitch = 1
      utterance.volume = 1
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
    }
  }, [messages])

  const stopSpeaking = () => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  return (
    <div style={{
      flex: 1, overflowY: 'auto', padding: '24px',
      background: 'linear-gradient(180deg, #0B0F19 0%, #0F1420 100%)',
      position: 'relative'
    }}>
      {messages.length === 0 ? (
        <WelcomeScreen />
      ) : (
        <AnimatePresence>
          {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
          {loading && <TypingIndicator />}
        </AnimatePresence>
      )}
      <div ref={bottomRef} />

      {/* Stop Speaking Button */}
      <AnimatePresence>
        <VoiceStopBar isSpeaking={isSpeaking} onStop={stopSpeaking} />
      </AnimatePresence>
    </div>
  )
}