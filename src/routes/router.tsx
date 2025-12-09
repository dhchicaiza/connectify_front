import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/home/Home";
import Landing from "../pages/landing/Landing";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import Profile from "../pages/profile/Profile";
import Meeting from "../pages/meeting/Meeting";
import ActiveMeeting from "../pages/meeting/ActiveMeeting";
import Manual from "../pages/manual/Manual";
import NotFound from "../pages/NotFound";

/**
 * Application route configuration array.
 * Defines all available routes and their corresponding React components.
 */
export const routes = [
    {
        path: "/",
        element: <Landing />,
    },
    {
        path: "/home",
        element: <Home />,
    },
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/register",
        element: <Register />,
    },
    {
        path: "/forgot-password",
        element: <ForgotPassword />,
    },
    {
        path: "/reset-password",
        element: <ResetPassword />,
    },
    {
        path: "/profile",
        element: <Profile />,
    },
    {
        path: "/meeting",
        element: <Meeting />,
    },
    {
        path: "/active-meeting",
        element: <ActiveMeeting />,
    },
    {
        path: "/meet/:id",
        element: <ActiveMeeting />,
    },
    {
        path: "/manual",
        element: <Manual />,
    },
    {
        path: "*",
        element: <NotFound />,
    },
]

/**
 * Browser router instance configured with the application routes.
 * Used by React Router to handle client-side navigation.
 */
export const router = createBrowserRouter(routes);
