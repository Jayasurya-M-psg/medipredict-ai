import { useState, useRef, useEffect } from 'react'
import './Chatbot.css'

const RESPONSES = {
  greet: ["Hello! 👋 I'm MediBot, your health assistant. Ask me about symptoms, diseases, or general health tips!", "Hi there! How can I help you with your health today?"],
  fever: ["Fever is a temporary increase in body temperature. Stay hydrated, rest well, and take paracetamol if above 38.5°C. Consult a doctor if it persists beyond 3 days."],
  headache: ["Headaches can be caused by dehydration, stress, or migraine. Try resting in a dark room, drinking water, and taking OTC painkillers. See a doctor if severe or recurring."],
  diabetes: ["Diabetes symptoms include excessive thirst, frequent urination, fatigue, and blurry vision. Use our AI Diabetes Risk Predictor for a detailed assessment!"],
  heart: ["Heart disease warning signs include chest pain, shortness of breath, and irregular heartbeat. Use our Heart Disease Risk Predictor for assessment!"],
  symptoms: ["You can use our Symptom Checker to analyze your symptoms and get AI-powered disease predictions. Go to the Predict page!"],
  diet: ["A balanced diet includes fruits, vegetables, whole grains, lean proteins, and healthy fats. Limit sugar, salt, and processed foods."],
  exercise: ["Adults should aim for at least 150 minutes of moderate exercise per week. This reduces risk of heart disease, diabetes, and obesity."],
  stress: ["Manage stress through meditation, deep breathing, regular exercise, good sleep (7-8 hours), and social connections."],
  sleep: ["Adults need 7-9 hours of quality sleep. Poor sleep is linked to heart disease, diabetes, and weakened immunity."],
  blood_pressure: ["Normal BP is below 120/80 mmHg. High BP (≥130/80) is called hypertension. Reduce salt, exercise regularly, and take prescribed medication."],
  covid: ["COVID-19 symptoms include fever, cough, fatigue, and loss of smell/taste. Isolate yourself, rest, stay hydrated, and consult a doctor."],
  default: ["I can answer general health questions. Try asking about fever, headache, diabetes, heart disease, diet, exercise, or sleep.", "I'm here to help! Ask me about common symptoms, diseases, or healthy lifestyle tips."],
}

function getResponse(input) {
  const text = input.toLowerCase()
  if (/(hi|hello|hey|greet)/i.test(text)) return RESPONSES.greet[Math.floor(Math.random() * RESPONSES.greet.length)]
  if (/(fever|temperature|hot)/i.test(text)) return RESPONSES.fever[0]
  if (/(headache|head pain|migraine)/i.test(text)) return RESPONSES.headache[0]
  if (/(diabetes|blood sugar|glucose)/i.test(text)) return RESPONSES.diabetes[0]
  if (/(heart|chest pain|cardiac)/i.test(text)) return RESPONSES.heart[0]
  if (/(symptom|predict|disease|diagnos)/i.test(text)) return RESPONSES.symptoms[0]
  if (/(diet|food|nutrition|eat)/i.test(text)) return RESPONSES.diet[0]
  if (/(exercise|workout|fitness|gym)/i.test(text)) return RESPONSES.exercise[0]
  if (/(stress|anxiety|mental|depress)/i.test(text)) return RESPONSES.stress[0]
  if (/(sleep|insomnia|rest)/i.test(text)) return RESPONSES.sleep[0]
  if (/(blood pressure|bp|hypertension)/i.test(text)) return RESPONSES.blood_pressure[0]
  if (/(covid|corona|virus)/i.test(text)) return RESPONSES.covid[0]
  return RESPONSES.default[Math.floor(Math.random() * RESPONSES.default.length)]
}

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { from: 'bot', text: "Hi! I'm MediBot 🤖 Ask me anything about health!" }
  ])
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = () => {
    const text = input.trim()
    if (!text) return
    const userMsg = { from: 'user', text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTimeout(() => {
      const botMsg = { from: 'bot', text: getResponse(text) }
      setMessages(prev => [...prev, botMsg])
    }, 500)
  }

  const handleKey = (e) => { if (e.key === 'Enter') send() }

  return (
    <>
      <button className={`chat-fab ${open ? 'open' : ''}`} onClick={() => setOpen(!open)} id="chatbot-fab" aria-label="Open chatbot">
        {open ? '✕' : '💬'}
        {!open && <span className="chat-pulse"></span>}
      </button>

      {open && (
        <div className="chatbot-window animate-fade-in-up" id="chatbot-window">
          <div className="chat-header">
            <div className="chat-avatar">🤖</div>
            <div>
              <div className="chat-name">MediBot</div>
              <div className="chat-status">● Online</div>
            </div>
          </div>
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.from}`}>
                {msg.text}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="chat-input-area">
            <input
              id="chatbot-input"
              type="text"
              className="chat-input"
              placeholder="Ask about symptoms, diseases..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
            />
            <button className="chat-send" onClick={send} id="chatbot-send-btn" aria-label="Send">➤</button>
          </div>
        </div>
      )}
    </>
  )
}
