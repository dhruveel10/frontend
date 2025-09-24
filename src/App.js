import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, FileText, Loader2, Sparkles, User, Bot, Moon, Sun, X, Menu, Plus, Clock } from 'lucide-react';
import './styles/App.scss';

const API_BASE = process.env.REACT_APP_API_BASE;

const SESSION_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const setLocalStorageWithTTL = (key, value, ttl = SESSION_TTL) => {
  const now = new Date().getTime();
  const item = {
    value: value,
    expiry: now + ttl
  };
  localStorage.setItem(key, JSON.stringify(item));
};

const getLocalStorageWithTTL = (key) => {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;
  
  try {
    const item = JSON.parse(itemStr);
    const now = new Date().getTime();
    
    if (now > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  } catch (e) {
    localStorage.removeItem(key);
    return null;
  }
};

const clearExpiredSessionData = () => {
  const sessionId = getLocalStorageWithTTL('chatSessionId');
  if (!sessionId) {
    localStorage.removeItem('chatSessionId');
  }
};

const parseMarkdownText = (text, isDark) => {
  if (!text || typeof text !== 'string') return '';
  
  const lines = text.split('\n');
  const elements = [];
  
  lines.forEach((line, index) => {
    if (line.trim() === '') {
      elements.push(<br key={`br-${index}`} />);
      return;
    }
    
    if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
      const headerText = line.trim().slice(2, -2);
      elements.push(
        <h3 key={`header-${index}`}>
          {headerText}
        </h3>
      );
      return;
    }
    
    if (line.trim().startsWith('* ')) {
      const bulletText = line.trim().slice(2);
      const parsedBullet = parseBoldText(bulletText, isDark);
      elements.push(
        <div key={`bullet-${index}`} className="bullet-point">
          <span className="bullet">•</span>
          <span>{parsedBullet}</span>
        </div>
      );
      return;
    }
    
    const parsedLine = parseBoldText(line, isDark);
    if (parsedLine) {
      elements.push(
        <p key={`line-${index}`}>
          {parsedLine}
        </p>
      );
    }
  });
  
  return elements;
};

const parseBoldText = (text, isDark) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={`bold-${index}`}>
          {boldText}
        </strong>
      );
    }
    return part;
  });
};

const ChatMessage = ({ message, isUser, sources, isDark }) => (
  <div className={`message ${isUser ? 'user' : ''}`}>
    <div className="message-content">
      <div className={`avatar ${isUser ? 'user' : 'bot'}`}>
        {isUser ? (
          <>
            <User size={14} className="mobile-only" />
            <User size={16} className="desktop-only" />
          </>
        ) : (
          <>
            <Bot size={14} className="mobile-only" />
            <Bot size={16} className="desktop-only" />
          </>
        )}
      </div>
      
      <div className={`bubble ${isUser ? 'user' : 'bot'}`}>
        <div className="message-text">
          {isUser ? (
            <div>{message}</div>
          ) : (
            <div>{parseMarkdownText(message, isDark)}</div>
          )}
        </div>
        
        {sources && sources.length > 0 && (
          <div className="sources">
            <FileText size={10} className="mobile-only" />
            <FileText size={12} className="desktop-only" />
            <span>Sources: {sources.map(s => s.source.substring(0, 8)).join(', ')}</span>
          </div>
        )}
      </div>
    </div>
  </div>
);

const SuggestedQuestions = ({ onQuestionClick, isDark }) => {
  const questions = [
    "What are the latest technology news?",
    "Tell me about recent political developments",
    "What's happening in world news today?", 
    "Show me recent business news updates",
    "What are the trending news stories?",
    "Give me a summary of today's headlines",
    "What's the latest news from India?",
  ];

  return (
    <div className="suggested-questions">
      <h3 className="suggestions-title">
        <Sparkles size={14} className="mobile-only" />
        <Sparkles size={16} className="desktop-only" />
        Suggested Questions
      </h3>
      <div className="suggestions-grid">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => onQuestionClick(question)}
            className="suggestion-button"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
};

