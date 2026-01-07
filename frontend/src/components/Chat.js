import React, { useState, useEffect, useRef } from 'react';
import { conversationAPI } from '../services/chatService';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../contexts/DarkModeContext';

// Custom CSS for WhatsApp-style animations
const ChatStyles = () => (
  <style jsx>{`
    .bg-chat-bg {
      background-color: #e5ddd5;
      background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d1d1d1' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }
    
    .dark .bg-chat-bg {
      background-color: #1a1a1a;
      background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23404040' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }
    
    .typing-indicator {
      font-style: italic;
      opacity: 0.7;
    }
    
    @keyframes bounce {
      0%, 20%, 53%, 80%, 100% {
        transform: translate3d(0,0,0);
      }
      40%, 43% {
        transform: translate3d(0, -5px, 0);
      }
      70% {
        transform: translate3d(0, -3px, 0);
      }
      90% {
        transform: translate3d(0, -1px, 0);
      }
    }
    
    .animate-bounce {
      animation: bounce 1.4s infinite;
    }
  `}</style>
);

const Chat = ({ contractId, isWidget = true, onBackClick }) => {
  const { user } = useAuth(); // eslint-disable-line no-unused-vars
  const { darkMode } = useDarkMode();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]); // eslint-disable-line no-unused-vars
  const [messageStatus, setMessageStatus] = useState({}); // Track message delivery status
  const [isSending, setIsSending] = useState(false); // Track if a message is currently being sent (for UI)
  const [isUserAtBottom, setIsUserAtBottom] = useState(true);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagesRef = useRef(messages); // Ref to store current messages for polling
  const isMountedRef = useRef(false); // Track if component is mounted to prevent auto-submission
  const isSendingRef = useRef(false); // Track if a message is currently being sent
  const lastSendTimeRef = useRef(0); // Track last send time to prevent rapid submissions
  const submitCountRef = useRef(0); // Track number of submit attempts for debugging
  const isPollingRequestRef = useRef(false); // Track if a poll request is currently in progress

  // Load conversations
  useEffect(() => {
    // Reset current conversation when contractId changes
    console.log(`ContractId changed to: ${contractId}, stopping polling and resetting conversation`);
    stopPolling(); // Stop any existing polling
    setSelectedConversation(null);
    setMessages([]);
    setError(null);
    
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractId]);

  useEffect(() => {
    scrollToBottom(false);
  }, [messages]);

  // Keep messagesRef updated with current messages
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Set mounted flag after component is fully mounted
  useEffect(() => {
    const timer = setTimeout(() => {
      isMountedRef.current = true;
      console.log('Component fully mounted');
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Start polling for new messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      console.log(`Starting polling for conversation: ${selectedConversation.id}`);
      // Add a small delay to ensure conversation is fully loaded
      const pollingDelay = setTimeout(() => {
        startPolling();
      }, 1000);
      
      return () => {
        console.log(`Stopping polling for conversation: ${selectedConversation.id}`);
        clearTimeout(pollingDelay);
        stopPolling();
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await conversationAPI.getConversations();
      setConversations(response.data);
      
      // Auto-select conversation for the given contract
      if (contractId) {
        const contractConversation = response.data.find(
          conv => conv.contract === contractId
        );
        if (contractConversation) {
          setSelectedConversation(contractConversation);
          loadMessages(contractConversation.id);
        }
      }
    } catch (err) {
      setError('Failed to load conversations');
      console.error('Error loading conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      console.log(`Loading messages for conversation ${conversationId}`);
      const response = await conversationAPI.getMessages(conversationId);
      console.log(`Loaded ${response.data.length} messages`);
      
      // Sort messages chronologically (oldest first)
      const sortedMessages = response.data.sort((a, b) => 
        new Date(a.created_at) - new Date(b.created_at)
      );
      
      // Add status to messages
      const messagesWithStatus = sortedMessages.map(msg => ({
        ...msg,
        status: messageStatus[msg.id] || (msg.is_read ? 'read' : 'delivered')
      }));
      
      setMessages(messagesWithStatus);
    } catch (err) {
      setError('Failed to load messages');
      console.error('Error loading messages:', err);
    }
  };

  const createConversation = async () => {
    try {
      const response = await conversationAPI.createConversation(contractId);
      setSelectedConversation(response.data);
      setConversations([...conversations, response.data]);
      loadMessages(response.data.id);
    } catch (err) {
      setError('Failed to create conversation');
      console.error('Error creating conversation:', err);
    }
  };

  const sendMessage = async (e, voiceNote = null) => {
    e.preventDefault();
    console.log('sendMessage called with:', { voiceNote, newMessage, selectedConversation, isMounted: isMountedRef.current, isSending: isSendingRef.current });
    
    // Prevent message sending if component is not fully mounted
    if (!isMountedRef.current) {
      console.log('sendMessage returning early - component not fully mounted');
      return;
    }
    
    // Prevent multiple simultaneous message sends
    if (isSendingRef.current) {
      console.log('sendMessage returning early - message already being sent');
      return;
    }
    
    // Add debounce check - prevent messages sent within 2000ms of each other (2 seconds)
    const now = Date.now();
    if (now - lastSendTimeRef.current < 2000) {
      console.log('sendMessage returning early - too rapid submission', {
        timeSinceLast: now - lastSendTimeRef.current,
        threshold: 2000
      });
      return;
    }
    lastSendTimeRef.current = now;
    
    // Additional safety check - prevent empty messages
    const messageText = voiceNote ? voiceNote.text : newMessage.trim();
    if (!messageText || !selectedConversation || messageText.length === 0) {
      console.log('sendMessage returning early - missing text or conversation or empty text');
      return;
    }
    
    // Check for duplicate messages within the last 5 seconds
    const recentDuplicate = messagesRef.current.find(msg => 
      msg.text === messageText && 
      msg.is_mine && 
      (Date.now() - new Date(msg.created_at).getTime()) < 5000
    );
    
    if (recentDuplicate) {
      console.log('sendMessage returning early - duplicate message detected within 5 seconds', {
        duplicateText: messageText,
        originalCreatedAt: recentDuplicate.created_at
      });
      return;
    }
    
    // Set sending flag to prevent multiple submissions
    isSendingRef.current = true;
    setIsSending(true); // Update UI state
    
    // Safety timeout - reset sending state after 10 seconds in case something goes wrong
    const safetyTimeout = setTimeout(() => {
      if (isSendingRef.current) {
        console.log('Safety timeout triggered - resetting sending state');
        isSendingRef.current = false;
        setIsSending(false);
      }
    }, 10000);
    
    // Create temporary message for immediate UI feedback
    const tempMessage = {
      id: `temp-${Date.now()}`,
      text: messageText,
      sender: user.id,
      sender_name: user.name || user.username,
      sender_avatar: user.avatar || '',
      conversation: selectedConversation.id,
      created_at: new Date().toISOString(),
      is_mine: true,
      message_type: 'text',
      status: 'sending',
      is_read: false,
      replying_to: replyingTo ? {
        id: replyingTo.id,
        text: replyingTo.text,
        sender_name: replyingTo.sender_name
      } : null
    };

    // Add temporary message immediately and sort chronologically
    setMessages(prev => {
      const allMessages = [...prev, tempMessage];
      return allMessages.sort((a, b) => 
        new Date(a.created_at) - new Date(b.created_at)
      );
    });
    setNewMessage('');
    if (replyingTo) {
      setReplyingTo(null);
    }

    try {
      const response = await conversationAPI.sendMessage(selectedConversation.id, {
        text: messageText,
        message_type: 'text'
      });
      
      // Clear safety timeout
      clearTimeout(safetyTimeout);
      
      // Reset sending flag
      isSendingRef.current = false;
      setIsSending(false); // Update UI state
      
      // Replace temporary message with real one and sort chronologically
      setMessages(prev => {
        // Check if the real message was already added (e.g. by polling)
        const alreadyExists = prev.some(msg => msg.id === response.data.id);
        
        if (alreadyExists) {
          // If the real message exists, just remove the temporary one
          const filteredMessages = prev.filter(msg => msg.id !== tempMessage.id);
          return filteredMessages.sort((a, b) => 
            new Date(a.created_at) - new Date(b.created_at)
          );
        }

        const updatedMessages = prev.map(msg => 
          msg.id === tempMessage.id ? { ...response.data, status: 'sent' } : msg
        );
        return updatedMessages.sort((a, b) => 
          new Date(a.created_at) - new Date(b.created_at)
        );
      });
      
      // Update message status
      setMessageStatus(prev => ({
        ...prev,
        [response.data.id]: 'sent'
      }));
      
    } catch (err) {
      // Clear safety timeout
      clearTimeout(safetyTimeout);
      
      // Reset sending flag even on error
      isSendingRef.current = false;
      setIsSending(false); // Update UI state
      
      setError('Failed to send message');
      console.error('Error sending message:', err);
      
      // Update temporary message to show error and sort chronologically
      setMessages(prev => {
        const updatedMessages = prev.map(msg => 
          msg.id === tempMessage.id ? { ...msg, status: 'failed' } : msg
        );
        return updatedMessages.sort((a, b) => 
          new Date(a.created_at) - new Date(b.created_at)
        );
      });
    }
  };

  const startPolling = () => {
    if (pollingIntervalRef.current) {
      return;
    }
    
    stopPolling();
    
    const poll = async () => {
      if (!selectedConversation) return;
      if (isPollingRequestRef.current) {
        return;
      }
      isPollingRequestRef.current = true;
      
      try {
        await loadMessages(selectedConversation.id);
      } catch (err) {
        console.error('Error polling messages:', err);
      } finally {
        isPollingRequestRef.current = false;
      }
    };
    
    pollingIntervalRef.current = setInterval(poll, 3000);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const scrollToBottom = (force = false) => {
    if (!messagesEndRef.current) return;
    if (!force && !isUserAtBottom) return;
    messagesEndRef.current.scrollIntoView({ behavior: force ? 'auto' : 'smooth' });
  };

  const handleInputChange = (e) => {
    console.log('Input changed:', e.target.value);
    setNewMessage(e.target.value);
    
    // Implement typing indicator
    if (!isTyping && !isSending) {
      setIsTyping(true);
      // Here you would typically send a typing indicator to the server
      // For now, we'll just manage local state
    }
    
    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new typing timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  const handleMessagesScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const threshold = 80;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setIsUserAtBottom(distanceFromBottom <= threshold);
  };

  const handleFormSubmit = (e) => {
    submitCountRef.current += 1;
    console.log(`Form submit event triggered #${submitCountRef.current}`, e.type, e.target, { 
      isSending: isSendingRef.current, 
      lastSendTime: lastSendTimeRef.current,
      currentTime: Date.now()
    });
    
    // Always prevent default form submission
    if (e.preventDefault) {
      e.preventDefault();
    }
    if (e.stopPropagation) {
      e.stopPropagation(); // Stop event propagation
    }
    
    // Aggressive protection against multiple submissions
    if (isSendingRef.current) {
      console.log('Form submission blocked - message already being sent');
      return;
    }
    
    // Check if too soon since last submission (1 second minimum)
    const now = Date.now();
    if (now - lastSendTimeRef.current < 1000) {
      console.log('Form submission blocked - too rapid submission');
      return;
    }
    
    // Only proceed with sendMessage if component is fully mounted
    if (isMountedRef.current) {
      sendMessage(e);
    } else {
      console.log('Form submission prevented - component not fully mounted');
    }
  };

  const handleButtonClick = (e) => {
    console.log('Button click triggered', e.type, e.target);
    // Prevent default button behavior
    e.preventDefault();
    e.stopPropagation();
    
    // Call the main form submit handler
    handleFormSubmit(e);
  };

  const handleReply = (message) => {
    setReplyingTo(message);
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = new Date(message.created_at).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    // Sort messages within each date group chronologically
    Object.keys(groups).forEach(date => {
      groups[date].sort((a, b) => 
        new Date(a.created_at) - new Date(b.created_at)
      );
    });
    
    return groups;
  };

  const getMessageStatusIcon = (message) => {
    if (message.is_mine) {
      if (message.status === 'sending') {
        return <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>;
      } else if (message.status === 'sent') {
        return (
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      } else if (message.status === 'delivered') {
        return (
          <>
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <svg className="w-3 h-3 text-gray-400 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </>
        );
      } else if (message.status === 'read') {
        return (
          <>
            <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <svg className="w-3 h-3 text-blue-500 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </>
        );
      } else if (message.status === 'failed') {
        return <span className="text-red-500 text-xs font-bold">!</span>;
      }
    }
    return null;
  };

  const retryMessage = async (message) => {
    if (message.status !== 'failed') return;
    
    // Remove failed message
    setMessages(prev => prev.filter(msg => msg.id !== message.id));
    
    // Set the message text back to input
    setNewMessage(message.text);
    
    // Focus the input
    const input = document.querySelector('input[placeholder="Type a message"]');
    if (input) {
      input.focus();
    }
  };

  if (loading) {
    return (
      <>
        <ChatStyles />
        <div className={`flex items-center justify-center h-64 ${
          darkMode ? 'bg-gray-800' : 'bg-gray-50'
        }`}>
          <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
            darkMode ? 'border-green-500' : 'border-green-600'
          }`}></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <ChatStyles />
        <div className={`border px-4 py-3 rounded ${
          darkMode 
            ? 'bg-red-900 border-red-700 text-red-300'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {error}
        </div>
      </>
    );
  }

  if (!selectedConversation && contractId) {
    return (
      <div className={`text-center py-8 ${
        darkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'
      }`}>
        <p className={`mb-4 ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>No conversation found for this contract.</p>
        <button
          onClick={createConversation}
          className={`px-4 py-2 rounded ${
            darkMode
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Start Conversation
        </button>
      </div>
    );
  }

  if (!selectedConversation) {
    return (
      <div className={`text-center py-8 ${
        darkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'
      }`}>
        <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
          Select a conversation to start messaging.
        </p>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);
  
  return (
      <>
        <ChatStyles />
    <div className={`flex flex-col ${isWidget ? 'h-[380px] sm:h-[420px] md:h-[520px]' : 'h-full'} ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg shadow-lg overflow-hidden`}>
      {/* Header - WhatsApp Style */}
      <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-green-600 text-white'} px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-green-700'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBackClick}
              className={`md:hidden p-1 rounded-full transition-colors ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-green-700'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              darkMode ? 'bg-gray-700' : 'bg-green-500'
            }`}>
              <span className="text-base md:text-lg font-semibold">
                {selectedConversation.contract_details?.title?.charAt(0) || 'C'}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-base md:text-lg">
                {selectedConversation.contract_details?.title || 'Contract Discussion'}
              </h3>
              <p className={`text-xs sm:text-sm ${
                darkMode ? 'text-gray-300' : 'text-green-100'
              }`}>
                {typingUsers.length > 0 ? (
                  <span className="typing-indicator">typing...</span>
                ) : (
                  selectedConversation.participants_names?.join(', ')
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        onScroll={handleMessagesScroll}
        className={`flex-1 overflow-y-auto px-2 sm:px-3 md:px-4 lg:px-6 py-4 ${darkMode ? 'bg-gray-900' : 'bg-chat-bg'}`}
      >
        <div className="max-w-2xl mx-auto">
          {typingUsers.length > 0 && (
            <div className="flex justify-start mb-2 px-4">
              <div className={`rounded-2xl rounded-bl-none px-3 py-2 shadow-sm ${
                darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
              }`}>
                <div className="flex space-x-1">
                  <div className={`w-2 h-2 rounded-full animate-bounce ${
                    darkMode ? 'bg-gray-300' : 'bg-gray-400'
                  }`} style={{animationDelay: '0ms'}}></div>
                  <div className={`w-2 h-2 rounded-full animate-bounce ${
                    darkMode ? 'bg-gray-300' : 'bg-gray-400'
                  }`} style={{animationDelay: '150ms'}}></div>
                  <div className={`w-2 h-2 rounded-full animate-bounce ${
                    darkMode ? 'bg-gray-300' : 'bg-gray-400'
                  }`} style={{animationDelay: '300ms'}}></div>
                </div>
              </div>
            </div>
          )}
          
          {Object.entries(messageGroups).map(([date, dateMessages]) => (
            <div key={date} className="mb-4">
              <div className="flex justify-center my-4">
                <div className={`text-xs px-3 py-1 rounded-full ${
                  darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                }`}>
                  {formatDate(dateMessages[0].created_at)}
                </div>
              </div>
              
              {dateMessages.map((message, index) => {
              const isFirstInSequence = index === 0 || 
                dateMessages[index - 1].sender !== message.sender;
              const isLastInSequence = index === dateMessages.length - 1 || 
                dateMessages[index + 1].sender !== message.sender;
              
                return (
                  <div
                    key={message.id}
                    className={`${message.is_mine ? 'flex justify-end' : 'flex justify-start'} ${
                      isFirstInSequence ? 'mt-2' : ''
                    }`}
                  >
                    <div className={`flex items-end space-x-1 max-w-full ${
                      message.is_mine ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                    {!message.is_mine && isFirstInSequence && (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        darkMode ? 'bg-gray-600' : 'bg-gray-300'
                      }`}>
                        <span className={`text-xs font-medium ${
                          darkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {message.sender_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                    
                    {!message.is_mine && !isFirstInSequence && (
                      <div className="w-8 h-8 flex-shrink-0"></div>
                    )}
                    
                    <div
                      className={`relative px-3 py-1.5 sm:px-3.5 sm:py-2 md:px-3.5 md:py-2.5 rounded-2xl max-w-[78%] md:max-w-[70%] lg:max-w-[62%] ${
                        message.is_mine
                          ? darkMode 
                            ? 'bg-green-600 text-white rounded-br-none'
                            : 'bg-green-500 text-white rounded-br-none'
                          : darkMode
                            ? 'bg-gray-700 text-white rounded-bl-none shadow-sm'
                            : 'bg-white text-gray-900 rounded-bl-none shadow-sm'
                      } ${
                        !message.is_mine && !isFirstInSequence ? 'rounded-tl-lg' : ''
                      } ${
                        message.is_mine && !isFirstInSequence ? 'rounded-tr-lg' : ''
                      } ${
                        !isLastInSequence ? 'mb-1' : ''
                      } ${
                        message.status === 'failed' 
                          ? darkMode 
                            ? 'border-2 border-red-500 hover:bg-red-900'
                            : 'border-2 border-red-300 hover:bg-red-50'
                          : ''
                      } group`}
                      onClick={() => message.status === 'failed' && retryMessage(message)}
                      style={{ cursor: message.status === 'failed' ? 'pointer' : 'default' }}
                      title={message.status === 'failed' ? 'Click to retry sending this message' : ''}
                    >
                      {/* System Message */}
                      {message.message_type === 'system' && (
                        <div className="text-xs opacity-75 mb-1 border-b border-current pb-1">
                          System
                        </div>
                      )}
                      
                      {/* Reply To */}
                      {message.replying_to && (
                        <div className={`mb-2 p-2 rounded border-l-2 text-xs ${
                          message.is_mine 
                            ? darkMode
                              ? 'border-green-400 bg-green-600 bg-opacity-30'
                              : 'border-green-200 bg-green-400 bg-opacity-20'
                            : darkMode
                              ? 'border-gray-600 bg-gray-800'
                              : 'border-gray-300 bg-gray-50'
                        }`}>
                          <div className={`font-medium ${
                            message.is_mine 
                              ? darkMode ? 'text-green-200' : 'text-green-100'
                              : darkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {message.replying_to.sender_name}
                          </div>
                          <div className={`truncate ${
                            message.is_mine 
                              ? darkMode ? 'text-green-200' : 'text-green-100'
                              : darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {message.replying_to.text}
                          </div>
                        </div>
                      )}
                      
                      <p className="text-[11px] sm:text-[13px] md:text-sm leading-relaxed">{message.text}</p>
                      
                      <div className={`flex items-center justify-end mt-1 space-x-1 ${
                        message.is_mine 
                          ? darkMode ? 'text-green-200' : 'text-green-100'
                          : darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        <span className="text-xs">
                          {formatTime(message.created_at)}
                        </span>
                        
                        {message.is_mine && (
                          <div className="flex items-center">
                            {getMessageStatusIcon(message)}
                          </div>
                        )}
                      </div>
                      
                      <div className={`absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                        message.is_mine ? 'mr-2' : 'ml-2'
                      }`}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReply(message);
                          }}
                          className={`p-1 rounded-full text-xs ${
                            message.is_mine 
                              ? darkMode ? 'text-green-200 hover:text-white' : 'text-green-100 hover:text-white'
                              : darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                          }`}
                          title="Reply to this message"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  </div>
                );
              })}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start mb-2 px-4">
              <div className={`rounded-2xl rounded-bl-none px-3 py-2 shadow-sm ${
                darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
              }`}>
                <div className="flex space-x-1">
                  <div className={`w-2 h-2 rounded-full animate-bounce ${
                    darkMode ? 'bg-gray-300' : 'bg-gray-400'
                  }`}></div>
                  <div className={`w-2 h-2 rounded-full animate-bounce ${
                    darkMode ? 'bg-gray-300' : 'bg-gray-400'
                  }`} style={{animationDelay: '0.1s'}}></div>
                  <div className={`w-2 h-2 rounded-full animate-bounce ${
                    darkMode ? 'bg-gray-300' : 'bg-gray-400'
                  }`} style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input - WhatsApp Style */}
        <div className={`px-4 py-3 border-t ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          {/* Reply Preview */}
          {replyingTo && (
            <div className={`mb-3 p-3 rounded-lg border-l-4 ${
              darkMode ? 'bg-gray-700 border-green-600' : 'bg-gray-50 border-green-500'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className={`text-xs mb-1 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Replying to {replyingTo.sender_name}
                  </div>
                  <div className={`text-xs sm:text-sm truncate ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {replyingTo.text}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={cancelReply}
                  className={`ml-2 ${
                    darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-3 px-2 md:px-0">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !isSending && newMessage.trim()) {
                  e.preventDefault();
                  e.stopPropagation();
                  handleFormSubmit(e);
                }
              }}
              placeholder={isSending ? "Sending..." : "Type a message"}
              disabled={isSending}
              className={`w-full border-none rounded-full px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${
                darkMode 
                  ? 'bg-gray-700 text-white placeholder-gray-400 focus:bg-gray-600'
                  : 'bg-gray-100 text-gray-900 focus:bg-white'
              } ${
                isSending ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            />
          </div>
          <button
            type="button"
            onClick={handleButtonClick}
            disabled={!newMessage.trim() || isSending}
            className={`p-3 rounded-full transition-all ${
              newMessage.trim() && !isSending
                ? darkMode
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-green-500 text-white hover:bg-green-600'
                : darkMode
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default Chat;
