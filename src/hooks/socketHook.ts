import { useContext } from "react";
import { SocketContext } from "../context/socketContext";



export default function useSocket() {
    const { socket } = useContext(SocketContext);

    return {
        socket
    }
}