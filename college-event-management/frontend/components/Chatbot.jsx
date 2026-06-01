import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';
import dataService from '../services/data.service';

const paymentMethods = [
  "UPI (Google Pay, PhonePe, Paytm)",
  "Credit/Debit Cards (Visa, Mastercard, RuPay)",
  "Net Banking (All major Indian banks)",
  "College Wallet / Credits"
];

const PREDEFINED_OPTIONS = ["Upcoming events", "Registration process", "Payment methods", "Venue details"];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I'm your Event Assistant. How can I help you today?", isBot: true, isGreeting: true }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [events, setEvents] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Fetch real event data for conversational context
    dataService.getAllEvents()
      .then(res => setEvents(res.data || []))
      .catch(() => console.warn("Chatbot failed to fetch fresh events."));
  }, []);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const getBotResponse = (input) => {
    const query = input.toLowerCase();
    
    // 1. GREETINGS
    if (query.match(/hi|hello|hey|greetings/)) {
      return "Hello! I'm here to help you with college events, registrations, or payments. What information are you looking for?";
    }

    // 2. PAYMENT METHODS (Specific user request)
    if (query.includes('payment') || query.includes('pay') || query.includes('fee') || query.includes('method')) {
      return `We recently expanded our payment options! You can now pay using: \n\n• ${paymentMethods.join('\n• ')}\n\nPayments are processed securely via our internal gateway during registration.`;
    }

    // 3. EVENT SPECIFIC INFO
    if (query.includes('event') || query.includes('workshop') || query.includes('upcoming')) {
      if (events.length === 0) {
        return "I'm currently checking the schedule... We usually have workshops and cultural events. Please check back in a second or visit the Events page!";
      }

      // If user asks about a specific event name
      const specificEvent = events.find(e => query.includes(e.title.toLowerCase()) || query.includes(e.description?.toLowerCase()));
      if (specificEvent) {
        return `Found it! "${specificEvent.title}" is happening on ${new Date(specificEvent.date).toLocaleDateString('en-IN')}. Venue: ${specificEvent.venue || 'Main Campus'}. Fee: ₹${specificEvent.fee}. Would you like help registering?`;
      }

      // General upcoming events list
      const upcoming = events.slice(0, 3).map(e => `• ${e.title} (${new Date(e.date).toLocaleDateString('en-IN')})`).join('\n');
      return `We have ${events.length} exciting events coming up! Here are a few highlights:\n\n${upcoming}\n\nType the name of any event to get more details!`;
    }

    // 4. REGISTRATION PROCESS
    if (query.includes('register') || query.includes('how to') || query.includes('process')) {
      return "To register: \n1. Go to the 'Events' page.\n2. Click 'Details' on your preferred event.\n3. Click the 'Register Now' button.\n4. Complete the payment (if it's a paid event).\n\nYou'll get an invoice immediately after!";
    }

    // 5. VENUE / LOCATION
    if (query.includes('venue') || query.includes('location') || query.includes('where')) {
      return "Most events are held at the KRCE Campus (Main Ground, Auditoriums, or Lab Block). Each event's specific venue is listed on its detail page!";
    }

    // DEFAULT
    return "I'm not quite sure I understand. I can tell you about: \n• Upcoming Events \n• Payment Methods \n• Registration Steps \n• Venue details\n\nWhat would you like to know?";
  };

  const handleSendMessage = (e, textOverride = null) => {
    e?.preventDefault();
    const textToSend = textOverride || inputText;
    
    if (!textToSend.trim()) return;

    setMessages(prev => [...prev, { text: textToSend, isBot: false }]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getBotResponse(textToSend);
      setMessages(prev => [...prev, { text: response, isBot: true }]);
      setIsTyping(false);
    }, 800 + Math.random() * 600);
  };

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-bot-icon">🤖</div>
              <div>
                <h3>Event Assistant</h3>
                <p>Real-time Intelligence</p>
              </div>
            </div>
            <button className="chatbot-close-btn" onClick={toggleChat}>✖</button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message-wrapper ${msg.isBot ? 'bot' : 'user'}`}>
                <div className="message-content" style={{ whiteSpace: 'pre-wrap' }}>
                  {msg.text}
                </div>
                {msg.isGreeting && (
                    <div className="quick-replies">
                        {PREDEFINED_OPTIONS.map((opt, i) => (
                            <button 
                                key={i} 
                                className="quick-reply-btn"
                                onClick={(e) => handleSendMessage(e, opt)}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input-area">
            <form onSubmit={handleSendMessage} className="chatbot-input-form">
              <input 
                type="text" 
                placeholder="Ask me anything..." 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button 
                type="submit" 
                className="chatbot-send-btn"
                disabled={!inputText.trim() || isTyping}
              >
                <svg fill="currentColor" viewBox="0 0 24 24" height="18px" width="18px">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}

      <button className="chatbot-toggle-btn" onClick={toggleChat} style={{ boxShadow: isOpen ? 'none' : '0 10px 30px rgba(124,58,237,0.4)' }}>
        {isOpen ? (
          <span style={{ fontSize: '1.2rem' }}>✕</span>
        ) : (
          <svg fill="currentColor" viewBox="0 0 24 24" height="28px" width="28px">
             <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
          </svg>
        )}
      </button>
    </div>
  );
}

