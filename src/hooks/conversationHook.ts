import { useContext } from "react"
import { conversationContext } from "../context/conversationContext"


export const useConversation = () => {
    const {
        conversations,
        chats,
        hasMoreByConversation,
        loadingOlderByConversation,
        getChatFromId,
        loadOlderMessages,
        ensureConversation,
        removeConversation,
        addMessageToChat
    } = useContext(conversationContext);

    return {
        conversations,
        chats,
        hasMoreByConversation,
        loadingOlderByConversation,
        getChatFromId,
        loadOlderMessages,
        ensureConversation,
        removeConversation,
        addMessageToChat
    }
}
