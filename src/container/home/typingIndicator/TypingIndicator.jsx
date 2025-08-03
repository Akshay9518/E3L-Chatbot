import React from "react";
import { motion } from "framer-motion";

const TypingIndicator = ({ role }) => {
  const roleName = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <motion.div
      transition={{ repeat: Infinity, duration: 1.5 }}
      className="py-3 px-4 my-2 rounded-2xl max-w-[60%] text-white text-base font-semibold"
    >
      <span className="flex items-center w-full">
        {roleName} is thinking
        <span className="flex items-end gap-1 ml-2 mt-3 font-bold">
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.2, delay: 0 }}
          >
            •
          </motion.span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }}
          >
            •
          </motion.span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.2, delay: 0.8 }}
          >
            •
          </motion.span>
        </span>
      </span>
    </motion.div>
  );
};

export default TypingIndicator;
