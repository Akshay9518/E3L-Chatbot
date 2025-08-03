// components/ResourcesSection.jsx
import React from "react";
import { motion } from "framer-motion";
import { FiBookOpen } from "react-icons/fi";
import { FaVideo, FaBook, FaFileAlt, FaFileCode } from "react-icons/fa";

const getResourceIcon = (type) => {
  switch (type?.toLowerCase()) {
    case "video":
      return <FaVideo className="text-blue-400 text-lg" />;
    case "course":
      return <FaBook className="text-green-400 text-lg" />;
    case "article":
      return <FaFileAlt className="text-purple-400 text-lg" />;
    case "documentation":
      return <FaFileCode className="text-yellow-400 text-lg" />;
    default:
      return <FaFileAlt className="text-gray-400 text-lg" />;
  }
};

const ResourcesSection = ({ resources }) => {
  if (!resources || resources.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <FiBookOpen className="text-base text-white h-7 w-7" />
        <h3 className="text-3xl font-semibold text-gray-200">Resources</h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {resources.map((res, resIdx) => (
          <motion.div
            key={resIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: resIdx * 0.05 }}
            className="bg-[#252525] border border-gray-700 rounded-xl p-4 shadow-md hover:shadow-lg hover:bg-[#2f2f2f] transition flex flex-col justify-between"
          >
            <div className="flex justify-between">
              {/* Type + Icon */}
              <div className="flex items-center gap-2 mb-2">
                {getResourceIcon(res.type)}
                <span className="capitalize text-gray-200 font-medium">
                  {res.type || "Other"}
                </span>
              </div>
              {/* Platform Badge */}
              <div>
                <span className="inline-block px-3 py-1 text-xs font-bold rounded-lg bg-gray-800 text-gray-300 border border-gray-600">
                  {res.platform || "N/A"}
                </span>
              </div>
            </div>

            {/* Title */}
            <a
              href={res.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-400 hover:underline text-lg mb-1 line-clamp-1"
            >
              {res.title || "Untitled"}
            </a>

            {/* Description */}
            <p className="text-gray-400 text-sm line-clamp-3 mb-3">
              {res.description || "No description available"}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ResourcesSection;
