import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Send, MessageSquare, FileText, Loader2, Sparkles, User, Bot, BarChart3, PieChart, TrendingUp, Moon, Sun, X, Menu, Plus, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, LineChart, Line, Pie } from 'recharts';

const API_BASE = process.env.REACT_APP_API_BASE;

const CHART_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#EC4899', '#14B8A6'];

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
        <h3 key={`header-${index}`} className={`font-bold text-base sm:text-lg mt-4 mb-2 first:mt-0 ${
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
        <div key={`bullet-${index}`} className="flex items-start gap-2 mb-1 ml-2 sm:ml-4">
          <span className={`font-bold mt-1 text-sm ${
            isDark ? 'text-blue-400' : 'text-blue-600'
          }`}>•</span>
          <span className={`leading-relaxed text-sm sm:text-base ${
            isDark ? 'text-gray-200' : 'text-gray-700'
          }`}>{parsedBullet}</span>
        </div>
      );
      return;
    }
    
    const parsedLine = parseBoldText(line, isDark);
    if (parsedLine) {
      elements.push(
        <p key={`line-${index}`} className={`mb-2 leading-relaxed text-sm sm:text-base ${
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
  const [viewType, setViewType] = useState('grouped');
  
  const processedData = useMemo(() => {
    if (!chart || !chart.data || chart.data.length === 0) {
      return null;
    }

    const groupDataByMetric = (data) => {
      const groups = {};
      
      data.forEach(item => {
        const parts = item.label.split(' ');
        const metric = parts[0];
        const period = parts.slice(1).join(' ') || 'Current';
        
        if (!groups[metric]) {
          groups[metric] = [];
        }
        
        groups[metric].push({
          ...item,
          period,
          metric
        });
      });
      
      return groups;
    };

    const createGroupedChartData = (data) => {
      const groups = groupDataByMetric(data);
      const periods = [...new Set(data.map(item => {
        const parts = item.label.split(' ');
        return parts.slice(1).join(' ') || 'Current';
      }))];
      
      return periods.map(period => {
        const periodData = { period };
        Object.keys(groups).forEach(metric => {
          const item = groups[metric].find(g => g.period === period);
          if (item) {
            periodData[metric] = item.value;
          }
        });
        return periodData;
      });
    };

    const groups = groupDataByMetric(chart.data);
    const groupedData = createGroupedChartData(chart.data);
    
    const maxValue = Math.max(...chart.data.map(d => d.value));
    const minValue = Math.min(...chart.data.map(d => d.value));
    const avgValue = chart.data.reduce((sum, d) => sum + d.value, 0) / chart.data.length;
    
    return {
      original: chart.data,
      grouped: groupedData,
      groups,
      insights: { maxValue, minValue, avgValue },
      metrics: Object.keys(groups)
    };
  }, [chart]);

  if (!processedData) return null;

  const formatValue = (value) => {
    if (typeof value === 'number') {
      if (value >= 1000) {
        return value.toLocaleString('en-IN');
      }
      return value.toFixed(1);
    }
    return value;
  };

  const formatCurrency = (value) => {
    if (typeof value !== 'number') return value;
    return `₹${formatValue(value)} Cr`;
  };

  const gridColor = isDark ? '#4B5563' : '#E5E7EB';
  const textColor = isDark ? '#E5E7EB' : '#6B7280';
  const tooltipBg = isDark ? '#1F2937' : '#F9FAFB';
  const tooltipBorder = isDark ? '#374151' : '#D1D5DB';

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="p-3 rounded-lg shadow-lg border backdrop-blur-sm"
           style={{ 
             backgroundColor: tooltipBg, 
             borderColor: tooltipBorder,
             color: isDark ? '#F9FAFB' : '#374151'
           }}>
        <p className="font-medium mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-1 text-sm">
            <div 
              className="w-3 h-3 rounded"
              style={{ backgroundColor: entry.color }}
            />
            <span className="font-medium">{entry.dataKey}:</span>
            <span>{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderInsights = () => {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-xs">
        <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
          <div className={`${isDark ? 'text-blue-400' : 'text-blue-600'} font-medium`}>
            Highest
          </div>
          <div className={`${isDark ? 'text-gray-200' : 'text-gray-800'} font-bold`}>
            {formatCurrency(processedData.insights.maxValue)}
          </div>
        </div>
        
        <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
          <div className={`${isDark ? 'text-green-400' : 'text-green-600'} font-medium`}>
            Average
          </div>
          <div className={`${isDark ? 'text-gray-200' : 'text-gray-800'} font-bold`}>
            {formatCurrency(processedData.insights.avgValue)}
          </div>
        </div>
        
        <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-purple-50'}`}>
          <div className={`${isDark ? 'text-purple-400' : 'text-purple-600'} font-medium`}>
            Metrics
          </div>
          <div className={`${isDark ? 'text-gray-200' : 'text-gray-800'} font-bold`}>
            {processedData.metrics.length}
          </div>
        </div>
        
        <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-amber-50'}`}>
          <div className={`${isDark ? 'text-amber-400' : 'text-amber-600'} font-medium`}>
            Total
          </div>
          <div className={`${isDark ? 'text-gray-200' : 'text-gray-800'} font-bold`}>
            {formatCurrency(processedData.original.reduce((sum, item) => sum + item.value, 0))}
          </div>
        </div>
      </div>
    );
  };

  const renderViewToggle = () => (
    <div className={`flex gap-1 mb-4 p-1 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
      {[
        { key: 'grouped', label: 'Grouped', icon: BarChart3 },
        { key: 'individual', label: 'Individual', icon: PieChart },
        { key: 'comparison', label: 'Trend', icon: TrendingUp }
      ].map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => setViewType(key)}
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all ${
            viewType === key
              ? isDark 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-white text-blue-600 shadow-sm'
              : isDark
                ? 'text-gray-300 hover:text-white hover:bg-gray-600'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
          }`}
        >
          <Icon size={12} />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );

  const renderChart = () => {
    const chartHeight = window.innerWidth < 768 ? 280 : 350;
    const margin = window.innerWidth < 768 
      ? { top: 20, right: 20, left: 20, bottom: 60 }
      : { top: 20, right: 30, left: 20, bottom: 40 };

    switch (viewType) {
      case 'grouped':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={processedData.grouped} margin={margin}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: window.innerWidth < 768 ? 10 : 12, fill: textColor }}
                stroke={textColor}
                angle={window.innerWidth < 768 ? -45 : 0}
                textAnchor={window.innerWidth < 768 ? "end" : "middle"}
                height={window.innerWidth < 768 ? 60 : 40}
              />
              <YAxis 
                tick={{ fontSize: window.innerWidth < 768 ? 10 : 12, fill: textColor }}
                stroke={textColor}
                tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value.toString()}
              />
              <Tooltip content={<CustomTooltip />} />
              {processedData.metrics.map((metric, index) => (
                <Bar 
                  key={metric}
                  dataKey={metric} 
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                  radius={[2, 2, 0, 0]}
                  name={metric}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'individual':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <RechartsPieChart>
              <Pie
                data={processedData.original}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={window.innerWidth < 768 ? false : ({ label, percent }) => 
                  percent > 0.05 ? `${label.split(' ')[0]}: ${(percent * 100).toFixed(0)}%` : ''
                }
                outerRadius={window.innerWidth < 768 ? 70 : 90}
                fill="#8884d8"
                dataKey="value"
              >
                {processedData.original.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [formatCurrency(value), name]}
                contentStyle={{ 
                  backgroundColor: tooltipBg, 
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: '8px',
                  color: isDark ? '#F9FAFB' : '#374151',
                  fontSize: window.innerWidth < 768 ? '12px' : '14px'
                }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      case 'comparison':
        const lineData = processedData.original.map((item, index) => ({
          index: index + 1,
          name: item.label.split(' ')[0],
          value: item.value,
          fullLabel: item.label
        }));

        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart data={lineData} margin={margin}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: window.innerWidth < 768 ? 10 : 12, fill: textColor }}
                stroke={textColor}
                angle={window.innerWidth < 768 ? -45 : 0}
                textAnchor={window.innerWidth < 768 ? "end" : "middle"}
              />
              <YAxis 
                tick={{ fontSize: window.innerWidth < 768 ? 10 : 12, fill: textColor }}
                stroke={textColor}
                tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value.toString()}
              />
              <Tooltip 
                formatter={(value, name, props) => [formatCurrency(value), props.payload.fullLabel]}
                contentStyle={{ 
                  backgroundColor: tooltipBg, 
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: '8px',
                  color: isDark ? '#F9FAFB' : '#374151',
                  fontSize: window.innerWidth < 768 ? '12px' : '14px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3B82F6" 
                strokeWidth={window.innerWidth < 768 ? 2 : 3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: window.innerWidth < 768 ? 4 : 5 }}
                activeDot={{ r: window.innerWidth < 768 ? 5 : 7, stroke: '#3B82F6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  const getChartIcon = () => {
    const iconClass = isDark ? 'text-blue-400' : 'text-blue-600';
    const iconSize = window.innerWidth < 768 ? 16 : 18;
    switch (viewType) {
      case 'grouped':
        return <BarChart3 size={iconSize} className={iconClass} />;
      case 'individual':
        return <PieChart size={iconSize} className={`${isDark ? 'text-purple-400' : 'text-purple-600'}`} />;
      case 'comparison':
        return <TrendingUp size={iconSize} className={`${isDark ? 'text-green-400' : 'text-green-600'}`} />;
      default:
        return <BarChart3 size={iconSize} className={iconClass} />;
    }
  };

  return (
    <div className={`mt-6 p-4 sm:p-6 rounded-xl border shadow-sm ${
      isDark 
        ? 'bg-gray-800 border-gray-600' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {getChartIcon()}
          <h4 className={`font-semibold text-base sm:text-lg ${
            isDark ? 'text-gray-100' : 'text-gray-800'
          }`}>
            {chart.title || 'Financial Analysis'}
          </h4>
        </div>
        
        <div className={`text-xs px-2 py-1 rounded-full ${
          isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
        }`}>
          {processedData.original.length} data points
        </div>
      </div>

      {renderInsights()}
      {renderViewToggle()}
      
      <div className={`rounded-lg p-2 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {renderChart()}
      </div>
      
      <div className={`mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs ${
        isDark ? 'text-gray-400' : 'text-gray-500'
      }`}>
        <div>
          <div className="font-medium mb-1">Key Metrics:</div>
          <div className="space-y-1">
            {processedData.metrics.slice(0, 3).map((metric, index) => (
              <div key={metric} className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded"
                  style={{ backgroundColor: CHART_COLORS[index] }}
                />
                <span>{metric}</span>
              </div>
            ))}
            {processedData.metrics.length > 3 && (
              <div className="text-xs opacity-75">
                +{processedData.metrics.length - 3} more
              </div>
            )}
          </div>
        </div>
        
        <div>
          <div className="font-medium mb-1">Summary:</div>
          <div>
            <div>Max: {formatCurrency(processedData.insights.maxValue)}</div>
            <div>Min: {formatCurrency(processedData.insights.minValue)}</div>
            <div>Total: {formatCurrency(processedData.original.reduce((sum, item) => sum + item.value, 0))}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatMessage = ({ message, isUser, sources, chart, isDark }) => (
  <div className={`flex mb-4 sm:mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
    <div className={`flex max-w-[95%] sm:max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-2 sm:gap-3`}>
      <div className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
        isUser 
          ? 'bg-blue-600 text-white' 
          : 'bg-gradient-to-br from-purple-500 to-blue-600 text-white'
      }`}>
        {isUser ? <User size={14} className="sm:hidden" /> : <Bot size={14} className="sm:hidden" />}
        {isUser ? <User size={16} className="hidden sm:block" /> : <Bot size={16} className="hidden sm:block" />}
      </div>
      
      <div className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-sm ${
        isUser
          ? 'bg-blue-600 text-white rounded-br-md'
          : isDark
            ? 'bg-gray-800 border border-gray-600 text-gray-100 rounded-bl-md'
            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
      }`}>
        <div className="leading-relaxed">
          {isUser ? (
            <div className="whitespace-pre-wrap text-sm sm:text-base">{message}</div>
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
            <FileText size={10} className="sm:hidden" />
            <FileText size={12} className="hidden sm:block" />
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
    <div className="mb-6 sm:mb-8">
      <h3 className={`text-sm font-medium mb-3 sm:mb-4 flex items-center gap-2 ${
        isDark ? 'text-gray-300' : 'text-gray-500'
      }`}>
        <Sparkles size={14} className="sm:hidden" />
        <Sparkles size={16} className="hidden sm:block" />
        Suggested Questions
      </h3>
      <div className="flex flex-wrap gap-2">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => onQuestionClick(question)}
            className={`px-3 py-2 text-xs sm:text-sm border rounded-full transition-all duration-200 hover:shadow-md active:scale-95 ${
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
    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-bounce ${
      isDark ? 'bg-gray-400' : 'bg-gray-400'
    }`}></div>
    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-bounce ${
      isDark ? 'bg-gray-400' : 'bg-gray-400'
    }`} style={{ animationDelay: '0.1s' }}></div>
    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-bounce ${
      isDark ? 'bg-gray-400' : 'bg-gray-400'
    }`} style={{ animationDelay: '0.2s' }}></div>
  </div>
);

const Sidebar = ({ isOpen, onClose, sessions, currentSessionId, onSwitchSession, onNewChat, isDark }) => (
  <div className={`fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ${
    isOpen ? 'translate-x-0' : '-translate-x-full'
  } ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r`}>
    <div className="flex flex-col h-full">
      <div className={`flex items-center justify-between p-4 border-b ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <h2 className={`text-lg font-semibold ${
          isDark ? 'text-gray-100' : 'text-gray-800'
        }`}>Chat History</h2>
        <button
          onClick={onClose}
          className={`p-2 rounded-lg transition-colors ${
            isDark
              ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-4">
        <button
          onClick={onNewChat}
          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
            isDark
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Plus size={18} />
          <span>New Chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className={`text-xs font-medium mb-3 ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Recent Sessions ({sessions.length})
        </div>
        
        {sessions.length === 0 ? (
          <div className={`text-sm text-center py-8 ${
            isDark ? 'text-gray-500' : 'text-gray-400'
          }`}>
            No previous chats
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => {
              const isActive = session.sessionId === currentSessionId;
              return (
                <button
                  key={session.sessionId}
                  onClick={() => onSwitchSession(session.sessionId)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    isActive
                      ? isDark 
                        ? 'bg-gray-700 border border-blue-500' 
                        : 'bg-blue-50 border border-blue-300'
                      : isDark
                        ? 'hover:bg-gray-700 border border-transparent'
                        : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isActive
                      ? isDark ? 'text-blue-400' : 'text-blue-600'
                      : isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Session {session.sessionId.substring(5, 12)}
                  </div>
                  <div className={`text-xs flex items-center gap-2 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
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
    {isDark ? <Sun size={16} className="sm:hidden" /> : <Moon size={16} className="sm:hidden" />}
    {isDark ? <Sun size={18} className="hidden sm:block" /> : <Moon size={18} className="hidden sm:block" />}
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
    let storedSessionId = localStorage.getItem('chatSessionId');
    
    if (storedSessionId) {
      try {
        const response = await fetch(`${API_BASE}/session/${storedSessionId}/history`);
        if (response.ok) {
          const data = await response.json();
          const formattedHistory = data.history.map(msg => ({
            text: msg.text || msg.message || '',
            isUser: msg.isUser,
            sources: msg.sources || [],
            chart: msg.chart || null
          })).filter(msg => msg.text);
          setMessages(formattedHistory);
          setSessionId(storedSessionId);
          return;
        }
      } catch (error) {
        console.warn('Failed to load session history:', error);
      }
    }
    
    const newSessionId = generateSessionId();
    localStorage.setItem('chatSessionId', newSessionId);
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
        sources: Array.isArray(data.sources) ? data.sources : [],
        chart: data.chart || null
      };
      
      if (data.sessionId && data.sessionId !== sessionId) {
        setSessionId(data.sessionId);
        localStorage.setItem('chatSessionId', data.sessionId);
      }
      
      setMessages(prev => [...prev, assistantMessage]);
      loadAllSessions();
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
    localStorage.setItem('chatSessionId', newSessionId);
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
          sources: msg.sources || [],
          chart: msg.chart || null
        })).filter(msg => msg.text);
        
        setMessages(formattedHistory);
        setSessionId(targetSessionId);
        localStorage.setItem('chatSessionId', targetSessionId);
        setSidebarOpen(false);
      }
    } catch (error) {
      console.warn('Failed to switch session:', error);
    }
  };

  const createNewChat = () => {
    const newSessionId = generateSessionId();
    localStorage.setItem('chatSessionId', newSessionId);
    setSessionId(newSessionId);
    setMessages([]);
    setSidebarOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gray-900' 
        : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'
    }`}>
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
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className="max-w-5xl mx-auto p-2 sm:p-4 h-screen flex flex-col">
        <div className={`backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border p-4 sm:p-6 mb-4 sm:mb-6 transition-colors duration-300 ${
          isDark
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white/80 border-white/20'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                <MessageSquare size={20} className="text-white sm:hidden" />
                <MessageSquare size={24} className="text-white hidden sm:block" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className={`text-lg sm:text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent truncate ${
                  isDark
                    ? 'from-gray-100 to-gray-300'
                    : 'from-gray-800 to-gray-600'
                }`}>
                  News Analysis Assistant
                </h1>
                <p className={`text-xs sm:text-sm hidden sm:block ${
                  isDark ? 'text-gray-300' : 'text-gray-500'
                }`}>Get instant insights and answers from the latest news articles</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  isDark
                    ? 'text-gray-300 hover:text-gray-100 hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
                title="Open chat history"
              >
                <Menu size={18} />
              </button>
              <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
              {sessionId && (
                <div className={`text-xs px-2 py-1 rounded ${
                  isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}>
                  Session: {sessionId.substring(0, 12)}...
                </div>
              )}
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className={`p-2 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-lg transition-colors flex items-center gap-1 sm:gap-2 ${
                    isDark
                      ? 'text-gray-300 hover:text-gray-100 hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <X size={14} className="sm:hidden" />
                  <span className="hidden sm:inline">Clear Chat</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className={`flex-1 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border flex flex-col overflow-hidden transition-colors duration-300 ${
          isDark
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white/60 border-white/20'
        }`}>
          <div className="flex-1 overflow-y-auto p-3 sm:p-6" style={{ scrollbarWidth: 'thin' }}>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center">
                <div className="text-center mb-8 sm:mb-12">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 ${
                    isDark
                      ? 'bg-gray-700'
                      : 'bg-gradient-to-br from-purple-100 to-blue-100'
                  }`}>
                    <MessageSquare size={24} className={`sm:hidden ${
                      isDark ? 'text-purple-400' : 'text-purple-600'
                    }`} />
                    <MessageSquare size={32} className={`hidden sm:block ${
                      isDark ? 'text-purple-400' : 'text-purple-600'
                    }`} />
                  </div>
                  <h2 className={`text-lg sm:text-xl font-semibold mb-2 px-4 ${
                    isDark ? 'text-gray-100' : 'text-gray-800'
                  }`}>Welcome to your News Assistant</h2>
                  <p className={`text-sm sm:text-base px-4 ${
                    isDark ? 'text-gray-300' : 'text-gray-500'
                  }`}>Ask me anything about the latest news and I'll provide insights from current articles</p>
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
                  <div className="flex justify-start mb-4 sm:mb-6">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white">
                        <Bot size={14} className="sm:hidden" />
                        <Bot size={16} className="hidden sm:block" />
                      </div>
                      <div className={`border rounded-2xl rounded-bl-md px-3 py-2 sm:px-4 sm:py-3 shadow-sm ${
                        isDark
                          ? 'bg-gray-800 border-gray-600'
                          : 'bg-white border-gray-200'
                      }`}>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <LoadingDots isDark={isDark} />
                          <span className={`text-xs sm:text-sm ${
                            isDark ? 'text-gray-300' : 'text-gray-500'
                          }`}>Analyzing documents...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className={`border-t p-3 sm:p-4 transition-colors duration-300 ${
            isDark
              ? 'border-gray-700 bg-gray-800'
              : 'border-gray-200 bg-white/80'
          }`}>
            <div className="flex gap-2 sm:gap-3 items-end">
              <div className="flex-1">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask about latest news, current events, or specific topics..."
                  className={`w-full resize-none border rounded-lg sm:rounded-xl px-3 py-2 sm:px-4 sm:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 backdrop-blur-sm text-sm sm:text-base ${
                    isDark
                      ? 'border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400'
                      : 'border-gray-300 bg-white/90 text-gray-900 placeholder-gray-500'
                  }`}
                  rows={1}
                  disabled={loading}
                  style={{
                    minHeight: '40px',
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
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white p-2.5 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2 min-w-[40px] sm:min-w-[48px] justify-center active:scale-95"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin sm:hidden" />
                ) : (
                  <Send size={18} className="sm:hidden" />
                )}
                {loading ? (
                  <Loader2 size={20} className="animate-spin hidden sm:block" />
                ) : (
                  <Send size={20} className="hidden sm:block" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
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