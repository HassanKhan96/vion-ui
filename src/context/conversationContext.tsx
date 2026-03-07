import type { Conversation, Message } from "../graphql-types/graphql";
import { createContext, useCallback, useEffect, useState } from "react";
import { useLazyQuery } from "@apollo/client/react";
import { GET_CONVERSATIONS, GET_MESSAGES } from "../graphql/conversation.queries";
import { useAuth } from "../hooks/authHook";
import useSocket from "../hooks/socketHook";

const PAGE_SIZE = 15;

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
    hasMoreByConversation: Record<string, boolean>,
    loadingOlderByConversation: Record<string, boolean>,
    setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>,
    setChats: React.Dispatch<React.SetStateAction<Record<string, Message[]>>>,
    getChatFromId: (conversation_id: string) => Promise<Message[] | undefined>,
    loadOlderMessages: (conversation_id: string) => Promise<void>,
    addMessageToChat: (message: Message) => void,
}

export const conversationContext = createContext<ConversationContextType>({
    conversations: [],
    chats: {},
    hasMoreByConversation: {},
    loadingOlderByConversation: {},
    setConversations: () => { },
    setChats: () => { },
    getChatFromId: () => Promise.resolve([]),
    loadOlderMessages: () => Promise.resolve(),
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
    const [hasMoreByConversation, setHasMoreByConversation] = useState<Record<string, boolean>>({});
    const [loadingOlderByConversation, setLoadingOlderByConversation] = useState<Record<string, boolean>>({});

    const [getConversations] = useLazyQuery(GET_CONVERSATIONS);
    const [getMessages] = useLazyQuery(GET_MESSAGES);


    useEffect(() => {
        if (user)
            getMyConversations();
    }, [user]);

    const getMyConversations = async () => {
        try {
            const { data } = await getConversations()
            let myConversations = (data as any)?.myConversations || []
            setConversations(myConversations);
        } catch (error) {
            console.log(error)
        }
    }

    const mergeUniqueMessages = (
        existing: Message[],
        incoming: Message[],
        mode: "prepend" | "append"
    ) => {
        const seen = new Set<string>();
        const list = mode === "prepend"
            ? [...incoming, ...existing]
            : [...existing, ...incoming];

        return list.filter((message) => {
            if (seen.has(message.id)) return false;
            seen.add(message.id);
            return true;
        });
    };

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



    const getChatFromId = useCallback(async (conversation_id: string) => {
        try {
            if (chats[conversation_id]) return chats[conversation_id];

            let chatResponse = await getMessages({
                variables: {
                    conversation_id,
                    limit: PAGE_SIZE,
                }
            })
            let messages = (chatResponse.data as any)?.getAllConversation || []
            setChats(prev => ({
                ...prev,
                [conversation_id]: messages
            }));
            setHasMoreByConversation((prev) => ({
                ...prev,
                [conversation_id]: messages.length === PAGE_SIZE
            }));
            return messages;
        } catch (error) {
            console.log(error);
        }
    }, [chats, getMessages]);

    const loadOlderMessages = useCallback(async (conversation_id: string) => {
        if (loadingOlderByConversation[conversation_id]) return;
        if (hasMoreByConversation[conversation_id] === false) return;

        const currentMessages = chats[conversation_id] || [];
        if (!currentMessages.length) {
            await getChatFromId(conversation_id);
            return;
        }

        const oldestMessage = currentMessages[0];
        if (!oldestMessage?.created_at) {
            setHasMoreByConversation((prev) => ({
                ...prev,
                [conversation_id]: false
            }));
            return;
        }

        setLoadingOlderByConversation((prev) => ({
            ...prev,
            [conversation_id]: true
        }));

        try {
            const response = await getMessages({
                variables: {
                    conversation_id,
                    limit: PAGE_SIZE,
                    before: oldestMessage.created_at,
                }
            });

            const olderMessages = (response.data as any)?.getAllConversation || [];

            setHasMoreByConversation((prev) => ({
                ...prev,
                [conversation_id]: olderMessages.length === PAGE_SIZE
            }));

            if (!olderMessages.length) return;

            setChats((prev) => ({
                ...prev,
                [conversation_id]: mergeUniqueMessages(
                    prev[conversation_id] || [],
                    olderMessages,
                    "prepend",
                ),
            }));
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingOlderByConversation((prev) => ({
                ...prev,
                [conversation_id]: false
            }));
        }
    }, [chats, getChatFromId, getMessages, hasMoreByConversation, loadingOlderByConversation]);

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
            [message.conversation_id]: mergeUniqueMessages(
                prev[message.conversation_id] || [],
                [message],
                "append",
            )
        }));
    }, []);

    useEffect(() => {
        if (!socket) return;

        const onConnection = (data: unknown) => {
            console.log("Chat server replied", data);
        };

        socket.on("on-connection", onConnection);
        socket.on("new_message", addMessageToChat);
        socket.on("message_sent", updateMessageOnSent);
        socket.on("messages_read", markMessagesAsRead);

        return () => {
            socket.off("on-connection", onConnection);
            socket.off("new_message", addMessageToChat);
            socket.off("message_sent", updateMessageOnSent);
            socket.off("messages_read", markMessagesAsRead);
        };
    }, [socket, addMessageToChat, markMessagesAsRead, updateMessageOnSent]);

    return (
        <conversationContext.Provider value={{
            conversations,
            chats,
            hasMoreByConversation,
            loadingOlderByConversation,
            setConversations,
            setChats,
            getChatFromId,
            loadOlderMessages,
            addMessageToChat
        }}>
            {children}
        </conversationContext.Provider>
    )
}
