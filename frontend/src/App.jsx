import { useContext, useEffect } from 'react'
import { ChatContext } from './store/ChatContext'
import { useVoice } from './hooks/useVoice'
import AssistantAvatar from './components/AssistantAvatar'
import ChatSidebar from './components/ChatSidebar'
import VoiceControls from './components/VoiceControls'
import Navbar from './components/Navbar'
import './index.css'

export default function App() {
  const { messages, loading, sendMessage, clearChat, images, sources } = useContext(ChatContext)
  const {
    isListening,
    isSpeaking,
    speechEnabled,
    toggleMic,
    toggleSpeech,
    stopSpeaking,
    transcript,
    setTranscript,
    speak,
    mics,
    selectedMicId,
    setSelectedMicId,
    selectedLanguage,
    setSelectedLanguage,
    liveTranscript,
    voiceError,
    setVoiceError,
  } = useVoice()

  useEffect(() => {
    if (!speechEnabled) return
    const last = messages[messages.length - 1]
    if (last?.role === 'assistant' && last.content) {
      console.log('AI Response Received:', last.content)
      console.log('Speaking Response')
      speak(last.content)
    }
  }, [messages, speechEnabled, speak])

  useEffect(() => {
    if (transcript !== undefined && transcript !== null) {
      if (transcript === '') return // ignore empty default state
      
      const trimmed = transcript.trim()
      if (trimmed.length === 0) {
        console.warn('Transcript Validation: Empty or whitespace-only transcript received.')
        setVoiceError('Transcript is empty. Please speak clearly.')
        setTranscript('')
        return
      }

      console.log('Sending Transcript to AI:', trimmed)
      sendMessage(trimmed)
      setTranscript('')
    }
  }, [transcript, sendMessage, setTranscript, setVoiceError])

  const assistantState = isListening ? 'listening' : isSpeaking ? 'speaking' : loading ? 'thinking' : 'idle'

  return (
    <div className="app-root">
      <Navbar onClear={clearChat} />

      <div className="main-area">
        {/* LEFT — Avatar + Voice Controls */}
        <div className="avatar-section">
          <AssistantAvatar state={assistantState} />
          <VoiceControls
            isListening={isListening}
            isSpeaking={isSpeaking}
            speechEnabled={speechEnabled}
            toggleMic={toggleMic}
            toggleSpeech={toggleSpeech}
            stopSpeaking={stopSpeaking}
            onClear={clearChat}
            mics={mics}
            selectedMicId={selectedMicId}
            onSelectMic={setSelectedMicId}
            selectedLanguage={selectedLanguage}
            onSelectLanguage={setSelectedLanguage}
            liveTranscript={liveTranscript}
            voiceError={voiceError}
          />
        </div>

        {/* RIGHT — Chat */}
        <div className="chat-section">
          <ChatSidebar
            messages={messages}
            loading={loading}
            images={[]}
            sources={[]}
            onSend={sendMessage}
          />
        </div>
      </div>
    </div>
  )
}