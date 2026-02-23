import { io, Socket } from 'socket.io-client';
import { getConfig } from '../config/Application';
import { createContext } from 'react';

const { CHAT_URL } = getConfig();

type SocketContextType = {
    socket: Socket | null;
}

export const SocketContext = createContext<SocketContextType>({
    socket: null,
});


export default function SocketContextProvider({ children }: { children: React.ReactNode }) {

    const socket = io(`${CHAT_URL}`, {
        autoConnect: false,
        withCredentials: true,
    });


    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
}