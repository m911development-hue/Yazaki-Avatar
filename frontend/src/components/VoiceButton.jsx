import { useState, useRef, useCallback } from "react"

export default function VoiceButton({ onTranscript }) {
  const [isListening, setIsListening] = useState(false)
  const [statusText, setStatusText] = useState("")
  const recognitionRef = useRef(null)
  const gotFinalRef = useRef(false)
  const statusTimerRef = useRef(null)

  const clearStatusAfter = (ms) => {
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current)
    statusTimerRef.current = setTimeout(() => setStatusText(""), ms)
  }

  const toggleListen = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setStatusText("Not supported"); return }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      setStatusText("")
      return
    }

    if (recognitionRef.current) {
      recognitionRef.current.onresult = null
      recognitionRef.current.onend = null
      recognitionRef.current.onerror = null
      try { recognitionRef.current.stop() } catch (_) {}
    }

    gotFinalRef.current = false
    const recognition = new SR()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = "en-US"
    recognitionRef.current = recognition

    recognition.onstart = () => {
      console.log("MIC STARTED")
      setIsListening(true)
      setStatusText("Listening...")
    }

    recognition.onresult = (e) => {
      console.log("RESULT FIRED", e.results.length)
      let final = ""
      let interim = ""
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) final += t
        else interim += t
      }
      console.log("final:", final, "interim:", interim)
      if (interim) setStatusText(interim)
      if (final.trim()) {
        gotFinalRef.current = true
        setIsListening(false)
        setStatusText("Sent: " + final.trim())
        clearStatusAfter(2500)
        console.log("Calling onTranscript with:", final.trim())
        if (typeof onTranscript === "function") {
          onTranscript(final.trim())
        } else {
          console.log("onTranscript is NOT a function:", onTranscript)
        }
      }
    }

    recognition.onerror = (e) => {
      console.log("MIC ERROR:", e.error)
      setIsListening(false)
      const msgs = {
        "not-allowed": "Mic blocked!",
        "no-speech": "No speech detected",
        "network": "Network error",
        "aborted": ""
      }
      const msg = msgs[e.error] ?? ("Error: " + e.error)
      if (msg) { setStatusText(msg); clearStatusAfter(3000) }
    }

    recognition.onend = () => {
      console.log("MIC ENDED, gotFinal:", gotFinalRef.current)
      setIsListening(false)
      if (!gotFinalRef.current) {
        setStatusText(prev => prev === "Listening..." ? "" : prev)
      }
    }

    try {
      recognition.start()
      console.log("recognition.start() called")
    }
    catch (err) {
      console.log("START ERROR:", err)
      setStatusText("Failed: " + err.message)
      clearStatusAfter(3000)
    }

  }, [isListening, onTranscript])

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", position: "relative" }}>
      <button
        onClick={toggleListen}
        title={isListening ? "Stop" : "Speak"}
        style={{
          width: "42px",
          height: "42px",
          borderRadius: "12px",
          background: isListening ? "rgba(239,68,68,0.25)" : "rgba(55,65,81,0.8)",
          border: isListening ? "2px solid rgba(239,68,68,0.9)" : "1px solid #374151",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "14px",
          fontWeight: "bold",
          transition: "all 0.2s",
          color: "white"
        }}
      >
        {isListening ? "STOP" : "MIC"}
      </button>

      {statusText && (
        <div style={{
          position: "absolute",
          bottom: "-34px",
          left: "50%",
          transform: "translateX(-50%)",
          whiteSpace: "nowrap",
          fontSize: "11px",
          color: "#10B981",
          background: "rgba(17,24,39,0.97)",
          padding: "4px 10px",
          borderRadius: "6px",
          border: "1px solid #374151",
          zIndex: 100
        }}>
          {statusText}
        </div>
      )}
    </div>
  )
}