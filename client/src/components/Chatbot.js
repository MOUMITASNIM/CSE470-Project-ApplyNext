import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize chat with welcome message when opened for the first time
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          sender: 'bot',
          message: 'Hello! Welcome to our Study Abroad platform. How can I help you today?',
          timestamp: new Date()
        }
      ]);
    }
  }, [isOpen, messages.length]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setLoading(true);

    // Add user message to chat
    const newUserMessage = {
      sender: 'user',
      message: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      const response = await axios.post('/api/chat/message', {
        message: userMessage,
        sessionId: sessionId
      });

      const { botResponse, sessionId: newSessionId } = response.data;
      
      if (!sessionId) {
        setSessionId(newSessionId);
      }

      // Add bot response to chat
      const botMessage = {
        sender: 'bot',
        message: botResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in to use the chat feature');
      } else {
        toast.error('Failed to send message');
      }
      
      // Add error message to chat
      const errorMessage = {
        sender: 'bot',
        message: 'Sorry, I encountered an error. Please try again later.',
        timestamp: new Date()
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

  const quickReplies = [
    'What is this site?',
    'How to apply?',
    'Payment methods?',
    'Requirements?',
    'Hello'
  ];

  const handleQuickReply = async (reply) => {
    if (loading) return;
    
    setLoading(true);

    // Add user message to chat
    const newUserMessage = {
      sender: 'user',
      message: reply,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      const response = await axios.post('/api/chat/message', {
        message: reply,
        sessionId: sessionId
      });

      const { botResponse, sessionId: newSessionId } = response.data;
      
      if (!sessionId) {
        setSessionId(newSessionId);
      }

      // Add bot response to chat
      const botMessage = {
        sender: 'bot',
        message: botResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Error sending quick reply:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in to use the chat feature');
      } else {
        toast.error('Failed to send message');
      }
      
      // Add error message to chat
      const errorMessage = {
        sender: 'bot',
        message: 'Sorry, I encountered an error. Please try again later.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-secondary-600 text-white p-4 rounded-full shadow-lg hover:bg-secondary-700 transition-colors duration-200 z-40"
        aria-label="Open chat"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-xl border z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-80 h-96'
    }`}>
      {/* Chat Header */}
      <div className="bg-secondary-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center">
          <MessageCircle className="h-5 w-5 mr-2" />
          <span className="font-medium">Study Abroad Assistant</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label={isMinimized ? 'Expand chat' : 'Minimize chat'}
          >
            <Minimize2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Chat Messages */}
          <div className="flex-1 p-4 h-64 overflow-y-auto bg-gray-50">
            <div className="space-y-3">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      message.sender === 'user'
                        ? 'bg-secondary-600 text-white'
                        : 'bg-white text-gray-800 border'
                    }`}
                  >
                    <p>{message.message}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-secondary-200' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-800 border px-3 py-2 rounded-lg text-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Quick Replies */}
          {messages.length <= 1 && (
            <div className="px-4 py-2 border-t bg-gray-50">
              <p className="text-xs text-gray-600 mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-1">
                {quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply)}
                    className="text-xs bg-white border border-gray-300 rounded-full px-2 py-1 hover:bg-gray-100 transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Input */}
          <div className="p-4 border-t bg-white rounded-b-lg">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || loading}
                className="bg-secondary-600 text-white p-2 rounded-lg hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Chatbot;
