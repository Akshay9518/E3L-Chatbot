import React, { useState, useRef } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';

const CodeBlock = ({ className, children }) => {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef(null);

  const handleCopy = async () => {
    try {
      const codeText = codeRef.current?.innerText || '';
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <div className="relative bg-black rounded-lg my-2 mx-auto max-w-full">
      <button
        onClick={handleCopy}
        className="absolute top-3 right-2 text-gray-300 hover:text-white transition"
      >
        {copied ? <FiCheck /> : <FiCopy />}
      </button>
      <pre className="p-3 overflow-x-auto rounded-lg text-xs sm:text-sm max-w-full break-words whitespace-pre-wrap sm:whitespace-pre">
        <code
          ref={codeRef}
          className={className}
          style={{ backgroundColor: 'transparent', color: '#c9d1d9' }}
        >
          {children}
        </code>
      </pre>
    </div>
  );
};

export default CodeBlock;
