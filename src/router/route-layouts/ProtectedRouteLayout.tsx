import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/authHook";
import LoadingScreen from "../../components/ui/LoadingScreen";

export default function ProtectedRouteLayout() {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingScreen />
    }

    if (!user) {
        return <Navigate to={"/auth/login"} />
    }

    return <Outlet />
}