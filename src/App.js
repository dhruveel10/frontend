import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, FileText, Loader2, Sparkles, User, Bot, BarChart3, PieChart, TrendingUp, Moon, Sun } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, LineChart, Line, Pie } from 'recharts';

const API_BASE = 'http://localhost:3001/api';

const CHART_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#EC4899', '#14B8A6'];

const parseMarkdownText = (text, isDark) => {
  if (!text) return '';
  
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
        <h3 key={`header-${index}`} className={`font-bold text-lg mt-4 mb-2 first:mt-0 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          {headerText}
        </h3>
      );
      return;
    }
    
    if (line.trim().startsWith('* ')) {
      const bulletText = line.trim().slice(2);
      const parsedBullet = parseBoldText(bulletText, isDark);
      elements.push(
        <div key={`bullet-${index}`} className="flex items-start gap-2 mb-1 ml-4">
          <span className={`font-bold mt-1 ${
            isDark ? 'text-blue-400' : 'text-blue-600'
          }`}>•</span>
          <span className={`leading-relaxed ${
            isDark ? 'text-gray-200' : 'text-gray-700'
          }`}>{parsedBullet}</span>
        </div>
      );
      return;
    }
    
    const parsedLine = parseBoldText(line, isDark);
    if (parsedLine) {
      elements.push(
        <p key={`line-${index}`} className={`mb-2 leading-relaxed ${
          isDark ? 'text-gray-200' : 'text-gray-700'
        }`}>
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
        <strong key={`bold-${index}`} className={`font-semibold ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          {boldText}
        </strong>
      );
    }
    return part;
  });
};

