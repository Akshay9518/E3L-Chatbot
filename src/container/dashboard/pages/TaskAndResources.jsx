import { useState } from "react";
import getIcon from "./Icons";
import { FiArrowLeft, FiCalendar, FiCheck, FiClock } from "react-icons/fi";
import { FaClock } from "react-icons/fa";

const TaskAndResources = ({ session, setActiveSession, viewMode, setViewMode, calendarData, handleDateChange, handleAddToCalendar }) => {
  const areAllTasksAddedToCalendar = (session) => {
    return session.topics.every((topic) =>
      topic.tasks.every((weekPlan) =>
        weekPlan.tasks.every((task) => task.isAddedToCalendar === true)
      )
    );
  };

  // Calculate total subtasks for a session
  const calculateTotalSubtasks = (session) => {
    return session.topics.reduce((total, topic) => {
      return (
        total +
        topic.tasks.reduce((sum, dayPlan) => sum + (dayPlan.tasks?.length || 0), 0)
      );
    }, 0);
  };

  const renderSessionDetails = (session) => {
    const allTasksAdded = areAllTasksAddedToCalendar(session);

    return (
      <div className="flex flex-col h-full">
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
                disabled={allTasksAdded}
              />
              <button
                onClick={() => !allTasksAdded && handleAddToCalendar(session.topics[0].planId)}
                className={`flex items-center text-sm px-4 py-2 rounded-lg transition ${
                  allTasksAdded
                    ? "bg-gray-700 text-white cursor-not-allowed"
                    : "bg-indigo-500 text-white hover:bg-indigo-600"
                }`}
                disabled={allTasksAdded}
              >
                {allTasksAdded ? (
                  <>
                    <FiCheck className="mr-1" /> Added to Calendar
                  </>
                ) : (
                  <>
                    <FiCalendar className="mr-1" /> Add to Calendar
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar mt-4 space-y-6">
          {session.topics?.[0]?.tasks?.map((dayPlan, i) => {
            const dayKey = `${session.sessionId}-${i}`;
            const isResources = viewMode[dayKey] === "resources";

            return (
              <div key={i} className="px-4">
                <h3 className="text-lg font-semibold text-indigo-300 mb-4">
                  {dayPlan.title} ({dayPlan.tasks?.length || 0} Subtasks)
                </h3>
                <div className="flex space-x-4 mb-4">
                  <button
                    className={`px-4 py-1 rounded-lg font-medium ${
                      !isResources ? "bg-indigo-500 text-white" : "bg-gray-700 text-gray-300"
                    }`}
                    onClick={() => setViewMode((prev) => ({ ...prev, [dayKey]: "tasks" }))}
                  >
                    Tasks
                  </button>
                  <button
                    className={`px-4 py-1 rounded-lg font-medium ${
                      isResources ? "bg-indigo-500 text-white" : "bg-gray-700 text-gray-300"
                    }`}
                    onClick={() => setViewMode((prev) => ({ ...prev, [dayKey]: "resources" }))}
                  >
                    Resources
                  </button>
                </div>
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
                          <p className="text-white font-medium">{task.description}</p>
                          <p className="text-xs my-2 text-gray-300 flex items-center">
                            <FiClock className="mr-1" /> {task.duration}
                          </p>
                        </div>
                        {getIcon(task.type)}
                      </li>
                    ))}
                  </ul>
                )}
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
                          <p className="text-sm text-gray-300">{res.description}</p>
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
  };

  const renderSessionList = () => (
    <div className="space-y-5">
      {session?.data?.sessions?.length > 0 ? (
        session.data.sessions
          .flatMap((session) =>
            session.topics.map((topic) => ({ ...topic, session }))
          )
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map((topic) => {
            const session = topic.session;
            const totalTasks = topic.tasks?.length || 0;
            const totalSubtasks = calculateTotalSubtasks({ topics: [topic] });
            const totalResources = topic.resources?.length || 0;
            const dummyProgress = Math.round(Math.random() * 100);

            return (
              <div
                key={topic.planId}
                className="bg-[#212121] border border-gray-700 shadow-lg rounded-xl overflow-hidden p-5 transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white mt-1">
                      {topic.title}
                    </h2>
                    <p className="text-gray-400 text-sm flex items-center gap-1 text-gray-200">
                      <span className="font-medium text-gray-200">
                        <FaClock />
                      </span>{" "}
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
                      onClick={() => setActiveSession({ ...session, topics: [topic] })}
                      className="px-6 py-2 text-sm font-bold rounded-xl bg-white cursor-pointer text-black border border-gray-600 transition"
                    >
                      View
                    </button>
                  </div>
                </div>
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
                <div className="flex justify-between text-center mt-3">
                  <div className="">
                    <p className="text-gray-400 text-sm">
                      <span className="font-medium text-gray-400">
                        {topic.planType
                          ? topic.planType.charAt(0).toUpperCase() + topic.planType.slice(1)
                          : ""}
                      </span>
                      :{" "}
                      <span className="text-white">{totalTasks}</span>
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex gap-2">
                      <p className="text-gray-400 text-sm">Tasks</p>
                      <p className="text-white font-semibold">{totalSubtasks}</p>
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
        <p className="text-gray-400">No Task & Resources available</p>
      )}
    </div>
  );

  return (
    <div className="lg:col-span-7 overflow-y-auto no-scrollbar">
      {session && (session.activeSession ? renderSessionDetails(session.activeSession) : renderSessionList())}
    </div>
  );
};

export default TaskAndResources;