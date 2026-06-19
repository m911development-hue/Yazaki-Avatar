import { useState, useEffect, useRef, useCallback } from 'react'

const VR_KEYWORDS = ['oculus', 'quest', 'vive', 'valve', 'vr', 'meta', 'headset', 'rift']

function isVRDevice(label = '') {
  const l = label.toLowerCase()
  return VR_KEYWORDS.some((kw) => l.includes(kw))
}

export function useVoice() {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speechEnabled, setSpeechEnabled] = useState(true)
  const [transcript, setTranscript] = useState('')
  const [liveTranscript, setLiveTranscript] = useState('')
  const [supported, setSupported] = useState(false)
  const [voiceError, setVoiceError] = useState(null)

  // Mic devices state
  const [mics, setMics] = useState([])
  const [selectedMicId, setSelectedMicId] = useState(null)

  // Language state: 'en-US' or 'hi-IN'
  const [selectedLanguage, setSelectedLanguage] = useState('en-US')

  const recognitionRef = useRef(null)
  const isListeningRef = useRef(false)
  const synthRef = useRef(null)
const audioRef = useRef(null)

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000"
  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis
      console.log('Speech Synthesis: Initialized successfully.')
      
      const checkVoices = () => {
        const voices = window.speechSynthesis.getVoices()
        console.log(`Speech Synthesis: ${voices.length} voices available.`)
      }
      
      checkVoices()
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = checkVoices
      }
    } else {
      console.warn('Speech Synthesis: Not supported in this browser.')
    }
  }, [])

  // Detect available microphones
  const detectMics = useCallback(async () => {
    console.log('Device Detection: Querying audio input devices...')

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.error('Device Detection: Browser unsupported')
      setSupported(false)
      setVoiceError('Voice input is not supported in this browser.')
      return
    }
    setSupported(true)

    // Log permission status if supported
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const res = await navigator.permissions.query({ name: 'microphone' })
        console.log('Device Detection: Browser permission status is:', res.state)
      } catch (err) {
        console.warn('Device Detection: Could not query permission status:', err)
      }
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const inputs = devices.filter((d) => d.kind === 'audioinput')

      if (inputs.length === 0) {
        console.error('Device Detection: No microphone found')
        setVoiceError('No microphone found')
        setMics([])
        return
      }

      console.log(
        'Device Detection: Found microphones:',
        inputs.map((d) => ({ label: d.label || 'Unnamed Mic', id: d.deviceId }))
      )
      setMics(inputs)

      // Priority order:
      //  1. Built-in / internal mic (non-VR)
      //  2. Any non-VR mic
      //  3. Fallback — whatever is available
      const nonVR = inputs.filter((d) => !isVRDevice(d.label))
      const builtIn = nonVR.find((d) => {
        const l = d.label.toLowerCase()
        return (
          l.includes('built') ||
          l.includes('internal') ||
          l.includes('array') ||
          l.includes('default')
        )
      })
      const chosen = builtIn || nonVR[0] || inputs[0]
      if (chosen) {
        console.log('Device Detection: Selected microphone:', chosen.label || 'Default', 'ID:', chosen.deviceId)
        setSelectedMicId((prevId) => {
          // If the previous selection is still valid, keep it; otherwise select the new chosen device
          const exists = inputs.some((d) => d.deviceId === prevId)
          return exists ? prevId : chosen.deviceId
        })
        setVoiceError(null)
      }
    } catch (err) {
      console.error('Device Detection: enumerateDevices failed:', err)
      setVoiceError('Microphone detection failed')
    }
  }, [])

  // Prompt for microphone permission
  const requestMicPermission = useCallback(async () => {
    try {
      console.log('Requesting microphone permission...')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((t) => t.stop())
      console.log('Microphone permission granted.')
      await detectMics()
      return true
    } catch (err) {
      console.error('Microphone permission request failed:', err)
      if (err.name === 'NotAllowedError' || err.message?.includes('denied')) {
        setVoiceError('Permission denied')
      } else {
        setVoiceError('Permission request failed')
      }
      return false
    }
  }, [detectMics])

  // Run diagnostics on mount and handle device change
  useEffect(() => {
    detectMics()

    const handleDeviceChange = () => {
      console.log('Device Detection: Device configuration changed (connect/disconnect)')
      detectMics()
    }

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange)
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange)
    }
  }, [detectMics])

  // Speech Recognition setup (re-runs when selectedMicId or selectedLanguage changes)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    // Clean up any existing recognition instance
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch (err) {
        console.warn('Error aborting previous recognition instance:', err)
      }
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = selectedLanguage

    recognition.onstart = () => {
      console.log("Recognition Started")
      isListeningRef.current = true
      setIsListening(true)
      setVoiceError(null)
    }

    recognition.onresult = (e) => {
      let interim = ''
      let final = ''
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) {
          final += e.results[i][0].transcript
        } else {
          interim += e.results[i][0].transcript
        }
      }

      if (interim) {
        console.log('Interim Transcript:', interim)
        setLiveTranscript(interim)
      }

      if (final) {
        console.log('Final Transcript:', final)
        setTranscript(final)
        setLiveTranscript('')
        // Explicitly stop to avoid duplicate triggers and ensure single shot safety
        try {
          recognition.stop()
        } catch (err) {}
      }
    }

    recognition.onerror = (e) => {
      console.error('Voice Recognition: onerror fired', e.error)
      if (e.error === 'aborted') {
        // 'aborted' is triggered manually, do not show as error
        return
      }
      let msg = 'Voice recognition error: ' + e.error
      if (e.error === 'not-allowed') {
        msg = 'Permission denied'
      } else if (e.error === 'no-speech') {
        msg = 'No speech detected. Please try again.'
      } else if (e.error === 'audio-capture') {
        msg = 'No microphone found'
      } else if (e.error === 'network') {
        msg = 'Network error'
      }
      setVoiceError(msg)
      isListeningRef.current = false
      setIsListening(false)
    }

    recognition.onend = () => {
      console.log("Recognition Ended")
      isListeningRef.current = false
      setIsListening(false)
      setLiveTranscript('')
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch (err) {
          console.warn('Error aborting recognition on cleanup:', err)
        }
      }
      isListeningRef.current = false
    }
  }, [selectedMicId, selectedLanguage])

  // Start Listening
  const startListening = useCallback(async () => {
    if (!supported) {
      setVoiceError('Voice input is not supported in this browser.')
      return
    }

    // Check ref synchronously to prevent concurrent start attempts
    if (isListeningRef.current) {
      console.log("Recognition Already Running")
      return
    }

    // Try request permission/labels if empty
    const hasLabels = mics.some((m) => m.label)
    if (!hasLabels) {
      const granted = await requestMicPermission()
      if (!granted) return
    }

    if (!recognitionRef.current) return

    isListeningRef.current = true
    setIsListening(true)
    setTranscript('')
    setLiveTranscript('')
    setVoiceError(null)

    // Stop speaking if playing
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
      setIsSpeaking(false)
    }

    // Direct browser to selected mic
    if (selectedMicId) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { exact: selectedMicId } },
        })
        stream.getTracks().forEach((t) => t.stop())
      } catch (err) {
        console.warn('Could not pre-acquire selected mic:', err)
      }
    }

    try {
      console.log("Recognition Start Requested")
      recognitionRef.current.start()
    } catch (e) {
      console.error('Failed to start speech recognition:', e)
      setVoiceError('Failed to start voice recognition.')
      isListeningRef.current = false
      setIsListening(false)
    }
  }, [selectedMicId, supported, mics, requestMicPermission])

  // Stop Listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListeningRef.current) {
      console.log("Recognition Stopped")
      try {
        recognitionRef.current.stop()
      } catch (e) {
        console.error('Error stopping recognition:', e)
      }
      isListeningRef.current = false
      setIsListening(false)
    }
  }, [])

  // Speak AI Response via Piper TTS backend (Prabhat voice)
  const speak = useCallback(async (text) => {
    if (!speechEnabled) return

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    const plainText = text.replace(/<[^>]*>/g, '').replace(/[*#]/g, '')
    setIsSpeaking(true)

    try {
      const response = await fetch(`${API_URL}/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: plainText }),
      })

      if (!response.ok) throw new Error(`TTS request failed: ${response.status}`)

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audioRef.current = audio

      audio.onended = () => {
        setIsSpeaking(false)
        URL.revokeObjectURL(url)
        audioRef.current = null
      }
      audio.onerror = () => {
        setIsSpeaking(false)
        URL.revokeObjectURL(url)
        audioRef.current = null
      }

      await audio.play()
    } catch (err) {
      console.error('Piper TTS error:', err)
      setIsSpeaking(false)
    }
  }, [speechEnabled, API_URL])

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setIsSpeaking(false)
  }, [])

  // Toggle Microphone
  const toggleMic = useCallback(() => {
    if (isListeningRef.current) stopListening()
    else startListening()
  }, [startListening, stopListening])

  // Toggle TTS
  const toggleSpeech = useCallback(() => {
    setSpeechEnabled((prev) => {
      if (prev) {
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current = null
        }
        setIsSpeaking(false)
      }
      return !prev
    })
  }, [])

  return {
    isListening,
    isSpeaking,
    speechEnabled,
    transcript,
    liveTranscript,
    supported,
    voiceError,
    setVoiceError,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    setTranscript,
    toggleMic,
    toggleSpeech,
    mics,
    selectedMicId,
    setSelectedMicId,
    selectedLanguage,
    setSelectedLanguage,
  }
}

