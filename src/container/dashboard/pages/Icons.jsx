import { 
  FiVideo, 
  FiBookOpen, 
  FiFileText, 
  FiCheckSquare, 
  FiEdit, 
  FiMessageSquare, 
  FiCalendar, 
  FiClock, 
  FiArrowLeft, 
  FiCheck 
} from "react-icons/fi";
import { FaClock, FaGraduationCap } from "react-icons/fa";

const getIcon = (type) => {
  switch (type?.toLowerCase()) {
    case "video":
    case "watch":
      return <FiVideo className="h-5 w-5 text-indigo-300" />;
    case "practice":
      return <FiCheckSquare className="h-5 w-5 text-green-300" />;
    case "article":
    case "read":
      return <FiFileText className="h-5 w-5 text-blue-300" />;
    case "course":
      return <FaGraduationCap className="h-5 w-5 text-purple-300" />;
    case "documentation":
      return <FiBookOpen className="h-5 w-5 text-yellow-300" />;
    case "reflect":
      return <FiMessageSquare className="h-5 w-5 text-pink-300" />;
    case "learn":
    case "explore":
      return <FiEdit className="h-5 w-5 text-orange-300" />;
    default:
      return <FiEdit className="h-5 w-5 text-gray-300" />;
  }
};

export default getIcon;