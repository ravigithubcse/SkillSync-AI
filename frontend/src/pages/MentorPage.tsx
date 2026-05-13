import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import {
  Send, Brain, Sparkles, Loader2, User, Bot, Lightbulb,
  TrendingUp, BookOpen, Target, ChevronRight, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const quickPrompts = [
  { icon: TrendingUp, text: 'What skills are trending now?' },
  { icon: Target, text: 'Help me negotiate my salary' },
  { icon: BookOpen, text: 'Create a 6-month learning plan' },
  { icon: Lightbulb, text: 'How to prepare for system design?' },
];

export default function MentorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: sessions } = useQuery({
    queryKey: ['mentor-sessions'],
    queryFn: () => api.get('/mentor/sessions').then(r => r.data),
  });

  const chatMutation = useMutation({
    mutationFn: (message: string) => api.post('/mentor/chat', {
      message,
      sessionId,
      context: { topic: 'Career Advice' },
    }).then(r => r.data),
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      }]);
    },
    onError: () => {
      toast.error('Failed to get response. Please try again.');
    },
  });

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);
    setInput('');
    chatMutation.mutate(userMessage);
  };

  const handleQuickPrompt = (text: string) => {
    setMessages(prev => [...prev, { role: 'user', content: text, timestamp: new Date() }]);
    chatMutation.mutate(text);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">AI Career Mentor</h1>
            <p className="text-sm text-gray-400">Powered by GPT-4 • Real-time market insights</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge bg-green-500/10 text-green-400">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block mr-1 animate-pulse" />
            Online
          </span>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Chat Area */}
        <div className="flex-1 card flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 scroll-hide">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 bg-primary-500/10 rounded-2xl flex items-center justify-center mb-4">
                  <Sparkles size={40} className="text-primary-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">How can I help your career today?</h2>
                <p className="text-gray-400 max-w-md mb-6">
                  Ask me anything about career growth, interview prep, salary negotiation, 
                  skill development, or market trends.
                </p>
                <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                  {quickPrompts.map((prompt) => {
                    const Icon = prompt.icon;
                    return (
                      <button
                        key={prompt.text}
                        onClick={() => handleQuickPrompt(prompt.text)}
                        className="flex items-center gap-2 p-3 bg-dark-900/50 rounded-xl border border-white/5 hover:border-primary-500/30 transition-all text-left"
                      >
                        <Icon size={16} className="text-primary-400 flex-shrink-0" />
                        <span className="text-sm text-gray-300">{prompt.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-primary-500/20' : 'bg-accent-500/20'
                  }`}>
                    {msg.role === 'user' ? <User size={16} className="text-primary-400" /> : <Bot size={16} className="text-accent-400" />}
                  </div>
                  <div className={`max-w-[80%] p-4 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-primary-500/10 border border-primary-500/20'
                      : 'bg-dark-900/50 border border-white/5'
                  }`}>
                    <div className="text-sm text-gray-200 whitespace-pre-line leading-relaxed">
                      {msg.content}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
            {chatMutation.isPending && (
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-accent-500/20 rounded-lg flex items-center justify-center">
                  <Bot size={16} className="text-accent-400" />
                </div>
                <div className="p-4 bg-dark-900/50 border border-white/5 rounded-2xl">
                  <Loader2 size={18} className="animate-spin text-accent-400" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about careers, skills, interviews..."
                className="input flex-1"
                disabled={chatMutation.isPending}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || chatMutation.isPending}
                className="btn-primary px-4 disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Session History Sidebar */}
        <div className="w-64 card hidden xl:flex flex-col">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Clock size={16} /> Recent Chats
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2 scroll-hide">
            {sessions?.map((session: any) => (
              <button
                key={session.id}
                onClick={() => setSessionId(session.id)}
                className={`w-full text-left p-3 rounded-xl transition-all text-sm ${
                  sessionId === session.id
                    ? 'bg-primary-500/10 border border-primary-500/20'
                    : 'bg-dark-900/50 border border-white/5 hover:bg-white/5'
                }`}
              >
                <p className="font-medium text-white truncate">{session.topic}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(session.updatedAt).toLocaleDateString()}</p>
              </button>
            )) || (
              <p className="text-sm text-gray-500 text-center py-4">No previous chats</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
