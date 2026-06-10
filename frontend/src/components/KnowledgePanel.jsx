import { AnimatePresence, motion } from 'framer-motion'
import { useChat } from '../store/ChatContext'

export default function KnowledgePanel() {
  const { images, sources, topic } = useChat()
  const hasContent = images.length > 0 || sources.length > 0

  return (
    <div style={{ padding: '20px', height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', alignItems: 'center', gap: '8px', 
        marginBottom: '20px',
        paddingBottom: '12px',
        borderBottom: '1px solid #374151'
      }}>
        <span style={{ fontSize: '18px' }}>🔍</span>
        <span style={{ fontWeight: 600, fontSize: '14px' }}>Knowledge Explorer</span>
      </div>

      {/* Topic Badge */}
      {topic && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(59,130,246,0.1)',
            border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: '20px', padding: '4px 12px',
            marginBottom: '16px'
          }}
        >
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3B82F6' }} />
          <span style={{ fontSize: '12px', color: '#3B82F6', textTransform: 'capitalize' }}>
            {topic.replace('_', ' ')}
          </span>
        </motion.div>
      )}

      {/* Empty State */}
      {!hasContent && (
        <div style={{ 
          display: 'flex', flexDirection: 'column', 
          alignItems: 'center', justifyContent: 'center',
          height: '300px', gap: '12px', textAlign: 'center'
        }}>
          <span style={{ fontSize: '40px', opacity: 0.3 }}>📚</span>
          <p style={{ color: '#9CA3AF', fontSize: '13px', maxWidth: '200px' }}>
            Ask a question to explore related content from Metaverse911
          </p>
        </div>
      )}

      <AnimatePresence>
        {/* Images */}
        {images.length > 0 && (
          <motion.div
            key="images"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: '24px' }}
          >
            <div style={{ 
              fontSize: '11px', color: '#9CA3AF', 
              textTransform: 'uppercase', letterSpacing: '1px',
              marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              <span>🖼️</span> Related Images
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {images.map((img, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  style={{
                    borderRadius: '10px', overflow: 'hidden',
                    border: '1px solid #374151',
                    background: '#1F2937'
                  }}
                >
                  <img
                    src={img.url}
                    alt={img.alt || 'Metaverse911'}
                    style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                    onError={(e) => { e.target.parentElement.style.display = 'none' }}
                  />
                  {img.alt && (
                    <div style={{ padding: '8px 10px' }}>
                      <p style={{ fontSize: '11px', color: '#9CA3AF', 
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {img.alt}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Sources */}
        {sources.length > 0 && (
          <motion.div
            key="sources"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div style={{ 
              fontSize: '11px', color: '#9CA3AF',
              textTransform: 'uppercase', letterSpacing: '1px',
              marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              <span>🔗</span> Sources
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {sources.map((src, i) => (
                <motion.a
                  key={i}
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 10px', borderRadius: '8px',
                    background: '#1F2937', border: '1px solid transparent',
                    textDecoration: 'none', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#3B82F6'
                    e.currentTarget.style.background = 'rgba(59,130,246,0.1)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'transparent'
                    e.currentTarget.style.background = '#1F2937'
                  }}
                >
                  <span style={{ color: '#3B82F6', fontSize: '12px' }}>🔗</span>
                  <span style={{ 
                    fontSize: '11px', color: '#9CA3AF',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}>
                    {src.replace('https://', '').replace('http://', '').replace('www.', '')}
                  </span>
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}