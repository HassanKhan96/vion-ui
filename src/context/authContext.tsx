import { createContext, useEffect, useState } from "react";
import type { User } from "../interfaces/user.interface";
import { useLazyQuery } from "@apollo/client/react";
import { GET_CURRENT_USER } from "../graphql/user.queries";
import { useApi } from "../hooks/useApi";
import { authTokenVar } from "../apollo/authVars";
import useSocket from "../hooks/socketHook";

type AuthContextType = {
    user: User | null;
    accessToken: string | null;
    loading: boolean;
    setUser: (user: User | null) => void;
    setAccessToken: (accessToken: string | null) => void;
};


export const AuthContext = createContext<AuthContextType>({
    user: null,
    accessToken: null,
    loading: false,
    setUser: () => null,
    setAccessToken: () => null,
});

export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const { socket } = useSocket();

    const [getUser, { loading: queryLoading }] = useLazyQuery(GET_CURRENT_USER);
    const { refreshToken, logout } = useApi();

    useEffect(() => {
        getUserAndTokenIfLoggedIn().finally(() => setCheckingAuth(false));
    }, [])

    const getUserAndTokenIfLoggedIn = async () => {
        try {
            let token = await refreshToken();
            setAccessToken(token);
            authTokenVar(token);

            if (socket) {
                socket.auth = { token }
                socket.connect();
                console.log('Requested connection')
            }

            let user = await getUser();
            let userData = user.data?.me
            if (!userData) throw new Error('No user found')
            setUser(userData);
        } catch (error) {
            logout().then(() => {
                setAccessToken(null);
                setUser(null);
                authTokenVar(null);
            })
        }
    }

    return (
        <AuthContext.Provider value={{ user, accessToken, loading: queryLoading || checkingAuth, setUser, setAccessToken }}>
            {children}
        </AuthContext.Provider>
    );
}