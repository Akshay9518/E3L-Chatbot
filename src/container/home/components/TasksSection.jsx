// components/TasksSection.jsx
import React from "react";
import { motion } from "framer-motion";
import { FiList } from "react-icons/fi";
import { FaClock } from "react-icons/fa";
import { HiPlay, HiCode, HiBookOpen, HiDocument } from "react-icons/hi";

const getTaskIcon = (type) => {
  switch (type?.toLowerCase()) {
    case "watch":
      return <HiPlay className="text-blue-400 text-lg" />;
    case "practice":
      return <HiCode className="text-green-400 text-lg" />;
    case "reflect":
      return <HiBookOpen className="text-purple-400 text-lg" />;
    case "read":
      return <HiDocument className="text-gray-400 text-lg" />;
    default:
      return <HiDocument className="text-gray-400 text-lg" />;
  }
};

const TasksSection = ({ tasks }) => {
  if (!tasks || tasks.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <FiList className="text-gray-300 h-7 w-7" />
        <h3 className="text-3xl font-semibold text-gray-200">Tasks</h3>
      </div>

      <div>
        {tasks.map((task, taskIdx) => (
          <motion.div
            key={taskIdx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: taskIdx * 0.1 }}
            className="mb-3"
          >
            {/* Task Header */}
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-gray-100 font-semibold text-lg">
                {task.title || "Untitled Task"}
              </h4>
              <span className="ml-2 px-3 py-0.5 text-xs rounded-full font-bold bg-gray-800 text-gray-300 border border-gray-600">
                {task.week ? `Week ${task.week}` : `Day ${task.day}`}
              </span>
            </div>

            {/* Subtasks */}
            {task.tasks?.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-gray-700 bg-[#252525]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#2f2f2f] text-gray-300 text-sm">
                      <th className="px-4 py-3 text-left font-semibold">Type</th>
                      <th className="px-4 py-3 text-left font-semibold">Duration</th>
                      <th className="px-4 py-3 text-left font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {task.tasks.map((subtask, subIdx) => (
                      <motion.tr
                        key={subIdx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: subIdx * 0.05 }}
                        className="border-t border-gray-700 hover:bg-[#333] transition"
                      >
                        {/* Type column with icon */}
                        <td className="px-4 py-3 flex items-center gap-2 text-gray-200 font-medium">
                          {getTaskIcon(subtask.type)}
                          <span className="capitalize">{subtask.type}</span>
                        </td>

                        {/* Duration */}
                        <td className="px-4 py-3 text-sm text-gray-400">
                          <div className="flex items-center gap-2">
                            <FaClock /> {subtask.duration || "N/A"}
                          </div>
                        </td>

                        {/* Description */}
                        <td className="px-4 py-3 text-sm text-gray-300 leading-relaxed">
                          {subtask.description || "No description available"}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">No subtasks available.</p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TasksSection;
