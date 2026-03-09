import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useEffectEvent,
} from "react";
import {
  Send,
  Phone,
  Video,
  MoreVertical,
  Trash2,
  Paperclip,
  Smile,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import type { Message } from "../../graphql-types/graphql";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import type { CurrentChatUser } from "../../interfaces/user.interface";
import useSocket from "../../hooks/socketHook";
import { useConversation } from "../../hooks/conversationHook";
import { MessageStatus } from "./MessageStatus";
import UserPresence from "./UserPresence";
import { StartNewChat } from "./StartNewChat";
import { useMutation } from "@apollo/client/react";
import { DELETE_MY_CONVERSATION } from "../../graphql/conversation.queries";
import { getAppTimestamp, parseAppDate } from "../../lib/date";

type Props = {
  className?: string;
  currentConversation: string | null;
  currentChatUser?: CurrentChatUser | null;
  setCurrentUserStatus: (status: string, lastSeen?: number | null) => void;
  setCurrentUserTypingStatus: (isTyping: boolean) => void;
  onConversationDeleted: () => void;
};

type ConversationMessage = Message & {
  to: string;
  sender: "me" | "them";
};

export const ChatArea = ({
  className,
  currentConversation,
  currentChatUser,
  setCurrentUserStatus,
  setCurrentUserTypingStatus,
  onConversationDeleted,
}: Props) => {
  const { socket } = useSocket();
  const {
    getChatFromId,
    loadOlderMessages,
    hasMoreByConversation,
    loadingOlderByConversation,
    chats,
    removeConversation,
    addMessageToChat,
    markConversationAsRead,
  } = useConversation();
  const [deleteMyConversation] = useMutation(DELETE_MY_CONVERSATION);
  const hasSetTyping = useRef(false);
  const shouldAutoScrollToBottom = useRef(true);
  const isLoadingOlderRef = useRef(false);
  const previousScrollHeightRef = useRef(0);
  const previousScrollTopRef = useRef(0);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  let messages = chats[currentConversation || ""] || [];

  const [inputValue, setInputValue] = useState("");
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [deletingConversation, setDeletingConversation] = useState(false);
  const lastReadMessageId = useRef<string | null>(null);
  const hasMore = currentConversation
    ? (hasMoreByConversation[currentConversation] ?? true)
    : false;
  const isLoadingOlder = currentConversation
    ? (loadingOlderByConversation[currentConversation] ?? false)
    : false;

  const markReadEvent = useEffectEvent(
    (currentConversation: string | null, allMessages: Message[]) => {
      const senderId = currentChatUser?.id;
      if (!currentConversation || !senderId) return;

      const sortedMessages = allMessages
        ?.filter((m) => m.sender !== "me" && m.status !== "read")
        ?.sort((a, b) => getAppTimestamp(b.created_at) - getAppTimestamp(a.created_at));
      const unreadMessages = sortedMessages?.at(0);
      if (!unreadMessages) return;

      if (lastReadMessageId.current == unreadMessages.id) return;

      if (unreadMessages) {
        socket?.emit("mark_messages_read", {
          conversation_id: currentConversation,
          sender_id: senderId,
        });
        markConversationAsRead(currentConversation);

        lastReadMessageId.current = unreadMessages.id;
      }
    },
  );

  useEffect(() => {
    if (!socket || !currentChatUser?.id) return;

    socket.emit("get_user_presence", currentChatUser.id);

    const onUserStatus = (payload: {
      user_id: string;
      status: string;
      lastSeen?: Number | null;
    }) => {
      if (payload.user_id === currentChatUser?.id) {
        let lastSeenDate = payload.lastSeen ? Number(payload.lastSeen) : null;
        setCurrentUserStatus(payload.status, lastSeenDate);
      }
    };

    const onTyping = (payload: { conversation_id: string }) => {
      if (payload.conversation_id === currentConversation) {
        setCurrentUserTypingStatus(true);
      }
    };

    const onStopTyping = (payload: { conversation_id: string }) => {
      if (payload.conversation_id === currentConversation) {
        setCurrentUserTypingStatus(false);
      }
    };

    socket?.on("user_presence", onUserStatus);
    socket?.on("started_typing", onTyping);
    socket?.on("stopped_typing", onStopTyping);

    return () => {
      socket?.off("user_presence", onUserStatus);
      socket?.off("started_typing", onTyping);
      socket?.off("stopped_typing", onStopTyping);
    };
  }, [socket, currentChatUser?.id]);

  useEffect(() => {
    if (!isActionsMenuOpen) return;

    const onClickOutside = (event: MouseEvent) => {
      if (
        actionsMenuRef.current &&
        !actionsMenuRef.current.contains(event.target as Node)
      ) {
        setIsActionsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [isActionsMenuOpen]);

  useEffect(() => {
    if (currentConversation) {
      shouldAutoScrollToBottom.current = true;
      lastReadMessageId.current = null;
      void getChatFromId(currentConversation);
    }
  }, [currentConversation]);

  useLayoutEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    if (isLoadingOlderRef.current) {
      const nextScrollTop =
        container.scrollHeight -
        previousScrollHeightRef.current +
        previousScrollTopRef.current;
      container.scrollTop = Math.max(nextScrollTop, 0);
      isLoadingOlderRef.current = false;
      return;
    }

    if (shouldAutoScrollToBottom.current) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, currentConversation, currentChatUser?.isTyping]);

  useEffect(() => {
    markReadEvent(currentConversation, messages);
  }, [currentConversation, messages]);

  useEffect(() => {
    if (!socket || !currentConversation || !currentChatUser?.id) {
      hasSetTyping.current = false;
      return;
    }

    if (inputValue?.length && !hasSetTyping.current) {
      hasSetTyping.current = true;
      socket.emit("typing", {
        conversation_id: currentConversation,
        sender_id: currentChatUser.id,
      });
    }

    if (!inputValue?.length && hasSetTyping.current) {
      hasSetTyping.current = false;
      socket.emit("stop_typing", {
        conversation_id: currentConversation,
        sender_id: currentChatUser.id,
      });
    }
  }, [inputValue, socket, currentConversation, currentChatUser?.id]);

  const handleMessagesScroll = async () => {
    const container = messagesContainerRef.current;
    if (!container || !currentConversation) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    shouldAutoScrollToBottom.current = distanceFromBottom < 120;

    if (
      container.scrollTop <= 40 &&
      hasMore &&
      !isLoadingOlder &&
      !isLoadingOlderRef.current
    ) {
      isLoadingOlderRef.current = true;
      previousScrollHeightRef.current = container.scrollHeight;
      previousScrollTopRef.current = container.scrollTop;
      await loadOlderMessages(currentConversation);

      const nextContainer = messagesContainerRef.current;
      if (
        nextContainer &&
        nextContainer.scrollHeight === previousScrollHeightRef.current
      ) {
        isLoadingOlderRef.current = false;
      }
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !inputValue.trim() ||
      !currentConversation ||
      !currentChatUser?.id ||
      !socket
    ) {
      return;
    }

    let newMessage = {
      id: uuidv4(),
      conversation_id: currentConversation,
      sender: "me",
      to: currentChatUser.id,
      content: inputValue,
      created_at: Date.now().toString(),
      status: "pending",
    } as ConversationMessage;

    shouldAutoScrollToBottom.current = true;
    addMessageToChat(newMessage);

    socket.emit("send_message", {
      ...newMessage,
      created_at: Number(newMessage.created_at),
    });

    setInputValue("");
  };

  const handleDeleteConversation = async () => {
    if (!currentConversation || deletingConversation) return;

    try {
      setDeletingConversation(true);
      await deleteMyConversation({
        variables: { conversation_id: currentConversation },
      });
      removeConversation(currentConversation);
      setIsActionsMenuOpen(false);
      onConversationDeleted();
    } catch (error) {
      console.log(error);
    } finally {
      setDeletingConversation(false);
    }
  };

  if (!currentConversation) {
    return <StartNewChat />;
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center space-x-4">
          {currentChatUser?.avatar ? (
            <img
              src={currentChatUser.avatar}
              alt={`${currentChatUser.username} avatar`}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="font-semibold text-primary">
                {currentChatUser?.username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h3 className="font-semibold">{currentChatUser?.username}</h3>
            <UserPresence
              status={currentChatUser?.status}
              lastSeen={currentChatUser?.lastSeen}
            />
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon">
            <Phone className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-5 w-5 text-muted-foreground" />
          </Button>
          <div className="relative" ref={actionsMenuRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsActionsMenuOpen((prev) => !prev)}
            >
              <MoreVertical className="h-5 w-5 text-muted-foreground" />
            </Button>
            {isActionsMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-20">
                <button
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-destructive/10 transition-colors text-destructive"
                  onClick={() => void handleDeleteConversation()}
                  disabled={deletingConversation}
                >
                  <Trash2 className="h-4 w-4" />
                  {deletingConversation ? "Deleting..." : "Delete chat"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleMessagesScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {isLoadingOlder && (
          <div className="text-center text-xs text-muted-foreground py-1">
            Loading older messages...
          </div>
        )}
        {messages.map((message) => {
          return (
            <div
              key={message.id}
              className={cn(
                "flex flex-col max-w-[75%]",
                message.sender === "me" ? "ml-auto items-end" : "items-start",
              )}
            >
              <div
                className={cn(
                  "rounded-2xl px-4 py-2 text-sm",
                  message.sender === "me"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-muted text-foreground rounded-bl-none",
                )}
              >
                {message.content}
              </div>
              <div className="flex items-center justify-end gap-1 mt-1 px-1">
                <span className="text-[10px] text-muted-foreground">
                  {parseAppDate(message.created_at)
                    ? format(parseAppDate(message.created_at) as Date, "hh:mm a")
                    : "--:--"}
                </span>
                {message.sender === "me" && (
                  <MessageStatus status={message.status} />
                )}
              </div>
            </div>
          );
        })}
        {currentChatUser?.isTyping && (
          <div className="flex flex-col max-w-[75%] items-start">
            <div className="rounded-2xl px-4 py-3 text-sm bg-muted text-foreground rounded-bl-none flex items-center gap-1 w-fit mt-1 mb-2">
              <span
                className="w-2 h-2 bg-muted-foreground/70 rounded-full animate-bounce"
                style={{ animationDelay: "0ms", animationDuration: "1s" }}
              />
              <span
                className="w-2 h-2 bg-muted-foreground/70 rounded-full animate-bounce"
                style={{ animationDelay: "150ms", animationDuration: "1s" }}
              />
              <span
                className="w-2 h-2 bg-muted-foreground/70 rounded-full animate-bounce"
                style={{ animationDelay: "300ms", animationDuration: "1s" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-background">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center space-x-2"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full text-muted-foreground hover:bg-transparent"
            >
              <Smile className="h-5 w-5" />
            </Button>
          </div>
          <Button
            type="submit"
            size="icon"
            className="shrink-0"
            disabled={!inputValue.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};
