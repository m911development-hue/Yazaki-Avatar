import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const VR_KEYWORDS = ['oculus', 'quest', 'vive', 'valve', 'vr', 'meta', 'headset', 'rift']
const isVRDevice = (label = '') => VR_KEYWORDS.some((kw) => label.toLowerCase().includes(kw))

function CtrlBtn({ onClick, active, color, title, children }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      title={title}
      style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        border: `1.5px solid ${active ? color : 'rgba(255,255,255,0.1)'}`,
        background: active
          ? `radial-gradient(circle, ${color}22, ${color}08)`
          : 'rgba(255,255,255,0.04)',
        color: active ? color : '#8899aa',
        fontSize: 18,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(10px)',
        boxShadow: active ? `0 0 18px ${color}44` : 'none',
        transition: 'all 0.2s',
      }}
    >
      {children}
    </motion.button>
  )
}

export default function VoiceControls({
  isListening,
  isSpeaking,
  speechEnabled,
  toggleMic,
  toggleSpeech,
  stopSpeaking,
  onClear,
  mics = [],
  selectedMicId,
  onSelectMic,
  selectedLanguage = 'en-US',
  onSelectLanguage,
  liveTranscript = '',
  voiceError = null,
}) {
  const [showMicPicker, setShowMicPicker] = useState(false)
  const selectedMic = mics.find((m) => m.deviceId === selectedMicId)
  const hasMultipleMics = mics.length > 1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      
      {/* Live Transcript Preview */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{
              color: liveTranscript ? '#00e5ff' : 'rgba(255, 255, 255, 0.4)',
              fontSize: 13,
              fontStyle: 'italic',
              background: 'rgba(0, 229, 255, 0.05)',
              border: '1px solid rgba(0, 229, 255, 0.15)',
              borderRadius: 12,
              padding: '8px 16px',
              textAlign: 'center',
              maxWidth: 280,
              wordBreak: 'break-word',
              boxShadow: '0 4px 15px rgba(0,229,255,0.05)',
            }}
          >
            {liveTranscript ? `"${liveTranscript}"` : 'Listening...'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Error Display */}
      <AnimatePresence>
        {voiceError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{
              color: '#ef4444',
              fontSize: 12,
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 8,
              padding: '6px 12px',
              textAlign: 'center',
              maxWidth: 240,
              wordBreak: 'break-word',
            }}
          >
            ⚠️ {voiceError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Picker & Configuration Row */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Mic device picker pill */}
        {hasMultipleMics && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMicPicker((v) => !v)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 20,
                padding: '4px 12px',
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.6)',
                fontSize: 11,
              }}
            >
              <span>🎤</span>
              <span style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 150,
              }}>
                {selectedMic?.label || 'Default mic'}
              </span>
              <span style={{
                display: 'inline-block',
                transform: showMicPicker ? 'rotate(180deg)' : 'rotate(0)',
                transition: 'transform 0.15s',
                fontSize: 9,
              }}>▼</span>
            </button>

            <AnimatePresence>
              {showMicPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#0f1a2e',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 10,
                    padding: '6px 0',
                    minWidth: 230,
                    zIndex: 200,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  }}
                >
                  <p style={{
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.3)',
                    margin: '4px 12px 6px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}>
                    Select microphone
                  </p>
                  {mics.map((mic) => {
                    const vr = isVRDevice(mic.label)
                    const sel = mic.deviceId === selectedMicId
                    return (
                      <button
                        key={mic.deviceId}
                        onClick={() => { onSelectMic?.(mic.deviceId); setShowMicPicker(false) }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          width: '100%',
                          padding: '8px 12px',
                          background: sel ? 'rgba(0,229,255,0.08)' : 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: vr ? 'rgba(255,255,255,0.3)' : sel ? '#00e5ff' : 'rgba(255,255,255,0.8)',
                          fontSize: 13,
                          textAlign: 'left',
                        }}
                      >
                        <span style={{ fontSize: 10 }}>{sel ? '●' : '○'}</span>
                        <span style={{
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {mic.label || `Mic ${mic.deviceId.slice(0, 6)}`}
                        </span>
                        {vr && (
                          <span style={{
                            fontSize: 10,
                            background: 'rgba(186,117,23,0.25)',
                            color: '#FAC775',
                            borderRadius: 4,
                            padding: '1px 5px',
                            flexShrink: 0,
                          }}>
                            VR
                          </span>
                        )}
                      </button>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Language selector pill */}
        <div>
          <button
            onClick={() => onSelectLanguage?.(selectedLanguage === 'en-US' ? 'hi-IN' : 'en-US')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 20,
              padding: '4px 12px',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.6)',
              fontSize: 11,
              transition: 'all 0.2s',
            }}
          >
            <span>🌐</span>
            <span>{selectedLanguage === 'en-US' ? 'English (en-US)' : 'Hindi (hi-IN)'}</span>
          </button>
        </div>
      </div>

      {/* Original pill with all buttons — untouched */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 24px',
        background: 'rgba(10, 22, 40, 0.85)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 50,
        boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
      }}>

        <motion.button
          onClick={toggleMic}
          animate={isListening ? {
            boxShadow: ['0 0 0px #00e5ff', '0 0 24px #00e5ff88', '0 0 0px #00e5ff']
          } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          title={isListening ? 'Stop listening' : 'Start listening'}
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            border: `2px solid ${isListening ? '#00e5ff' : 'rgba(0,229,255,0.3)'}`,
            background: isListening
              ? 'linear-gradient(135deg, rgba(0,229,255,0.25), rgba(0,180,216,0.15))'
              : 'rgba(255,255,255,0.05)',
            color: isListening ? '#00e5ff' : '#8899aa',
            fontSize: 22,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s',
          }}
        >
          {isListening ? '🎙️' : '🎤'}
        </motion.button>

        <CtrlBtn onClick={toggleSpeech} active={speechEnabled} color="#7c3aed" title={speechEnabled ? 'Mute AI' : 'Unmute AI'}>
          {speechEnabled ? '🔊' : '🔇'}
        </CtrlBtn>

        <AnimatePresence>
          {isSpeaking && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CtrlBtn onClick={stopSpeaking} active={true} color="#f97316" title="Stop speaking">
                ⏹
              </CtrlBtn>
            </motion.div>
          )}
        </AnimatePresence>

        <CtrlBtn onClick={onClear} active={false} color="#ef4444" title="Clear chat">
          🗑
        </CtrlBtn>
      </div>

    </div>
  )
}