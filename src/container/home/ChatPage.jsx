import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { FiArrowUp, FiAlertTriangle, FiList, FiBookOpen } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import 'highlight.js/styles/github-dark.css';
import 'katex/dist/katex.min.css';
import AppBody from '../../components/AppBody';
import useApiCallHooks from '../../hooks/useApiCallHooks';
import { ROLE_API_URLS } from './routes/ApiRoutes';
import CodeBlock from './components/CodeBlock';
import VoiceInput from './components/VoiceInput';
import TypingIndicator from './typingIndicator/TypingIndicator';
import TasksSection from './components/TasksSection';
import ResourcesSection from './components/ResourcesSection';

// Main ChatPage component to handle chat functionality
const ChatPage = () => {
  const location = useLocation();
  const { sessionId: sessionIdParam } = useParams();

  const {
    initialMessage = '',
    role = 'friend',
    sessionId: stateSessionId,
    userId,
    isNewSession = false,
    messages: initialMessages = [],
  } = location.state || {};

  const sessionId = stateSessionId || sessionIdParam;

  const [messages, setMessages] = useState(initialMessages || []);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const [response, loading, error, callAPI] = useApiCallHooks();
  const hasFetchedHistory = useRef(false);
  const hasSentInitialMessage = useRef(false);
  const prevSessionId = useRef(null);
  const [requestType, setRequestType] = useState(null);

  const stableInitialMessages = useMemo(() => initialMessages, [location.state]);

  const buildPayload = (messageText) => {
    // Build full history
    const history = messages.reduce((acc, msg, index, arr) => {
      if (msg.sender === "user") {
        const nextBot = arr[index + 1]?.sender === "bot" ? arr[index + 1].text : "";
        acc.push({
          user_message: msg.text,
          bot_message: nextBot,
        });
      }
      return acc;
    }, []);

    // Keep only the latest 8 entries
    const latestHistory = history.slice(-8);

    return {
      message: messageText,
      session_id: sessionId,
      userId: userId,
      full_history: latestHistory,
    };
  };



  console.log(response);


  const safeCallAPI = async (method, url, payload) => {
    setRequestType(method);
    return callAPI(method, url, payload);
  };

  useEffect(() => {
    if (sessionId && sessionId !== prevSessionId.current) {
      if (stableInitialMessages?.length > 0) {
        setMessages(stableInitialMessages);
      } else {
        setMessages([]);
      }
      hasFetchedHistory.current = false;
      prevSessionId.current = sessionId;
    }
  }, [sessionId, stableInitialMessages]);

  useEffect(() => {
    if (isNewSession && initialMessage.trim() && !hasSentInitialMessage.current) {
      hasSentInitialMessage.current = true;
      setMessages([{ sender: 'user', text: initialMessage, tasks: [], resources: [] }]);

      const sendInitialMessage = async () => {
        try {
          await safeCallAPI('post', ROLE_API_URLS[role], buildPayload(initialMessage));
        } catch (err) {
          console.error('Failed to send initial message:', err);
        }
      };
      sendInitialMessage();
    }
  }, [isNewSession, initialMessage, role, sessionId]);

  useEffect(() => {
    if (isNewSession && !hasSentInitialMessage.current) {
      hasSentInitialMessage.current = true;

      if (location.state?.skipApi) {
        // Only show role intro, no API call
        setMessages([
          { sender: "bot", text: roleIntros[role] || "👋 Hi there!", tasks: [], resources: [] }
        ]);
      } else if (initialMessage.trim()) {
        // Normal case (send user message & call API)
        setMessages([{ sender: "user", text: initialMessage, tasks: [], resources: [] }]);

        const sendInitialMessage = async () => {
          try {
            await safeCallAPI("post", ROLE_API_URLS[role], buildPayload(initialMessage));
          } catch (err) {
            console.error("Failed to send initial message:", err);
          }
        };
        sendInitialMessage();
      }
    }
  }, [isNewSession, initialMessage, role, sessionId, location.state]);


  useEffect(() => {
    if (isNewSession || !sessionId || hasFetchedHistory.current) return;

    const fetchChatHistory = async () => {
      hasFetchedHistory.current = true;
      try {
        await safeCallAPI('get', `/api/chat/${sessionId}`);
      } catch (err) {
        console.error('Failed to fetch chat history:', err);
        setMessages([
          {
            sender: 'bot',
            text: '⚠️ Failed to load chat history. Please try again.',
            tasks: [],
            resources: [],
          },
        ]);
      }
    };

    fetchChatHistory();
  }, [sessionId, isNewSession]);


  useEffect(() => {
    if (!response) return;

    if (
      response?.data?.status === true &&
      response.data.message === 'HistoryList' &&
      response.data.sessionId
    ) {
      const formattedMessages = response.data.historymessages
        .flatMap((m) => [
          {
            sender: 'user',
            text: m.userMessage?.content || '',
            tasks: [],
            resources: [],
          },
          m.aiResponse
            ? {
              sender: 'bot',
              text: m.aiResponse?.content || '',
              tasks: m.aiResponse?.tasks || [],
              resources: m.aiResponse?.resources || [],
            }
            : null,
        ])
        .filter(Boolean);
      setMessages(formattedMessages);
    } else if (response?.data?.messages) {
      const formattedMessages = response.data.messages
        .flatMap((m) => [
          {
            sender: 'user',
            text: m.userMessage?.content || '',
            tasks: [],
            resources: [],
          },
          m.aiResponse
            ? {
              sender: 'bot',
              text: m.aiResponse?.content || '',
              tasks: m.aiResponse?.tasks || [],
              resources: m.aiResponse?.resources || [],
            }
            : null,
        ])
        .filter(Boolean);
      setMessages(formattedMessages);
    } else if (response?.data?.answer) {
      const { answer, tasks = [], resources = [] } = response.data;
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: answer, tasks, resources },
      ]);
    }
  }, [response]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    const userMsg = newMessage.trim();
    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: userMsg, tasks: [], resources: [] },
    ]);
    setNewMessage('');
    if (textareaRef.current) textareaRef.current.style.height = '30px';

    try {
      await safeCallAPI('post', ROLE_API_URLS[role], buildPayload(userMsg));
    } catch (err) {
      console.error('API call failed:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: '⚠️ Server Error: Unable to contact the server. Please try again.',
          tasks: [],
          resources: [],
        },
      ]);
    }
  };

  const handleVoiceTranscript = (transcript) => setNewMessage(transcript);
  const roleIntros = {
    friend: " Hi! I am your friend, your supportive companion. How can I help you today?",
    mentor: " Hello! I’m your Mentor, here to guide you through challenges and help you grow.",
    "College Buddy": " Greetings! I’m your College Buddy. Let’s dive deep into your queries.",
  };



  return (
    <AppBody
      content={
        <div className="relative flex flex-col h-[calc(100vh-64px)]">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`relative ${msg.sender === 'user' ? 'max-w-[90%] ml-auto' : 'w-full'
                        }`}
                    >
                      {/* Message Content */}
                      <div
                        className={`py-3 px-4 rounded-2xl text-base break-words ${msg.sender === 'user'
                          ? 'bg-[#232323] text-white rounded-br-none'
                          : ' text-white rounded-bl-none'
                          }`}
                      >
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeHighlight, rehypeKatex]}
                          components={{
                            code({ inline, className, children }) {
                              return !inline ? (
                                <CodeBlock className={className}>{children}</CodeBlock>
                              ) : (
                                <code className="bg-gray-700 px-1 rounded">{children}</code>
                              );
                            },
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                      {/* Tasks and Resources Tables for Bot Messages */}
                      {msg.sender === 'bot' && (msg.tasks?.length > 0 || msg.resources?.length > 0) && (
                        <div className="mt-3 space-y-4 px-4">
                          <TasksSection tasks={msg.tasks} />
                          <ResourcesSection resources={msg.resources} />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="flex justify-start"
                  >
                    <div className="py-3 px-4 bg-red-900 text-white rounded-2xl flex items-center gap-2">
                      <FiAlertTriangle className="text-red-500 h-5 w-5" />
                      Server Error: Unable to contact the server.
                    </div>
                  </motion.div>
                )}
                {loading && requestType === 'post' && <TypingIndicator role={role} />}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="sticky bottom-0 px-4 sm:px-6 pb-4">
            <div className="max-w-4xl mx-auto flex flex-col rounded-xl border border-gray-800 bg-[#2a2a2a]">
              <textarea
                ref={textareaRef}
                placeholder={`Ask your ${role}...`}
                className="w-full resize-none px-3 pt-2 text-white bg-transparent focus:outline-none placeholder-gray-400 text-base"
                rows={1}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <div className="flex justify-between items-center px-2 py-3">
                <div className='flex gap-2'>
                  <VoiceInput onTranscript={handleVoiceTranscript} isDisabled={loading} />
                  {/* <button className='px-2 bg-white text-black  flex gap-1 items-center py-0.5 sm:px-3 sm:py-1 md:px-4 md:py-1.5  cursor-pointer rounded-lg text-md sm:text-md md:text-sm transition-all duration-300 border-2'>
                    <FiList className="text-black w-4 h-4" /> Task
                  </button>
                  <button className='px-2 bg-white text-black flex gap-1 items-center py-0.5 sm:px-3 sm:py-1 md:px-4 md:py-1.5  cursor-pointer rounded-lg text-md sm:text-md md:text-sm  transition-all duration-300 border-2'>
                    <FiBookOpen className="text-black h-4 w-4" /> Resources
                  </button> */}
                </div>
                <button
                  onClick={handleSend}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black hover:bg-gray-600 transition disabled:opacity-50"
                  disabled={loading}
                >
                  <FiArrowUp className="text-lg" />
                </button>
              </div>
            </div>
          </div>

        </div>
      }
    />
  );
};

