import { useContext } from "react"
import { AuthContext } from "../context/authContext"
import type { User } from "../interfaces/user.interface";
import { authTokenVar } from "../apollo/authVars";



export const useAuth = () => {
    const { user, accessToken, loading, setUser, setAccessToken } = useContext(AuthContext);

    const setAuth = (user: User, token: string) => {
        setUser(user);
        setAccessToken(token);
        authTokenVar(token);
    }

    const setToken = (token: string) => {
        setAccessToken(token);
        authTokenVar(token);
    }

    const clearAuth = () => {
        setUser(null);
        setAccessToken(null);
        authTokenVar(null);
    }

    const updateUser = (user: User | null) => {
        setUser(user);
    }

    const isAuthenticated = () => {
        return !!user && !!accessToken;
    }


    return {
        user,
        accessToken,
        loading,
        setAuth,
        setToken,
        updateUser,
        clearAuth,
        isAuthenticated,
    }
}
