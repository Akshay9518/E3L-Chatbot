import React, { useEffect, useState } from "react";
import AppBody from "../../components/AppBody";
import {
  FiVideo,
  FiBookOpen,
  FiFileText,
  FiCheckSquare,
  FiEdit,
  FiMessageSquare,
  FiCalendar,
  FiClock,
  FiArrowLeft
} from "react-icons/fi";
import { FaClock, FaGraduationCap } from "react-icons/fa";
import useApiCallHooks from "../../hooks/useApiCallHooks";
import { DashboardApiRoutes } from "./routes/ApiRoutes";
import SkeletonLoader from "./skeleton/SkeletonLoader";
import { getDecryptedAuthData } from "../auth/utils/authUtils";
import { API_URL } from "../../url/config";
import { BsArrowRightCircleFill } from "react-icons/bs";

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

const Dashboard = () => {
  const [response, loading, error, callAPI] = useApiCallHooks();
  const [auth, setAuth] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [viewMode, setViewMode] = useState({});
  const [calendarData, setCalendarData] = useState({});

  useEffect(() => {
    const fetchAuth = async () => {
      const data = await getDecryptedAuthData();
      setAuth(data);
    };
    fetchAuth();
    callAPI("get", DashboardApiRoutes.api.dashboard);
  }, [callAPI]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      setAuth((prev) => ({ ...prev, token }));
      window.history.replaceState({}, document.title, "/dashboard");
    }
  }, []);

  const handleDateChange = (planId, date) => {
    setCalendarData((prev) => ({ ...prev, [planId]: date }));
  };

  const handleAddToCalendar = (planId) => {
    const startDate = calendarData[planId] || new Date().toISOString();

    if (!auth?.token) {
      alert("Please log in to add tasks to calendar");
      return;
    }
    if (!auth?.googleAccessToken) {
      window.location.href = `${API_URL}/auth/google?ts=` + Date.now();
      return;
    }

    callAPI(
      "post",
      `/api/plans/${planId}/calendar`,
      {
        accessToken: auth.googleAccessToken,
        startDate
      },
      {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      }
    )
      .then((res) => {
        if (res.status === 200) {
          alert("All tasks added to Google Calendar!");
          callAPI("get", DashboardApiRoutes.api.dashboard);
        }
      })
      .catch((err) => {
        if (
          err.response?.status === 401 &&
          err.response.data.action === "reauthenticate"
        ) {
          window.location.href = `${API_URL}/auth/google?ts=` + Date.now();
        } else {
          alert(
            "Failed to add tasks to calendar: " +
            (err.response?.data?.message || err.message)
          );
        }
      });
  };

  /** ---------------- Session List ---------------- **/
  const renderSessionList = () => (
    <div className="space-y-5">
      {response?.data?.sessions?.length > 0 ? (
        response.data.sessions[0].topics.map((topic) => {
          // Calculate total tasks and resources for the topic
          const totalTasks = topic.tasks?.length || 0;
          const totalResources = topic.resources?.length || 0;
          // Dummy progress for demonstration
          const dummyProgress = Math.round(Math.random() * 100); // Random 0-100%

          return (
            <div
              key={topic.planId}
              className="bg-[#212121] border border-gray-700 shadow-lg rounded-xl overflow-hidden p-5 transition"
            >
              {/* Row 1 → Title, Plan ID, Session ID, Created At */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-lg font-semibold text-white mt-1">
                    {topic.title}
                  </h2>
                  <p className="text-gray-400 text-sm flex items-center gap-1 text-gray-200">
                    <span className="font-medium text-gray-200"><FaClock/></span>{" "}
                    {(() => {
                      const createdDate = new Date(topic.createdAt);
                      const today = new Date();
                      const yesterday = new Date();
                      yesterday.setDate(today.getDate() - 1);

                      const isToday =
                        createdDate.toDateString() === today.toDateString();
                      const isYesterday =
                        createdDate.toDateString() === yesterday.toDateString();

                      if (isToday) return "Today";
                      if (isYesterday) return "Yesterday";
                      return createdDate.toLocaleDateString();
                    })() || "N/A"}
                  </p>

                </div>
                <div>
                  <button
                    onClick={() => setActiveSession({ ...response.data.sessions[0], topics: [topic] })}
                    className="px-6 py-2 text-sm font-bold rounded-xl bg-white cursor-pointer text-black border border-gray-600 transition"
                  >
                    View
                  </button>
                </div>
              </div>


              {/* Row 3 → Progress Bar */}
              <div>
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{dummyProgress}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-white h-2 rounded-full transition-all duration-500"
                    style={{ width: `${dummyProgress}%` }}
                  />
                </div>
              </div>

              {/* Row 4 → Task and Resource Count */}
              <div className="flex justify-between text-center mt-3">
                {/* Row 2 → Plan Type and Days */}
                <div className="">
                  <p className="text-gray-400 text-sm">
                    <span className="font-medium text-gray-400">
                      {topic.planType
                        ? topic.planType.charAt(0).toUpperCase() + topic.planType.slice(1)
                        : ""}
                    </span>
                    :{" "}
                    <span className="text-white">{topic.tasks?.length > 0 ? topic.tasks.length : "0"}</span>
                  </p>
                </div>

                <div className="flex gap-4">
                  <div className="flex gap-2">
                    <p className="text-gray-400 text-sm">Tasks</p>
                    <p className="text-white font-semibold">{totalTasks}</p>
                  </div>
                  <div className="flex gap-2">
                    <p className="text-gray-400 text-sm">Resources</p>
                    <p className="text-white font-semibold">{totalResources}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-gray-400">No topics available</p>
      )}
    </div>
  );

  /** ---------------- Session Details ---------------- **/
  const renderSessionDetails = (session) => (
    <div className="flex flex-col h-full">
      {/* Fixed Top Bar */}
      <div className="bg-[#1f1f1f] p-4 rounded-xl border border-gray-700 shadow-md flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveSession(null)}
            className="flex items-center text-sm bg-gray-700 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition"
          >
            <FiArrowLeft className="mr-1" /> Back
          </button>
          <h2 className="text-xl font-bold text-white">{session.topics[0].title}</h2>
        </div>

        {session.topics?.[0]?.planId && (
          <div className="flex items-center space-x-3">
            <input
              type="date"
              value={
                calendarData[session.topics[0].planId] ||
                new Date().toISOString().split("T")[0]
              }
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) =>
                handleDateChange(session.topics[0].planId, e.target.value)
              }
              className="p-2 bg-[#1f1f1f] text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />

            <button
              onClick={() => handleAddToCalendar(session.topics[0].planId)}
              className="flex items-center text-sm bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition"
            >
              <FiCalendar className="mr-1" /> Add to Calendar
            </button>
          </div>
        )}
      </div>

      {/* Scrollable Task Section */}
      <div className="flex-1 overflow-y-auto no-scrollbar mt-4 space-y-6">
        {session.topics?.[0]?.tasks?.map((dayPlan, i) => {
          const dayKey = `${session.sessionId}-${i}`;
          const isResources = viewMode[dayKey] === "resources";

          return (
            <div
              key={i}
              className="px-4"
            >
              {/* DAY/WEEK TITLE */}
              <h3 className="text-lg font-semibold text-indigo-300 mb-4">
                {dayPlan.title}
              </h3>

              {/* Toggle Tabs */}
              <div className="flex space-x-4 mb-4">
                <button
                  className={`px-4 py-1 rounded-lg font-medium ${!isResources
                    ? "bg-indigo-500 text-white"
                    : "bg-gray-700 text-gray-300"
                    }`}
                  onClick={() =>
                    setViewMode((prev) => ({ ...prev, [dayKey]: "tasks" }))
                  }
                >
                  Tasks
                </button>
                <button
                  className={`px-4 py-1 rounded-lg font-medium ${isResources
                    ? "bg-indigo-500 text-white"
                    : "bg-gray-700 text-gray-300"
                    }`}
                  onClick={() =>
                    setViewMode((prev) => ({ ...prev, [dayKey]: "resources" }))
                  }
                >
                  Resources
                </button>
              </div>

              {/* Tasks */}
              {!isResources && (
                <ul className="space-y-4">
                  {dayPlan.tasks.map((task) => (
                    <li
                      key={task.taskId}
                      className="flex items-start space-x-3 border border-gray-600 p-4 rounded-lg bg-[#2a2a2a]"
                    >
                      <input
                        type="checkbox"
                        className="mt-1 accent-indigo-500 h-5 w-5"
                      />
                      <div className="flex-1">
                        <p className="text-white font-medium">
                          {task.description}
                        </p>
                        <p className="text-xs my-2 text-gray-300 flex items-center">
                          <FiClock className="mr-1" /> {task.duration}
                        </p>
                      </div>
                      {getIcon(task.type)}
                    </li>
                  ))}
                </ul>
              )}

              {/* Resources */}
              {isResources && (
                <div className="space-y-2">
                  {session.topics?.[0]?.resources?.map((res) => (
                    <a
                      key={res._id}
                      href={res.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-start space-x-3 bg-[#2a2a2a] p-4 rounded-lg shadow-md hover:bg-[#3a3a3a] transition border border-gray-600"
                    >
                      <div>{getIcon(res.type)}</div>
                      <div>
                        <p className="font-semibold text-blue-500">{res.title}</p>
                        <p className="text-sm text-gray-300">
                          {res.description}
                        </p>
                        <p className="text-xs text-gray-400">
                          {res.platform} • {res.duration}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  /** ---------------- Main Render ---------------- **/
  const renderContent = () => {
    if (loading) return <SkeletonLoader />;
    if (error)
      return (
        <div className="p-6 text-red-400 bg-[#313131]">Failed to load data</div>
      );

    return (
      <div className="p-6 text-white h-[calc(100vh-3.5rem)] flex flex-col">
        {/* Title */}
        <h1 className="text-3xl font-bold mb-4 text-white shrink-0">My Space</h1>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-12 gap-6 flex-1 min-h-0">
          {/* Left Side → scrollable */}
          <div className="lg:col-span-7 overflow-y-auto no-scrollbar">
            {activeSession
              ? renderSessionDetails(activeSession)
              : renderSessionList()}
          </div>

          {/* Right Side → details card full height */}
          <div className="lg:col-span-5 relative">
            {/* Card Content */}
            <div className="w-full h-full bg-[#1f1f1f] text-center rounded-3xl shadow-lg p-6 overflow-y-auto no-scrollbar flex flex-col relative z-0">
              <span className="text-4xl font-semibold text-gray-200">
                OneClarity
              </span>
              <div className="flex-grow" />
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Ask anything..."
                  className="w-full p-4 pr-12 bg-transparent border border-gray-600 rounded-2xl text-gray-200 placeholder-gray-400 focus:outline-none"
                  disabled
                />
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-not-allowed"
                  disabled
                >
                  <BsArrowRightCircleFill className="w-8 h-8" />
                </button>
              </div>
            </div>

            {/* Blur Overlay */}
            <div className="absolute inset-0 rounded-3xl m-1 backdrop-blur-[3px] bg-black/50 flex items-center justify-center z-10">
              <span className="text-white text-lg font-semibold tracking-wide">
                This feature is coming soon...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return <AppBody content={renderContent()} />;
};

export default Dashboard;