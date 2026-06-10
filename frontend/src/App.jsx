import { useState, useRef } from 'react'
import { ChatProvider, useChat } from './store/ChatContext'
import Navbar from './components/Navbar'
import ChatWindow from './components/ChatWindow'
import KnowledgePanel from './components/KnowledgePanel'

function VoiceMic({ onTranscript }) {
  const [isListening, setIsListening] = useState(false)
  const [status, setStatus] = useState('')

  const handleClick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setStatus('Not supported')
      return
    }

    if (isListening) {
      setIsListening(false)
      setStatus('')
      return
    }

    const r = new SpeechRecognition()
    r.lang = 'en-US'
    r.continuous = false
    r.interimResults = false

    r.onstart = () => { setIsListening(true); setStatus('Listening...') }

    r.onresult = (e) => {
      const text = e.results[0][0].transcript
      console.log('Voice text:', text)
      setIsListening(false)
      setStatus('✅ ' + text)
      setTimeout(() => setStatus(''), 2000)
      onTranscript(text)
    }

    r.onerror = (e) => {
      console.error('Voice error:', e.error)
      setIsListening(false)
      setStatus('Error: ' + e.error)
      setTimeout(() => setStatus(''), 3000)
    }

    r.onend = () => { setIsListening(false) }

    r.start()
  }

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <button
        onClick={handleClick}
        style={{
          width: '42px', height: '42px', borderRadius: '12px',
          background: isListening ? 'rgba(239,68,68,0.25)' : 'rgba(55,65,81,0.8)',
          border: isListening ? '2px solid #EF4444' : '1px solid #374151',
          cursor: 'pointer', fontSize: '20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: isListening ? '0 0 20px rgba(239,68,68,0.5)' : 'none',
          transition: 'all 0.2s'
        }}
      >
        {isListening ? '🔴' : '🎤'}
      </button>
      {status && (
        <div style={{
          position: 'absolute', bottom: '-28px', left: '50%',
          transform: 'translateX(-50%)', whiteSpace: 'nowrap',
          fontSize: '11px', color: '#10B981',
          background: 'rgba(17,24,39,0.95)', padding: '2px 8px',
          borderRadius: '6px', border: '1px solid #374151', zIndex: 100
        }}>
          {status}
        </div>
      )}
    </div>
  )
}

function ChatLayout() {
  const { sendMessage, loading } = useChat()
  const [input, setInput] = useState('')
  const textareaRef = useRef(null)

  const handleSend = () => {
    if (!input.trim() || loading) return
    sendMessage(input.trim())
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleVoice = (text) => {
    console.log('Sending voice message:', text)
    if (text && text.trim()) {
      sendMessage(text.trim())
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0B0F19',
      color: 'white', display: 'flex', flexDirection: 'column'
    }}>
      <Navbar />
      <div style={{
        display: 'flex', marginTop: '60px',
        height: 'calc(100vh - 60px)', overflow: 'hidden'
      }}>
        {/* Chat 70% */}
        <div style={{
          width: '70%', display: 'flex',
          flexDirection: 'column', borderRight: '1px solid #374151'
        }}>
          <ChatWindow />

          {/* Input Box */}
          <div style={{
            padding: '16px', borderTop: '1px solid #374151',
            background: '#0B0F19'
          }}>
            <div style={{
              display: 'flex', alignItems: 'flex-end', gap: '10px',
              background: 'rgba(31,41,55,0.8)', border: '1px solid #374151',
              borderRadius: '16px', padding: '12px 16px'
            }}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                }}
                onKeyDown={handleKey}
                placeholder="Ask anything about Metaverse911..."
                rows={1}
                disabled={loading}
                style={{
                  flex: 1, background: 'transparent', border: 'none',
                  outline: 'none', color: 'white', fontSize: '14px',
                  resize: 'none', lineHeight: '1.5', maxHeight: '120px',
                  fontFamily: 'Inter, sans-serif', opacity: loading ? 0.5 : 1
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <VoiceMic onTranscript={handleVoice} />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  style={{
                    width: '42px', height: '42px', borderRadius: '12px',
                    background: input.trim() && !loading
                      ? 'linear-gradient(135deg, #3B82F6, #6366F1)' : '#374151',
                    border: 'none',
                    cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', transition: 'all 0.2s',
                    boxShadow: input.trim() && !loading ? '0 0 20px rgba(59,130,246,0.4)' : 'none'
                  }}
                >
                  {loading ? '⏳' : '➤'}
                </button>
              </div>
            </div>
            <p style={{
              textAlign: 'center', fontSize: '11px',
              color: '#4B5563', marginTop: '8px'
            }}>
              M911 Copilot answers only from Metaverse911 knowledge base
            </p>
          </div>
        </div>

        {/* Knowledge Panel 30% */}
        <div style={{ width: '30%', background: '#111827', overflowY: 'auto' }}>
          <KnowledgePanel />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ChatProvider>
      <ChatLayout />
    </ChatProvider>
  )
}