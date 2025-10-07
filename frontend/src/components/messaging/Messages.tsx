import React from 'react';
import { Loader2, MessageSquare, Send } from 'lucide-react';
import { Message as MessageType, User } from '../../types';

export interface ConversationPreview {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  lastMessage: string;
  timestamp: string;
  unread: number;
}

interface MessagesProps {
  currentUser: User | null;
  conversations: ConversationPreview[];
  selectedUser: ConversationPreview['user'] | null;
  onSelectConversation: (conversation: ConversationPreview) => void;
  messages: MessageType[];
  messageInput: string;
  onMessageInputChange: (input: string) => void;
  onSendMessage: () => Promise<void> | void;
  loadingConversations?: boolean;
  loadingMessages?: boolean;
  sendingMessage?: boolean;
}

const Messages: React.FC<MessagesProps> = ({
  currentUser,
  conversations,
  selectedUser,
  onSelectConversation,
  messages,
  messageInput,
  onMessageInputChange,
  onSendMessage,
  loadingConversations = false,
  loadingMessages = false,
  sendingMessage = false,
}) => {
  const renderConversationList = () => {
    if (loadingConversations) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      );
    }

    if (conversations.length === 0) {
      return (
        <div className="p-8 text-center text-gray-500">
          <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-400" />
          <p>No conversations yet. Start connecting with your network!</p>
        </div>
      );
    }

    return conversations.map((conv) => (
      <button
        key={conv.id}
        onClick={() => onSelectConversation(conv)}
        className={`w-full p-4 hover:bg-gray-50 text-left transition-colors ${
          selectedUser?.id === conv.user.id ? 'bg-blue-50' : ''
        }`}
      >
        <div className="flex items-start space-x-3">
          <img
            src={conv.user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(conv.user.name)}`}
            alt={conv.user.name}
            className="w-12 h-12 rounded-full"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 truncate">{conv.user.name}</h3>
              {conv.unread > 0 && (
                <span className="ml-2 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                  {conv.unread}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 truncate">{conv.lastMessage || 'Start a conversation'}</p>
            <p className="text-xs text-gray-500 mt-1">
              {conv.timestamp ? new Date(conv.timestamp).toLocaleString() : 'No messages yet'}
            </p>
          </div>
        </div>
      </button>
    ));
  };

  const renderMessages = () => {
    if (!selectedUser) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
            <p>Choose a contact to start messaging</p>
          </div>
        </div>
      );
    }

    if (loadingMessages) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      );
    }

    if (messages.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        </div>
      );
    }

    return messages.map((msg) => {
      const isOwnMessage = currentUser && msg.from === currentUser.id;
      return (
        <div key={msg.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
          <div
            className={`max-w-xs px-4 py-2 rounded-lg ${
              isOwnMessage ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'
            }`}
          >
            <p>{msg.content}</p>
            <p className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-gray-200">
          {/* Conversations List */}
          <div className="md:col-span-1 overflow-y-auto h-[600px]">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            </div>
            <div className="divide-y divide-gray-100">{renderConversationList()}</div>
          </div>

          {/* Chat Area */}
          <div className="md:col-span-2 flex flex-col h-[600px]">
            {selectedUser && (
              <div className="p-4 border-b border-gray-200 flex items-center space-x-3">
                <img
                  src={
                    selectedUser.avatar ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedUser.name)}`
                  }
                  alt={selectedUser.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedUser.name}</h3>
                  <p className="text-sm text-green-600">● Online</p>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">{renderMessages()}</div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => onMessageInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      onSendMessage();
                    }
                  }}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Message input"
                  disabled={!selectedUser || sendingMessage}
                />
                <button
                  onClick={onSendMessage}
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50"
                  aria-label="Send message"
                  title="Send message"
                  disabled={!selectedUser || sendingMessage || messageInput.trim().length === 0}
                >
                  {sendingMessage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;