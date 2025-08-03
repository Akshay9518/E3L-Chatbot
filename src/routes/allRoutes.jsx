import Dashboard from "../container/dashboard/Dashboard";
import { DashboardUiRoutes } from "../container/dashboard/routes/UiRoutes";
import ChatPage from "../container/home/ChatPage";
import WelcomePage from "../container/home/WelcomePage";
import { HomePageUiRoutes } from "../container/home/routes/UiRoutes";
import Settings from "../container/settings/Settings";
import { SettingsUiRoutes } from "../container/settings/routes/UiRoutes";

export const UiRoutes = [
    {
        path: HomePageUiRoutes.url.home,
        element: <WelcomePage />
    },
     {
        path: HomePageUiRoutes.url.chat,
        element: <ChatPage />
    },
     {
        path: DashboardUiRoutes.url.dash,
        element: <Dashboard />
    },
     {
        path: SettingsUiRoutes.url.setting,
        element: <Settings />
    },
   
]
