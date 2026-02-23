import { useContext } from "react"
import { conversationContext } from "../context/conversationContext"


export const useConversation = () => {
    const { conversations, chats, getChatFromId, addMessageToChat } = useContext(conversationContext);

    return {
        conversations,
        chats,
        getChatFromId,
        addMessageToChat
    }
}