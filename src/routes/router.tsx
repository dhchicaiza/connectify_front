import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/home/Home";
import Landing from "../pages/landing/Landing";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import Profile from "../pages/profile/Profile";
import Meeting from "../pages/meeting/Meeting";
import UserHome from "../pages/UserHome";

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
        path: "/userhome",
        element: <UserHome/>
    },
]

export const router = createBrowserRouter(routes);