const ChartComponent = ({ chart, isDark }) => {
  if (!chart || !chart.data || chart.data.length === 0) return null;

  const formatValue = (value) => {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return value;
  };

  const gridColor = isDark ? '#4B5563' : '#E5E7EB';
  const textColor = isDark ? '#E5E7EB' : '#6B7280';
  const tooltipBg = isDark ? '#1F2937' : '#F9FAFB';
  const tooltipBorder = isDark ? '#374151' : '#D1D5DB';

  const renderChart = () => {
    switch (chart.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chart.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis 
                dataKey="label" 
                tick={{ fontSize: 12, fill: textColor }}
                stroke={textColor}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: textColor }}
                stroke={textColor}
              />
              <Tooltip 
                formatter={(value) => [formatValue(value), 'Value']}
                labelStyle={{ color: isDark ? '#F9FAFB' : '#374151' }}
                contentStyle={{ 
                  backgroundColor: tooltipBg, 
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: '8px',
                  color: isDark ? '#F9FAFB' : '#374151'
                }}
              />
              <Bar 
                dataKey="value" 
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
              >
                {chart.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={chart.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ label, percent }) => `${label}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chart.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [formatValue(value), 'Value']}
                contentStyle={{ 
                  backgroundColor: tooltipBg, 
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: '8px',
                  color: isDark ? '#F9FAFB' : '#374151'
                }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chart.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis 
                dataKey="label" 
                tick={{ fontSize: 12, fill: textColor }}
                stroke={textColor}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: textColor }}
                stroke={textColor}
              />
              <Tooltip 
                formatter={(value) => [formatValue(value), 'Value']}
                labelStyle={{ color: isDark ? '#F9FAFB' : '#374151' }}
                contentStyle={{ 
                  backgroundColor: tooltipBg, 
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: '8px',
                  color: isDark ? '#F9FAFB' : '#374151'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className={`text-center py-8 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Unsupported chart type: {chart.type}
          </div>
        );
    }
  };

  const getChartIcon = () => {
    const iconClass = isDark ? 'text-blue-400' : 'text-blue-600';
    switch (chart.type) {
      case 'bar':
        return <BarChart3 size={16} className={iconClass} />;
      case 'pie':
        return <PieChart size={16} className={`${isDark ? 'text-purple-400' : 'text-purple-600'}`} />;
      case 'line':
        return <TrendingUp size={16} className={`${isDark ? 'text-green-400' : 'text-green-600'}`} />;
      default:
        return <BarChart3 size={16} className={iconClass} />;
    }
  };

  return (
    <div className={`mt-4 p-4 rounded-lg border ${
      isDark 
        ? 'bg-gray-800 border-gray-600' 
        : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-center gap-2 mb-3">
        {getChartIcon()}
        <h4 className={`font-medium ${
          isDark ? 'text-gray-200' : 'text-gray-700'
        }`}>
          {chart.title || `${chart.type.charAt(0).toUpperCase() + chart.type.slice(1)} Chart`}
        </h4>
      </div>
      {renderChart()}
      
      <div className={`mt-3 text-xs ${
        isDark ? 'text-gray-400' : 'text-gray-500'
      }`}>
        <span>Data points: {chart.data.length}</span>
        {chart.data.length > 0 && (
          <span className="ml-4">
            Total: {chart.data.reduce((sum, item) => sum + (item.value || 0), 0).toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
};

const ChatMessage = ({ message, isUser, sources, chart, isDark }) => (
  <div className={`flex mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
    <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser 
          ? 'bg-blue-600 text-white' 
          : 'bg-gradient-to-br from-purple-500 to-blue-600 text-white'
      }`}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      
      <div className={`rounded-2xl px-4 py-3 shadow-sm ${
        isUser
          ? 'bg-blue-600 text-white rounded-br-md'
          : isDark
            ? 'bg-gray-800 border border-gray-600 text-gray-100 rounded-bl-md'
            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
      }`}>
        <div className="leading-relaxed">
          {isUser ? (
            <div className="whitespace-pre-wrap">{message}</div>
          ) : (
            <div>{parseMarkdownText(message, isDark)}</div>
          )}
        </div>
        
        {!isUser && chart && <ChartComponent chart={chart} isDark={isDark} />}
        
        {sources && sources.length > 0 && (
          <div className={`mt-3 pt-3 border-t flex items-center gap-2 text-xs ${
            isDark 
              ? 'border-gray-600 text-gray-400' 
              : 'border-gray-200 text-gray-500'
          }`}>
            <FileText size={12} />
            <span>Sources: {sources.map(s => s.source.substring(0, 8)).join(', ')}</span>
          </div>
        )}
      </div>
    </div>
  </div>
);

const SuggestedQuestions = ({ onQuestionClick, isDark }) => {
  const questions = [
    "What are the key financial highlights?",
    "Show me revenue growth trends",
    "Compare profit margins across quarters", 
    "What are the main business segments?",
    "Analyze the order backlog performance",
    "Visualize revenue by business division",
    "Show quarterly performance comparison"
  ];

  return (
    <div className="mb-8">
      <h3 className={`text-sm font-medium mb-4 flex items-center gap-2 ${
        isDark ? 'text-gray-300' : 'text-gray-500'
      }`}>
        <Sparkles size={16} />
        Suggested Questions
      </h3>
      <div className="flex flex-wrap gap-2">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => onQuestionClick(question)}
            className={`px-4 py-2 text-sm border rounded-full transition-all duration-200 hover:shadow-md hover:scale-105 ${
              isDark
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-200 border-gray-600 hover:border-blue-500'
                : 'bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-gray-700 border-gray-200 hover:border-blue-300'
            }`}
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
};

const LoadingDots = ({ isDark }) => (
  <div className="flex gap-1">
    <div className={`w-2 h-2 rounded-full animate-bounce ${
      isDark ? 'bg-gray-400' : 'bg-gray-400'
    }`}></div>
    <div className={`w-2 h-2 rounded-full animate-bounce ${
      isDark ? 'bg-gray-400' : 'bg-gray-400'
    }`} style={{ animationDelay: '0.1s' }}></div>
    <div className={`w-2 h-2 rounded-full animate-bounce ${
      isDark ? 'bg-gray-400' : 'bg-gray-400'
    }`} style={{ animationDelay: '0.2s' }}></div>
  </div>
);

const ThemeToggle = ({ isDark, onToggle }) => (
  <button
    onClick={onToggle}
    className={`p-2 rounded-lg transition-colors duration-200 ${
      isDark
        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
    title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
  >
    {isDark ? <Sun size={18} /> : <Moon size={18} />}
  </button>
);

export default function FinancialChatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
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
  }, []);

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
          sessionId: 'web-session'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const assistantMessage = {
        text: data.response || 'No response received',
        isUser: false,
        sources: Array.isArray(data.sources) ? data.sources : [],
        chart: data.chart || null
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Send message error:', error);
      const errorMessage = {
        text: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        isUser: false,
        sources: [],
        chart: null
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

  const clearChat = () => {
    setMessages([]);
    inputRef.current?.focus();
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gray-900' 
        : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'
    }`}>
      <div className="max-w-5xl mx-auto p-4 h-screen flex flex-col">
        <div className={`backdrop-blur-sm rounded-2xl shadow-lg border p-6 mb-6 transition-colors duration-300 ${
          isDark
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white/80 border-white/20'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <MessageSquare size={24} className="text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
                  isDark
                    ? 'from-gray-100 to-gray-300'
                    : 'from-gray-800 to-gray-600'
                }`}>
                  Financial Analysis Assistant
                </h1>
                <p className={`text-sm ${
                  isDark ? 'text-gray-300' : 'text-gray-500'
                }`}>Get instant insights and visualizations from your financial documents</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    isDark
                      ? 'text-gray-300 hover:text-gray-100 hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  Clear Chat
                </button>
              )}
            </div>
          </div>
        </div>

        <div className={`flex-1 backdrop-blur-sm rounded-2xl shadow-lg border flex flex-col overflow-hidden transition-colors duration-300 ${
          isDark
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white/60 border-white/20'
        }`}>
          <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: 'thin' }}>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center">
                <div className="text-center mb-12">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                    isDark
                      ? 'bg-gray-700'
                      : 'bg-gradient-to-br from-purple-100 to-blue-100'
                  }`}>
                    <MessageSquare size={32} className={`${
                      isDark ? 'text-purple-400' : 'text-purple-600'
                    }`} />
                  </div>
                  <h2 className={`text-xl font-semibold mb-2 ${
                    isDark ? 'text-gray-100' : 'text-gray-800'
                  }`}>Welcome to your Financial Assistant</h2>
                  <p className={`${
                    isDark ? 'text-gray-300' : 'text-gray-500'
                  }`}>Ask me anything about your financial documents and I'll provide insights with interactive charts</p>
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
                    chart={message.chart}
                    isDark={isDark}
                  />
                ))}
                
                {loading && (
                  <div className="flex justify-start mb-6">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white">
                        <Bot size={16} />
                      </div>
                      <div className={`border rounded-2xl rounded-bl-md px-4 py-3 shadow-sm ${
                        isDark
                          ? 'bg-gray-800 border-gray-600'
                          : 'bg-white border-gray-200'
                      }`}>
                        <div className="flex items-center gap-3">
                          <LoadingDots isDark={isDark} />
                          <span className={`text-sm ${
                            isDark ? 'text-gray-300' : 'text-gray-500'
                          }`}>Analyzing documents and generating visualizations...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className={`border-t p-4 transition-colors duration-300 ${
            isDark
              ? 'border-gray-700 bg-gray-800'
              : 'border-gray-200 bg-white/80'
          }`}>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about financial performance, trends, or request specific visualizations..."
                  className={`w-full resize-none border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 backdrop-blur-sm ${
                    isDark
                      ? 'border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400'
                      : 'border-gray-300 bg-white/90 text-gray-900 placeholder-gray-500'
                  }`}
                  rows={1}
                  disabled={loading}
                  style={{
                    minHeight: '48px',
                    maxHeight: '120px',
                    scrollbarWidth: 'thin'
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
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white p-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2 min-w-[48px] justify-center"
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        * {
          scrollbar-width: thin;
          scrollbar-color: ${isDark ? '#4B5563 #1F2937' : '#cbd5e0 #f7fafc'};
        }
        
        *::-webkit-scrollbar {
          width: 6px;
        }
        
        *::-webkit-scrollbar-track {
          background: ${isDark ? '#1F2937' : '#f7fafc'};
        }
        
        *::-webkit-scrollbar-thumb {
          background: ${isDark ? '#4B5563' : '#cbd5e0'};
          border-radius: 3px;
        }
        
        *::-webkit-scrollbar-thumb:hover {
          background: ${isDark ? '#6B7280' : '#a0aec0'};
        }
      `}</style>
    </div>
  );
}