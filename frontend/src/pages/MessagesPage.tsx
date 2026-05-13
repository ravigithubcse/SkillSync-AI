import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useSocket } from '@/hooks/useSocket';
import api from '@/lib/api';
import {
  Send, Search, MessageSquare, ChevronLeft, Loader2,
  Phone, Video, MoreVertical, Smile, Paperclip
} from 'lucide-react';
import { formatRelativeTime, getInitials } from '@/lib/utils';

export default function MessagesPage() {
  const { userId } = useParams();
  const [selectedUser, setSelectedUser] = useState<string | null>(userId || null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage, socket } = useSocket();

  const { data: conversations, refetch: refetchConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.get('/messages/conversations').then(r => r.data),
  });

  const { data: messages, refetch: refetchMessages } = useQuery({
    queryKey: ['messages', selectedUser],
    queryFn: () => selectedUser ? api.get(`/messages/${selectedUser}`).then(r => r.data) : Promise.resolve([]),
    enabled: !!selectedUser,
  });

  useEffect(() => {
    if (socket) {
      socket.on('new_message', () => {
        refetchConversations();
        refetchMessages();
      });
    }
    return () => {
      socket?.off('new_message');
    };
  }, [socket, refetchConversations, refetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!messageInput.trim() || !selectedUser) return;
    sendMessage(selectedUser, messageInput.trim());
    setMessageInput('');
    setTimeout(() => refetchMessages(), 100);
  };

  const filteredConversations = conversations?.filter((conv: any) =>
    `${conv.partner.firstName} ${conv.partner.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8rem)] card flex overflow-hidden p-0">
      {/* Conversations Sidebar */}
      <div className={`w-80 border-r border-white/5 flex flex-col ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white mb-3">Messages</h2>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="input pl-9 text-sm"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scroll-hide">
          {filteredConversations?.map((conv: any) => (
            <button
              key={conv.partner.id}
              onClick={() => setSelectedUser(conv.partner.id)}
              className={`w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-all text-left ${
                selectedUser === conv.partner.id ? 'bg-primary-500/10 border-l-2 border-primary-500' : ''
              }`}
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                  {getInitials(conv.partner.firstName, conv.partner.lastName)}
                </div>
                {conv.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-medium">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{conv.partner.firstName} {conv.partner.lastName}</p>
                <p className="text-sm text-gray-400 truncate">{conv.lastMessage.content}</p>
              </div>
              <span className="text-xs text-gray-500 flex-shrink-0">
                {formatRelativeTime(conv.lastMessage.createdAt)}
              </span>
            </button>
          )) || (
            <div className="text-center py-8">
              <MessageSquare size={32} className="mx-auto mb-2 text-gray-600" />
              <p className="text-sm text-gray-500">No conversations yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="md:hidden p-1 hover:bg-white/10 rounded-lg"
                >
                  <ChevronLeft size={20} />
                </button>
                {(() => {
                  const partner = conversations?.find((c: any) => c.partner.id === selectedUser)?.partner;
                  return partner ? (
                    <>
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                        {getInitials(partner.firstName, partner.lastName)}
                      </div>
                      <div>
                        <p className="font-medium text-white">{partner.firstName} {partner.lastName}</p>
                        <p className="text-xs text-green-400">Online</p>
                      </div>
                    </>
                  ) : null;
                })()}
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <Phone size={18} className="text-gray-400" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <Video size={18} className="text-gray-400" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <MoreVertical size={18} className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-hide">
              {messages?.map((msg: any) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.senderId === selectedUser ? '' : 'flex-row-reverse'}`}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {getInitials(msg.sender.firstName, msg.sender.lastName)}
                  </div>
                  <div className={`max-w-[70%] p-3 rounded-2xl ${
                    msg.senderId === selectedUser
                      ? 'bg-dark-800 border border-white/5'
                      : 'bg-primary-500/10 border border-primary-500/20'
                  }`}>
                    <p className="text-sm text-gray-200">{msg.content}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(msg.createdAt)}</p>
                  </div>
                </motion.div>
              )) || (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">Start a conversation</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/5">
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <Paperclip size={18} className="text-gray-400" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <Smile size={18} className="text-gray-400" />
                </button>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className="input flex-1"
                />
                <button
                  onClick={handleSend}
                  disabled={!messageInput.trim()}
                  className="p-3 bg-primary-500 hover:bg-primary-400 rounded-xl transition-colors disabled:opacity-50"
                >
                  <Send size={18} className="text-white" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 bg-primary-500/10 rounded-2xl flex items-center justify-center mb-4">
              <MessageSquare size={40} className="text-primary-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Your Messages</h2>
            <p className="text-gray-400 max-w-sm">
              Select a conversation from the sidebar or start a new one from a user's profile.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
