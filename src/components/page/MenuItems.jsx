import {  FaPlusCircle, FaChartBar } from 'react-icons/fa';
import { DashboardUiRoutes } from '../../container/dashboard/routes/UiRoutes';
import { HomePageUiRoutes } from '../../container/home/routes/UiRoutes';

export const MenuItems = [
    {
        name: 'New Chat',
        path: HomePageUiRoutes.url.home,
        icon: <FaPlusCircle />,
    },
    {
        name: 'Dashboard',
        path: DashboardUiRoutes.url.dash,
        icon: <FaChartBar />,
    },
];
