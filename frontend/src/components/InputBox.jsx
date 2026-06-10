import { useState, useRef } from 'react'
import { useChat } from '../store/ChatContext'
import VoiceButton from './VoiceButton'

export default function InputBox() {
  const [input, setInput] = useState('')
  const { sendMessage, loading } = useChat()
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

  const handleInput = (e) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  // ✅ VoiceButton se transcript aaya — seedha sendMessage karo
  // Textarea mein set karne ki zaroorat nahi — direct bhejna better UX hai
 const handleVoiceTranscript = (text) => {
  if (!text?.trim() || loading) return
  sendMessage(text.trim())
}


  return (
    <div style={{
      padding: '16px',
      borderTop: '1px solid #374151',
      background: '#0B0F19'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '10px',
        background: 'rgba(31, 41, 55, 0.8)',
        border: '1px solid #374151',
        borderRadius: '16px',
        padding: '12px 16px',
      }}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKey}
          placeholder="Ask anything about Metaverse911..."
          rows={1}
          disabled={loading}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'white',
            fontSize: '14px',
            resize: 'none',
            lineHeight: '1.5',
            maxHeight: '120px',
            fontFamily: 'Inter, sans-serif',
            opacity: loading ? 0.5 : 1
          }}
        />

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0
        }}>
          {/* ✅ onTranscript seedha handleVoiceTranscript ko point karta hai */}
          <VoiceButton onTranscript={handleVoiceTranscript} />

          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: input.trim() && !loading
                ? 'linear-gradient(135deg, #3B82F6, #6366F1)'
                : '#374151',
              border: 'none',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              transition: 'all 0.2s',
              boxShadow: input.trim() && !loading
                ? '0 0 20px rgba(59,130,246,0.4)'
                : 'none'
            }}
          >
            {loading ? '⏳' : '➤'}
          </button>
        </div>
      </div>

      <p style={{
        textAlign: 'center',
        fontSize: '11px',
        color: '#4B5563',
        marginTop: '8px'
      }}>
        M911 Copilot answers only from Metaverse911 knowledge base
      </p>
    </div>
  )
}