import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, VolumeX, StopCircle, Trash2, ChevronDown } from "lucide-react";

const VR_KEYWORDS = ['oculus', 'quest', 'vive', 'valve', 'vr', 'meta', 'headset', 'rift']
const isVRDevice = (label = '') => VR_KEYWORDS.some((kw) => label.toLowerCase().includes(kw))

export default function VoiceButton({
  isListening,
  isSpeaking,
  speechEnabled,
  onToggleMic,
  onToggleSpeech,
  onStopSpeaking,
  onClearChat,
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

  const buttons = [
    {
      id: "mic",
      icon: isListening ? <MicOff size={22} /> : <Mic size={22} />,
      label: isListening ? "Stop Mic" : "Start Mic",
      onClick: onToggleMic,
      active: isListening,
      color: "cyan",
      pulse: isListening,
    },
    {
      id: "speaker",
      icon: speechEnabled ? <Volume2 size={22} /> : <VolumeX size={22} />,
      label: speechEnabled ? "Mute TTS" : "Unmute TTS",
      onClick: onToggleSpeech,
      active: speechEnabled,
      color: "teal",
    },
    {
      id: "stop",
      icon: <StopCircle size={22} />,
      label: "Stop Speaking",
      onClick: onStopSpeaking,
      active: isSpeaking,
      color: "purple",
    },
    {
      id: "clear",
      icon: <Trash2 size={22} />,
      label: "Clear Chat",
      onClick: onClearChat,
      color: "red",
    },
  ];

  return (
    <motion.div
      className="voice-controls"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}
    >
      {/* Live Transcript Preview */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              color: liveTranscript ? "#00e5ff" : "rgba(255, 255, 255, 0.4)",
              fontSize: 13,
              fontStyle: "italic",
              background: "rgba(0, 229, 255, 0.05)",
              border: "1px solid rgba(0, 229, 255, 0.15)",
              borderRadius: 12,
              padding: "8px 16px",
              textAlign: "center",
              maxWidth: 280,
              wordBreak: "break-word",
              boxShadow: "0 4px 15px rgba(0,229,255,0.05)",
            }}
          >
            {liveTranscript ? `"${liveTranscript}"` : "Listening..."}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Error Display */}
      <AnimatePresence>
        {voiceError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              color: "#ef4444",
              fontSize: 12,
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              borderRadius: 8,
              padding: "6px 12px",
              textAlign: "center",
              maxWidth: 240,
              wordBreak: "break-word",
            }}
          >
            ⚠️ {voiceError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Picker & Configuration Row */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 8 }}>
        {/* Mic picker */}
        {hasMultipleMics && (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowMicPicker((v) => !v)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 20,
                padding: "4px 12px",
                cursor: "pointer",
                color: "rgba(255,255,255,0.7)",
                fontSize: 12,
                maxWidth: 220,
              }}
            >
              <Mic size={12} />
              <span style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: 160,
              }}>
                {selectedMic?.label || "Default mic"}
              </span>
              <ChevronDown size={12} style={{
                transform: showMicPicker ? "rotate(180deg)" : "rotate(0)",
                transition: "transform 0.15s",
                flexShrink: 0,
              }} />
            </button>

            <AnimatePresence>
              {showMicPicker && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: "absolute",
                    bottom: "100%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    marginBottom: 4,
                    background: "#1a1a2e",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 10,
                    padding: "6px 0",
                    minWidth: 230,
                    zIndex: 200,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                  }}
                >
                  <p style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.35)",
                    margin: "4px 12px 6px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}>
                    Select microphone
                  </p>
                  {mics.map((mic) => {
                    const vr = isVRDevice(mic.label)
                    const sel = mic.deviceId === selectedMicId
                    return (
                      <button
                        key={mic.deviceId}
                        onClick={() => {
                          onSelectMic?.(mic.deviceId)
                          setShowMicPicker(false)
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          width: "100%",
                          padding: "8px 12px",
                          background: sel ? "rgba(255,255,255,0.08)" : "none",
                          border: "none",
                          cursor: "pointer",
                          color: vr ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.85)",
                          fontSize: 13,
                          textAlign: "left",
                        }}
                      >
                        <span style={{ fontSize: 10 }}>{sel ? "●" : "○"}</span>
                        <span style={{
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                          {mic.label || `Mic ${mic.deviceId.slice(0, 6)}`}
                        </span>
                        {vr && (
                          <span style={{
                            fontSize: 10,
                            background: "rgba(186,117,23,0.3)",
                            color: "#FAC775",
                            borderRadius: 4,
                            padding: "1px 5px",
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

        {/* Language switcher */}
        <div>
          <button
            onClick={() => onSelectLanguage?.(selectedLanguage === 'en-US' ? 'hi-IN' : 'en-US')}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 20,
              padding: "4px 12px",
              cursor: "pointer",
              color: "rgba(255,255,255,0.7)",
              fontSize: 12,
              transition: "all 0.2s",
            }}
          >
            <span>🌐</span>
            <span>{selectedLanguage === 'en-US' ? 'English (en-US)' : 'Hindi (hi-IN)'}</span>
          </button>
        </div>
      </div>

      {/* Control buttons pill */}
      <div style={{ display: "flex", gap: 10 }}>
        {buttons.map((btn) => (
          <motion.button
            key={btn.id}
            className={`voice-btn voice-btn--${btn.color} ${btn.active ? "voice-btn--active" : ""}`}
            onClick={btn.onClick}
            whileHover={{ scale: 1.12, y: -3 }}
            whileTap={{ scale: 0.9 }}
            title={btn.label}
          >
            {btn.pulse && (
              <span className="mic-pulse-ring" />
            )}
            {btn.icon}
            <span className="voice-btn-label">{btn.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}