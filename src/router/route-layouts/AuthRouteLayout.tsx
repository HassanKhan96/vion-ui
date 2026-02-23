import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/authHook";



export default function AuthRouteLayout() {
    const { user } = useAuth();

    if (user) {
        return <Navigate to="/" />
    }

    return <Outlet />
}