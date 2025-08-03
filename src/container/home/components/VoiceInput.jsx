import React, { useState, useEffect } from 'react';
import { FiMic } from 'react-icons/fi';
import { motion } from 'framer-motion';

const VoiceInput = ({ onTranscript, isDisabled }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = React.useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API is not supported in this browser.');
      setIsSupported(false);
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join('');
      onTranscript(transcript);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript]);

  const handleMicClick = () => {
    if (!isSupported) {
      alert('Speech recognition is not supported in this browser. Please use a supported browser like Chrome or Edge.');
      return;
    }

    if (!recognitionRef.current) {
      console.error('Recognition is not initialized.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
    setIsListening(!isListening);
  };

  // Animation variants for the mic button with a pulsing ring effect
  const micVariants = {
   
    active: {
      scale: 1,
     
      transition: {
        boxShadow: {
          repeat: Infinity,
          duration: 1.5,
          ease: 'easeOut',
        },
      },
    },
  };

  return (
    <motion.button
      className={`p-1 rounded-full ${
        isListening ? 'text-red-500' : 'text-white'
      } disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-opacity-50`}
      onClick={handleMicClick}
      disabled={isDisabled || !isSupported}
      variants={micVariants}
      animate={isListening ? 'active' : 'idle'}
      title={isSupported ? (isListening ? 'Stop listening' : 'Start listening') : 'Speech recognition not supported'}
      aria-label={isSupported ? (isListening ? 'Stop listening' : 'Start listening') : 'Speech recognition not supported'}
    >
      <FiMic className="text-xl sm:text-2xl" />
    </motion.button>
  );
};

export default VoiceInput;