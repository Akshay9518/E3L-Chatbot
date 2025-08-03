// components/TasksModal.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";


const TasksModal = ({ isOpen, onClose, tasks }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#1e1e1e] rounded-2xl shadow-lg max-w-4xl w-full p-6 overflow-y-auto max-h-[80vh]"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">All Tasks</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-700 text-white"
              >
                <FiX size={20} />
              </button>
            </div>
            <TasksSection tasks={tasks} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TasksModal;