export default ChatPage;import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { FiArrowUp, FiAlertTriangle, FiList, FiBookOpen } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import 'highlight.js/styles/github-dark.css';
import 'katex/dist/katex.min.css';
import AppBody from '../../components/AppBody';
import useApiCallHooks from '../../hooks/useApiCallHooks';
import { ROLE_API_URLS } from './routes/ApiRoutes';
import CodeBlock from './components/CodeBlock';
import VoiceInput from './components/VoiceInput';
import TypingIndicator from './typingIndicator/TypingIndicator';
import TasksSection from './components/TasksSection';
import ResourcesSection from './components/ResourcesSection';

// Main ChatPage component to handle chat functionality
const ChatPage = () => {
  const location = useLocation();
  const { sessionId: sessionIdParam } = useParams();

  const {
    initialMessage = '',
    role = 'friend',
    sessionId: stateSessionId,
    userId,
    isNewSession = false,
    messages: initialMessages = [],
  } = location.state || {};

  const sessionId = stateSessionId || sessionIdParam;

  const [messages, setMessages] = useState(initialMessages || []);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const [response, loading, error, callAPI] = useApiCallHooks();
  const hasFetchedHistory = useRef(false);
  const hasSentInitialMessage = useRef(false);
  const prevSessionId = useRef(null);
  const [requestType, setRequestType] = useState(null);

  const stableInitialMessages = useMemo(() => initialMessages, [location.state]);

  const buildPayload = (messageText) => ({
    message: messageText,
    session_id: sessionId,
    userId: userId,
    history: messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : role,
      content: msg.text,
      tasks: msg.tasks || [],
      resources: msg.resources || [],
    })),
  });

  const safeCallAPI = async (method, url, payload) => {
    setRequestType(method);
    return callAPI(method, url, payload);
  };

  useEffect(() => {
    if (sessionId && sessionId !== prevSessionId.current) {
      if (stableInitialMessages?.length > 0) {
        setMessages(stableInitialMessages);
      } else {
        setMessages([]);
      }
      hasFetchedHistory.current = false;
      prevSessionId.current = sessionId;
    }
  }, [sessionId, stableInitialMessages]);

  useEffect(() => {
    if (isNewSession && initialMessage.trim() && !hasSentInitialMessage.current) {
      hasSentInitialMessage.current = true;
      setMessages([{ sender: 'user', text: initialMessage, tasks: [], resources: [] }]);

      const sendInitialMessage = async () => {
        try {
          await safeCallAPI('post', ROLE_API_URLS[role], buildPayload(initialMessage));
        } catch (err) {
          console.error('Failed to send initial message:', err);
        }
      };
      sendInitialMessage();
    }
  }, [isNewSession, initialMessage, role, sessionId]);

  useEffect(() => {
    if (isNewSession && !hasSentInitialMessage.current) {
      hasSentInitialMessage.current = true;

      if (location.state?.skipApi) {
        // Only show role intro, no API call
        setMessages([
          { sender: "bot", text: roleIntros[role] || "👋 Hi there!", tasks: [], resources: [] }
        ]);
      } else if (initialMessage.trim()) {
        // Normal case (send user message & call API)
        setMessages([{ sender: "user", text: initialMessage, tasks: [], resources: [] }]);

        const sendInitialMessage = async () => {
          try {
            await safeCallAPI("post", ROLE_API_URLS[role], buildPayload(initialMessage));
          } catch (err) {
            console.error("Failed to send initial message:", err);
          }
        };
        sendInitialMessage();
      }
    }
  }, [isNewSession, initialMessage, role, sessionId, location.state]);


  useEffect(() => {
    if (isNewSession || !sessionId || hasFetchedHistory.current) return;

    const fetchChatHistory = async () => {
      hasFetchedHistory.current = true;
      try {
        await safeCallAPI('get', `/api/chat/${sessionId}`);
      } catch (err) {
        console.error('Failed to fetch chat history:', err);
        setMessages([
          {
            sender: 'bot',
            text: '⚠️ Failed to load chat history. Please try again.',
            tasks: [],
            resources: [],
          },
        ]);
      }
    };

    fetchChatHistory();
  }, [sessionId, isNewSession]);


  useEffect(() => {
    if (!response) return;

    if (
      response?.data?.status === true &&
      response.data.message === 'HistoryList' &&
      response.data.sessionId
    ) {
      const formattedMessages = response.data.historymessages
        .flatMap((m) => [
          {
            sender: 'user',
            text: m.userMessage?.content || '',
            tasks: [],
            resources: [],
          },
          m.aiResponse
            ? {
              sender: 'bot',
              text: m.aiResponse?.content || '',
              tasks: m.aiResponse?.tasks || [],
              resources: m.aiResponse?.resources || [],
            }
            : null,
        ])
        .filter(Boolean);
      setMessages(formattedMessages);
    } else if (response?.data?.messages) {
      const formattedMessages = response.data.messages
        .flatMap((m) => [
          {
            sender: 'user',
            text: m.userMessage?.content || '',
            tasks: [],
            resources: [],
          },
          m.aiResponse
            ? {
              sender: 'bot',
              text: m.aiResponse?.content || '',
              tasks: m.aiResponse?.tasks || [],
              resources: m.aiResponse?.resources || [],
            }
            : null,
        ])
        .filter(Boolean);
      setMessages(formattedMessages);
    } else if (response?.data?.answer) {
      const { answer, tasks = [], resources = [] } = response.data;
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: answer, tasks, resources },
      ]);
    }
  }, [response]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    const userMsg = newMessage.trim();
    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: userMsg, tasks: [], resources: [] },
    ]);
    setNewMessage('');
    if (textareaRef.current) textareaRef.current.style.height = '30px';

    try {
      await safeCallAPI('post', ROLE_API_URLS[role], buildPayload(userMsg));
    } catch (err) {
      console.error('API call failed:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: '⚠️ Server Error: Unable to contact the server. Please try again.',
          tasks: [],
          resources: [],
        },
      ]);
    }
  };

  const handleVoiceTranscript = (transcript) => setNewMessage(transcript);
  const roleIntros = {
    friend: " Hi! I am your friend, your supportive companion. How can I help you today?",
    mentor: " Hello! I’m your Mentor, here to guide you through challenges and help you grow.",
    "College Buddy": " Greetings! I’m your College Buddy. Let’s dive deep into your queries.",
  };



  return (
    <AppBody
      content={
        <div className="relative flex flex-col h-[calc(100vh-64px)]">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`relative ${msg.sender === 'user' ? 'max-w-[90%] ml-auto' : 'w-full'
                        }`}
                    >
                      {/* Message Content */}
                      <div
                        className={`py-3 px-4 rounded-2xl text-base break-words ${msg.sender === 'user'
                          ? 'bg-[#232323] text-white rounded-br-none'
                          : ' text-white rounded-bl-none'
                          }`}
                      >
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeHighlight, rehypeKatex]}
                          components={{
                            code({ inline, className, children }) {
                              return !inline ? (
                                <CodeBlock className={className}>{children}</CodeBlock>
                              ) : (
                                <code className="bg-gray-700 px-1 rounded">{children}</code>
                              );
                            },
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                      {/* Tasks and Resources Tables for Bot Messages */}
                      {msg.sender === 'bot' && (msg.tasks?.length > 0 || msg.resources?.length > 0) && (
                        <div className="mt-3 space-y-4 px-4">
                          <TasksSection tasks={msg.tasks} />
                          <ResourcesSection resources={msg.resources} />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="flex justify-start"
                  >
                    <div className="py-3 px-4 bg-red-900 text-white rounded-2xl flex items-center gap-2">
                      <FiAlertTriangle className="text-red-500 h-5 w-5" />
                      Server Error: Unable to contact the server.
                    </div>
                  </motion.div>
                )}
                {loading && requestType === 'post' && <TypingIndicator role={role} />}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="sticky bottom-0 px-4 sm:px-6 pb-4">
            <div className="max-w-4xl mx-auto flex flex-col rounded-xl border border-gray-800 bg-[#2a2a2a]">
              <textarea
                ref={textareaRef}
                placeholder={`Ask your ${role}...`}
                className="w-full resize-none px-3 pt-2 text-white bg-transparent focus:outline-none placeholder-gray-400 text-base"
                rows={1}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <div className="flex justify-between items-center px-2 py-3">
                <div className='flex gap-2'>
                   <VoiceInput onTranscript={handleVoiceTranscript} isDisabled={loading} />
                  {/* <button className='px-2 bg-white text-black  flex gap-1 items-center py-0.5 sm:px-3 sm:py-1 md:px-4 md:py-1.5  cursor-pointer rounded-lg text-md sm:text-md md:text-sm transition-all duration-300 border-2'>
                    <FiList className="text-black w-4 h-4" /> Task
                  </button>
                  <button className='px-2 bg-white text-black flex gap-1 items-center py-0.5 sm:px-3 sm:py-1 md:px-4 md:py-1.5  cursor-pointer rounded-lg text-md sm:text-md md:text-sm  transition-all duration-300 border-2'>
                    <FiBookOpen className="text-black h-4 w-4" /> Resources
                  </button> */}
                </div>
                <button
                  onClick={handleSend}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black hover:bg-gray-600 transition disabled:opacity-50"
                  disabled={loading}
                >
                  <FiArrowUp className="text-lg" />
                </button>
              </div>
            </div>
          </div>

        </div>
      }
    />
  );
};

export default ChatPage;