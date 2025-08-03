import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FiArrowUp, FiLogIn } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid"; // ✅ import UUID
import StarCanvas from "./components/bg_animation/StarCanvas";
import VoiceInput from "./components/VoiceInput";
import { HomePageUiRoutes } from "./routes/UiRoutes";
import { welcomePrompts, topicPrompts } from "./components/WelcomePagePrompts";
import { getDecryptedAuthData } from "../auth/utils/authUtils";
import AppBody from "../../components/AppBody";
import AuthModal from "../auth/AuthModel";

const WelcomePage = () => {
  const navigate = useNavigate();
  const textRef = useRef(null);
  const [message, setMessage] = useState("");
  const [activeRole, setActiveRole] = useState("friend");
  const [randomPrompt, setRandomPrompt] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [textOpacity, setTextOpacity] = useState(1);
  const [textShadow, setTextShadow] = useState("none");

  useEffect(() => {
    const fetchAuthData = async () => {
      const { email } = await getDecryptedAuthData();
      setIsAuthenticated(!!email);
      setIsLoading(false);
    };
    fetchAuthData();
  }, []);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * welcomePrompts.length);
    setRandomPrompt(welcomePrompts[randomIndex]);
  }, []);

  const handleVoiceTranscript = (transcript) => {
    setMessage(transcript);
  };

  const handleNavigate = async () => {
    if (!message.trim()) return;
    const sessionId = uuidv4(); // ✅ valid UUID
    const { userId, token } = await getDecryptedAuthData();
    navigate(HomePageUiRoutes.url.chat.replace(":randomString", sessionId), {
      state: {
        initialMessage: message,
        role: activeRole,
        sessionId,
        userId,
        token,
        isNewSession: true,
        skipApi: false,
      },
    });
    setMessage("");
  };

  const handleRoleNavigate = (role) => {
    const sessionId = uuidv4(); // ✅ valid UUID
    navigate(HomePageUiRoutes.url.chat.replace(":randomString", sessionId), {
      state: {
        initialMessage: "",
        role,
        sessionId,
        isNewSession: true,
        skipApi: true,
      },
    });
  };

  const handleTopicClick = (prompt) => {
    setMessage(prompt);
  };

  const handleLoginSuccess = (email) => {
    setIsAuthenticated(!!email);
    setIsModalOpen(false);
  };

  if (isLoading) return null;

  const content = (
    <div className="relative w-full" style={{ height: "calc(100vh - 3.5rem)" }}>
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 sm:px-6 lg:px-8">
        <motion.h1
          ref={textRef}
          className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-wide select-none"
          style={{ opacity: textOpacity, textShadow }}
          transition={{ duration: 1 }}
        >
          OneClarity
        </motion.h1>
        <p className="mt-3 sm:mt-4 text-gray-400 text-center text-xs sm:text-sm md:text-base lg:text-lg">
          {randomPrompt}
        </p>

        {/* Input Area */}
        <div
          className="mt-4 sm:mt-6 w-full bg-white dark:bg-[#2a2a2a] max-w-sm sm:max-w-xl md:max-w-xl lg:max-w-2xl flex flex-col rounded-2xl border border-gray-600 shadow-lg"
          style={{ minHeight: "60px", maxHeight: "200px" }}
        >
          <textarea
            placeholder="Ask anything"
            className="w-full resize-none overflow-hidden px-3 py-3 text-sm sm:text-base text-white bg-transparent focus:outline-none"
            rows={1}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleNavigate();
              }
            }}
          />
          <div className="flex justify-between items-center px-2 py-1 sm:px-3 sm:py-2">
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-4">
              {["friend", "mentor", "College Buddy"].map((role) => (
                <button
                  key={role}
                  className={`px-2 py-0.5 sm:px-3 sm:py-1 md:px-4 md:py-1.5 font-bold cursor-pointer rounded-xl text-xs sm:text-sm md:text-xs transition-all duration-300 border-2
                    ${activeRole === role
                      ? "bg-white text-black border-white hover:border-gray-300"
                      : "bg-gray-500 text-white border-gray-500 hover:border-gray-400"
                    }`}
                  onClick={() => handleRoleNavigate(role)}
                >
                  {role}
                </button>
              ))}
            </div>
            <div className="flex gap-2 items-end">
              <VoiceInput onTranscript={handleVoiceTranscript} />
              <button
                onClick={handleNavigate}
                className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center cursor-pointer rounded-full bg-gray-300 text-black hover:bg-gray-400 transition"
              >
                <FiArrowUp className="text-lg sm:text-xl" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick topic buttons */}
        <div className="flex flex-wrap mt-2 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl justify-center gap-2 sm:gap-4 px-2 py-2 sm:px-3 sm:py-3">
          {topicPrompts.map((topic) => (
            <button
              key={topic.label}
              className="relative overflow-hidden cursor-pointer py-2 px-3 text-xs sm:py-2 sm:px-3 sm:text-[10px] md:py-3 md:px-4 md:text-[13px] lg:py-3 lg:px-4 lg:text-sm rounded-xl font-medium group whitespace-nowrap shadow-md text-black dark:text-white bg-gradient-to-r from-gray-200 to-gray-300 dark:from-[#2a2a2a] dark:to-[#3a3a3a] transition-colors duration-500 ease-in-out hover:from-gray-300 hover:to-gray-400 dark:hover:from-[#3a3a3a] dark:hover:to-[#4a4a4a]"
              onClick={() => handleTopicClick(topic.prompt)}
            >
              <span className="relative z-10">{topic.label}</span>
              <span className="absolute inset-0 bg-white/20 translate-x-[-150%] group-hover:translate-x-[150%] skew-x-[-20deg] transition-transform duration-700 ease-in-out"></span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {!isAuthenticated && <StarCanvas textRef={textRef} setTextOpacity={setTextOpacity} setTextShadow={setTextShadow} />}
      {!isAuthenticated && (
        <div className="fixed top-4 right-4 z-50">
          <button
            className="px-3 py-2 sm:px-4 sm:py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 flex items-center justify-center text-sm sm:text-base cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            <FiLogIn className="mr-2 text-lg sm:text-xl" />
            Login
          </button>
        </div>
      )}
      <div className="fixed bottom-4 right-4 z-50">
        <AuthModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
      {isAuthenticated ? <AppBody content={content} /> : content}
    </div>
  );
};

export default WelcomePage;
