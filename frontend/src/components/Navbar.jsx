import { useChat } from '../store/ChatContext'

export default function Navbar() {
  const { clearChat } = useChat()

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      height: '60px',
      background: 'rgba(17, 24, 39, 0.98)',
      borderBottom: '1px solid #374151',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px',
      backdropFilter: 'blur(12px)'
    }}>
      {/* Left - Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '160px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', boxShadow: '0 0 20px rgba(59,130,246,0.4)'
        }}>🤖</div>
        <div>
          <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Powered by</div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>Metaverse911</div>
        </div>
      </div>

      {/* Center - Title */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          fontSize: '20px', fontWeight: 700, color: 'white',
          letterSpacing: '0.5px'
        }}>M911 Copilot</div>
        <div style={{ fontSize: '11px', color: '#9CA3AF' }}>AI Knowledge Assistant</div>
      </div>

      {/* Right - Clear Button */}
      <div style={{ minWidth: '160px', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={clearChat}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', borderRadius: '8px',
            background: 'transparent', border: '1px solid #374151',
            color: '#9CA3AF', cursor: 'pointer', fontSize: '13px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#3B82F6'
            e.currentTarget.style.color = 'white'
            e.currentTarget.style.background = 'rgba(59,130,246,0.1)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#374151'
            e.currentTarget.style.color = '#9CA3AF'
            e.currentTarget.style.background = 'transparent'
          }}
        >
          🗑️ Clear Chat
        </button>
      </div>
    </div>
  )
}