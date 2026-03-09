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
    sender_id?: string;
    status: string;
    content: string;
    created_at: string;
}

type SocketMessage = Message & {
    conversation?: Conversation;
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
    ensureConversation: (conversation: Conversation) => void,
    removeConversation: (conversation_id: string) => void,
    addMessageToChat: (message: Message) => void,
    markConversationAsRead: (conversation_id: string) => void,
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
    ensureConversation: () => { },
    removeConversation: () => { },
    addMessageToChat: () => { },
    markConversationAsRead: () => { },
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

    const [getConversations] = useLazyQuery(GET_CONVERSATIONS, {
        fetchPolicy: "network-only",
    });
    const [getMessages] = useLazyQuery(GET_MESSAGES, {
        fetchPolicy: "network-only",
    });


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

    const upsertConversationInList = useCallback((
        nextConversation: Conversation,
        latestMessage?: Pick<Message, "id" | "content" | "created_at">
    ) => {
        setConversations((prev) => {
            const existing = prev.find(
                (conversation) =>
                    conversation.conversation_id === nextConversation.conversation_id
            );

            const fallbackSenderId =
                (nextConversation as any).last_message_sender_id ??
                (existing as any)?.last_message_sender_id ??
                null;
            const fallbackStatus =
                (nextConversation as any).last_message_status ??
                (existing as any)?.last_message_status ??
                null;

            const mergedConversation = {
                ...(existing ?? {}),
                ...nextConversation,
                ...(latestMessage
                    ? {
                        last_message_id: latestMessage.id,
                        last_message_sender_id: (latestMessage as any).sender_id ?? fallbackSenderId,
                        last_message_status: (latestMessage as any).status ?? fallbackStatus,
                        last_message: latestMessage.content,
                        last_message_at: latestMessage.created_at,
                    }
                    : {}),
            } as Conversation;

            const remaining = prev.filter(
                (conversation) =>
                    conversation.conversation_id !== nextConversation.conversation_id
            );

            return [mergedConversation, ...remaining];
        });
    }, []);

    const hydrateConversationIfMissing = useCallback(async (
        conversation_id: string,
        latestMessage?: Pick<Message, "id" | "content" | "created_at">
    ) => {
        const exists = conversations.some(
            (conversation) => conversation.conversation_id === conversation_id
        );

        if (exists) {
            return;
        }

        try {
            const { data } = await getConversations();
            const myConversations = ((data as any)?.myConversations || []) as Conversation[];
            const matchedConversation = myConversations.find(
                (conversation) => conversation.conversation_id === conversation_id
            );

            if (matchedConversation) {
                upsertConversationInList(matchedConversation, latestMessage);
            }
        } catch (error) {
            console.log(error);
        }
    }, [conversations, getConversations, upsertConversationInList]);

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
        upsertConversationInList({
            conversation_id: payload.conversation_id,
        } as Conversation, {
            id: payload.id,
            sender_id: payload.sender_id,
            status: payload.status,
            content: payload.content,
            created_at: payload.created_at,
        } as any);

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
    }, [upsertConversationInList]);


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
        setConversations((prev) =>
            prev.map((conversation) =>
                conversation.conversation_id === payload.conversation_id
                    ? {
                        ...conversation,
                        last_message_status:
                            (conversation as any).last_message_sender_id === user?.id
                                ? "read"
                                : (conversation as any).last_message_status,
                    }
                    : conversation
            )
        );
    }, [user?.id]);



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

    const addMessageToChat = useCallback((message: SocketMessage) => {
        const existingConversation = conversations.find(
            (conversation) => conversation.conversation_id === message.conversation_id
        );

        if (message.conversation) {
            upsertConversationInList(message.conversation, {
                id: message.id,
                content: message.content,
                created_at: message.created_at,
            });
        } else if (existingConversation) {
            upsertConversationInList(existingConversation, {
                id: message.id,
                sender_id: message.sender === "me" ? user?.id ?? null : message.sender_id,
                status: message.status,
                content: message.content,
                created_at: message.created_at,
            } as any);
        } else {
            void hydrateConversationIfMissing(message.conversation_id, {
                id: message.id,
                sender_id: message.sender === "me" ? user?.id ?? null : message.sender_id,
                status: message.status,
                content: message.content,
                created_at: message.created_at,
            } as any);
        }

        setChats(prev => ({
            ...prev,
            [message.conversation_id]: mergeUniqueMessages(
                prev[message.conversation_id] || [],
                [message],
                "append",
            )
        }));
        if (message.sender !== "me" && !message.conversation) {
            setConversations((prev) =>
                prev.map((conversation) =>
                    conversation.conversation_id === message.conversation_id
                        ? {
                            ...conversation,
                            unread_count: Math.max(
                                Number((conversation as any).unread_count ?? 0) + 1,
                                1
                            ),
                        }
                        : conversation
                )
            );
        }
    }, [conversations, hydrateConversationIfMissing, upsertConversationInList]);

    const markConversationAsRead = useCallback((conversation_id: string) => {
        setConversations((prev) =>
            prev.map((conversation) =>
                conversation.conversation_id === conversation_id
                    ? { ...conversation, unread_count: 0 }
                    : conversation
            )
        );
    }, []);

    const ensureConversation = useCallback((conversation: Conversation) => {
        upsertConversationInList(conversation);
    }, [upsertConversationInList]);

    const removeConversation = useCallback((conversation_id: string) => {
        setConversations((prev) =>
            prev.filter((item) => item.conversation_id !== conversation_id)
        );

        setChats((prev) => {
            const next = { ...prev };
            delete next[conversation_id];
            return next;
        });

        setHasMoreByConversation((prev) => {
            const next = { ...prev };
            delete next[conversation_id];
            return next;
        });

        setLoadingOlderByConversation((prev) => {
            const next = { ...prev };
            delete next[conversation_id];
            return next;
        });
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
            ensureConversation,
            removeConversation,
            addMessageToChat,
            markConversationAsRead
        }}>
            {children}
        </conversationContext.Provider>
    )
}