const Sidebar = ({ isOpen, onClose, sessions, currentSessionId, onSwitchSession, onNewChat, isDark }) => (
  <div className={`sidebar ${isOpen ? 'open' : ''}`}>
    <div className="sidebar-header">
      <h2>Chat History</h2>
      <button onClick={onClose} className="close-button">
        <X size={18} />
      </button>
    </div>

    <div className="new-chat-section">
      <button onClick={onNewChat} className="new-chat-button">
        <Plus size={18} />
        <span>New Chat</span>
      </button>
    </div>

    <div className="sessions-list">
      <div className="sessions-title">
        Recent Sessions ({sessions.length})
      </div>
      
      {sessions.length === 0 ? (
        <div className="empty-state">
          No previous chats
        </div>
      ) : (
        <div>
          {sessions.map((session) => {
            const isActive = session.sessionId === currentSessionId;
            return (
              <button
                key={session.sessionId}
                onClick={() => onSwitchSession(session.sessionId)}
                className={`session-item ${isActive ? 'active' : ''}`}
              >
                <div className="session-title">
                  {session.title || `Session ${session.sessionId.substring(5, 12)}`}
                </div>
                <div className="session-meta">
                  <Clock size={12} />
                  {session.messageCount} messages
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  </div>
);

const ThemeToggle = ({ isDark, onToggle }) => (
  <button
    onClick={onToggle}
    className="control-button"
    title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
  >
    {isDark ? (
      <>
        <Sun size={16} className="mobile-only" />
        <Sun size={18} className="desktop-only" />
      </>
    ) : (
      <>
        <Moon size={16} className="mobile-only" />
        <Moon size={18} className="desktop-only" />
      </>
    )}
  </button>
);

export default function FinancialChatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [allSessions, setAllSessions] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
    loadOrCreateSession();
    loadAllSessions();
  }, []);

  const loadAllSessions = async () => {
    try {
      const response = await fetch(`${API_BASE}/sessions`);
      if (response.ok) {
        const data = await response.json();
        setAllSessions(data.sessions || []);
      }
    } catch (error) {
      console.warn('Failed to load all sessions:', error);
    }
  };

  const loadOrCreateSession = async () => {
    clearExpiredSessionData();
    let storedSessionId = getLocalStorageWithTTL('chatSessionId');
    
    if (storedSessionId) {
      try {
        const existsResponse = await fetch(`${API_BASE}/session/${storedSessionId}/exists`);
        if (existsResponse.ok) {
          const existsData = await existsResponse.json();
          if (!existsData.exists) {
            localStorage.removeItem('chatSessionId');
            storedSessionId = null;
          }
        }
        
        if (storedSessionId) {
          const response = await fetch(`${API_BASE}/session/${storedSessionId}/history`);
          if (response.ok) {
            const data = await response.json();
            const formattedHistory = data.history.map(msg => ({
              text: msg.text || msg.message || '',
              isUser: msg.isUser,
              sources: msg.sources || []
            })).filter(msg => msg.text);
            setMessages(formattedHistory);
            setSessionId(storedSessionId);
            return;
          }
        }
      } catch (error) {
        console.warn('Failed to load session history:', error);
        localStorage.removeItem('chatSessionId');
      }
    }
    
    const newSessionId = generateSessionId();
    setLocalStorageWithTTL('chatSessionId', newSessionId);
    setSessionId(newSessionId);
  };

  const generateSessionId = () => {
    return 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
  };

  const sendMessage = async (messageText = input) => {
    if (!messageText.trim() || loading) return;

    const userMessage = { text: messageText, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: messageText,
          sessionId: sessionId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const assistantMessage = {
        text: typeof data.response === 'string' ? data.response : 'No response received',
        isUser: false,
        sources: Array.isArray(data.sources) ? data.sources : []
      };
      
      if (data.sessionId && data.sessionId !== sessionId) {
        setSessionId(data.sessionId);
        setLocalStorageWithTTL('chatSessionId', data.sessionId);
      }
      
      setMessages(prev => [...prev, assistantMessage]);
      loadAllSessions();
    } catch (error) {
      console.error('Send message error:', error);
      const errorMessage = {
        text: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        isUser: false,
        sources: []
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = async () => {
    if (sessionId) {
      try {
        await fetch(`${API_BASE}/session/${sessionId}`, {
          method: 'DELETE'
        });
      } catch (error) {
        console.warn('Failed to clear session on server:', error);
      }
    }
    
    const newSessionId = generateSessionId();
    setLocalStorageWithTTL('chatSessionId', newSessionId);
    setSessionId(newSessionId);
    setMessages([]);
    inputRef.current?.focus();
    loadAllSessions();
  };

  const switchToSession = async (targetSessionId) => {
    try {
      const response = await fetch(`${API_BASE}/session/${targetSessionId}/history`);
      if (response.ok) {
        const data = await response.json();
        const formattedHistory = data.history.map(msg => ({
          text: msg.text || msg.message || '',
          isUser: msg.isUser,
          sources: msg.sources || []
        })).filter(msg => msg.text);
        
        setMessages(formattedHistory);
        setSessionId(targetSessionId);
        setLocalStorageWithTTL('chatSessionId', targetSessionId);
        setSidebarOpen(false);
      }
    } catch (error) {
      console.warn('Failed to switch session:', error);
    }
  };

  const createNewChat = () => {
    const newSessionId = generateSessionId();
    setLocalStorageWithTTL('chatSessionId', newSessionId);
    setSessionId(newSessionId);
    setMessages([]);
    setSidebarOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className={`app ${isDark ? 'dark' : ''}`}>
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sessions={allSessions}
        currentSessionId={sessionId}
        onSwitchSession={switchToSession}
        onNewChat={createNewChat}
        isDark={isDark}
      />
      
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className="container">
        <div className="header">
          <div className="header-content">
            <div className="logo-section">
              <div className="logo">
                <MessageSquare size={20} className="mobile-only" />
                <MessageSquare size={24} className="desktop-only" />
              </div>
              <div className="title-section">
                <h1>News Analysis Assistant</h1>
                <p>Get instant insights and answers from the latest news articles</p>
              </div>
            </div>
            
            <div className="header-controls">
              <button
                onClick={() => setSidebarOpen(true)}
                className="control-button"
                title="Open chat history"
              >
                <Menu size={18} />
              </button>
              <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
              {sessionId && (
                <div className="session-id">
                  Session: {sessionId.substring(0, 12)}...
                </div>
              )}
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="clear-button"
                >
                  <X size={14} className="mobile-only" />
                  <span className="desktop-only">Clear Chat</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="chat-container">
          <div className="messages-area">
            {messages.length === 0 ? (
              <div className="welcome">
                <div className="welcome-header">
                  <div className="welcome-icon">
                    <MessageSquare size={24} className="mobile-only" />
                    <MessageSquare size={32} className="desktop-only" />
                  </div>
                  <h2>Welcome to your News Assistant</h2>
                  <p>Ask me anything about the latest news and I'll provide insights from current articles</p>
                </div>
                
                <SuggestedQuestions onQuestionClick={sendMessage} isDark={isDark} />
              </div>
            ) : (
              <div>
                {messages.map((message, index) => (
                  <ChatMessage
                    key={index}
                    message={message.text}
                    isUser={message.isUser}
                    sources={message.sources}
                    isDark={isDark}
                  />
                ))}
                
                {loading && (
                  <div className="loading-message">
                    <div className="message-content">
                      <div className="avatar bot">
                        <Bot size={14} className="mobile-only" />
                        <Bot size={16} className="desktop-only" />
                      </div>
                      <div className="bubble">
                        <div className="loading-content">
                          <div className="loading-dots">
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                          </div>
                          <span className="loading-text">Analyzing documents...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="input-area">
            <div className="input-container">
              <div className="input-wrapper">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask about latest news, current events, or specific topics..."
                  rows={1}
                  disabled={loading}
                  style={{
                    minHeight: '40px',
                    maxHeight: '120px'
                  }}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                  }}
                />
              </div>
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="send-button"
              >
                {loading ? (
                  <Loader2 size={18} className="mobile-only loading" />
                ) : (
                  <Send size={18} className="mobile-only" />
                )}
                {loading ? (
                  <Loader2 size={20} className="desktop-only loading" />
                ) : (
                  <Send size={20} className="desktop-only" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}