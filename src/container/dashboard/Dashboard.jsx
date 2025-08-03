import React, { useEffect, useState } from "react";
import AppBody from "../../components/AppBody";
import useApiCallHooks from "../../hooks/useApiCallHooks";
import { DashboardApiRoutes } from "./routes/ApiRoutes";
import SkeletonLoader from "./skeleton/SkeletonLoader";
import { getDecryptedAuthData } from "../auth/utils/authUtils";
import { API_URL } from "../../url/config";
import TaskAndResources from "./pages/TaskAndResources";
import OneClarityCard from "./pages/OneClarityCard";

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

    callAPI(
      "post",
      `/api/plans/${planId}/calendar`,
      {
        accessToken: auth.googleAccessToken,
        startDate,
      },
      {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
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

  // Transform the response data to match the expected structure
  const transformedData = response?.data?.task_resources
    ? {
        sessions: response.data.task_resources.map((item) => ({
          sessionId: item.sessionId,
          topics: [
            {
              planId: item.planId,
              planType: item.planType,
              title: item.title,
              createdAt: item.createdAt,
              tasks: item.tasks,
              resources: item.resources,
            },
          ],
        })),
      }
    : { sessions: [] };

  const renderContent = () => {
    if (loading) return <SkeletonLoader />;
    if (error)
      return (
        <div className="p-6 text-red-400 bg-[#313131]">Failed to load data</div>
      );

    return (
      <div className="p-6 text-white h-[calc(100vh-3.5rem)] flex flex-col">
        <h1 className="text-3xl font-bold mb-4 text-white shrink-0">My Space</h1>
        <div className="grid lg:grid-cols-12 gap-6 flex-1 min-h-0">
          <TaskAndResources
            session={{ data: transformedData, activeSession }}
            setActiveSession={setActiveSession}
            viewMode={viewMode}
            setViewMode={setViewMode}
            calendarData={calendarData}
            handleDateChange={handleDateChange}
            handleAddToCalendar={handleAddToCalendar}
          />
          <OneClarityCard />
        </div>
      </div>
    );
  };

  return <AppBody content={renderContent()} />;
};

export default Dashboard;