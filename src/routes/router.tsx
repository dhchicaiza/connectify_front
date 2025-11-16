import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/home/Home";
import Landing from "../pages/landing/Landing";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import Profile from "../pages/profile/Profile";

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
        path: "/profile",
        element: <Profile />,
    },
]

export const router = createBrowserRouter(routes);
