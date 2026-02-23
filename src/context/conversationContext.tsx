import type { Conversation, Message } from "../graphql-types/graphql";
import { createContext, useCallback, useEffect, useState } from "react";
import { useLazyQuery } from "@apollo/client/react";
import { GET_CONVERSATIONS, GET_MESSAGES } from "../graphql/conversation.queries";
import { useAuth } from "../hooks/authHook";
import useSocket from "../hooks/socketHook";


type MessageSent = {
    temp_id: string;
    conversation_id: string;
    id: string;
    status: string;
    content: string;
    created_at: string;
}

export type ConversationContextType = {
    conversations: Conversation[],
    chats: Record<string, Message[]>,
    setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>,
    setChats: React.Dispatch<React.SetStateAction<Record<string, Message[]>>>,
    getChatFromId: (conversation_id: string) => Promise<Message[] | undefined>,
    addMessageToChat: (message: Message) => void,
}

export const conversationContext = createContext<ConversationContextType>({
    conversations: [],
    chats: {},
    setConversations: () => { },
    setChats: () => { },
    getChatFromId: () => Promise.resolve([]),
    addMessageToChat: () => { },
});


type ProviderProps = {
    children: React.ReactNode
}

export default function ConversationProvider({ children }: ProviderProps) {

    const { user } = useAuth();
    const { socket } = useSocket();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [chats, setChats] = useState<Record<string, Message[]>>({});

    const [getConversations] = useLazyQuery(GET_CONVERSATIONS);
    const [getMessages] = useLazyQuery(GET_MESSAGES);


    useEffect(() => {
        if (user)
            getMyConversations();
    }, [user]);

    useEffect(() => {
        if (!socket) return;

        socket?.on("on-connection", (data) => {
            console.log("Chat server replied", data);
        });


        socket?.on("new_message", addMessageToChat);

        socket?.on("message_sent", updateMessageOnSent);

        socket?.on("messages_read", markMessagesAsRead);

    }, [socket])


    const getMyConversations = async () => {
        try {
            const { data } = await getConversations()
            let myConversations = data?.myConversations || []
            setConversations(myConversations);
        } catch (error) {
            console.log(error)
        }
    }


    const updateMessageOnSent = useCallback((payload: MessageSent) => {

        setConversations((prev) => {
            return prev.map((c) =>
                c.conversation_id === payload.conversation_id ?
                    {
                        ...c,
                        last_message_id: payload.id,
                        last_message_at: payload.created_at,
                        last_message: payload.content
                    }
                    : c
            );
        });

        setChats((prev) => {
            const chat = prev[payload.conversation_id];
            if (!chat) return prev;

            const updatedChat = chat.map((m) =>
                m.id === payload.temp_id ? { ...m, id: payload.id, status: payload.status } : m
            );

            return {
                ...prev,
                [payload.conversation_id]: updatedChat,
            };
        });
    }, []);


    const markMessagesAsRead = useCallback((payload: { conversation_id: string }) => {
        setChats((prev) => {
            const chat = prev[payload.conversation_id];
            if (!chat) return prev;

            const updatedChat = chat.map((m) => {
                if (m.sender !== 'me') return m; // Only update my messages that were read by other
                return { ...m, status: 'read' };
            });

            return {
                ...prev,
                [payload.conversation_id]: updatedChat,
            };
        });
    }, []);



    const getChatFromId = async (conversation_id: string) => {
        try {
            if (chats[conversation_id]) return chats[conversation_id];

            let chatResponse = await getMessages({ variables: { conversation_id } })
            let messages = chatResponse.data?.getAllConversation || []
            setChats(prev => ({
                ...prev,
                [conversation_id]: messages
            }));
            return messages;
        } catch (error) {
            console.log(error);
        }
    };

    const addMessageToChat = useCallback((message: Message) => {
        setConversations(prev => prev.map(conversation => {
            if (conversation.conversation_id === message.conversation_id) {
                return {
                    ...conversation,
                    last_message: message.content,
                    last_message_at: message.created_at,
                    last_message_id: message.id
                }
            }
            return conversation
        }))
        setChats(prev => ({
            ...prev,
            [message.conversation_id]: [...(prev[message.conversation_id] || []), message]
        }));
    }, []);

    return (
        <conversationContext.Provider value={{
            conversations,
            chats,
            setConversations,
            setChats,
            getChatFromId,
            addMessageToChat
        }}>
            {children}
        </conversationContext.Provider>
    )
}