import { ChatSidebar } from "../../components/chat/ChatSidebar";
import { ChatArea } from "../../components/chat/ChatArea";
import { useState } from "react";
import type { CurrentChatUser } from "../../interfaces/user.interface";

export const ChatPage = () => {
  const [currentConversation, setCurrenConversation] = useState<string | null>(
    null,
  );
  const [currentChatUser, setCurrentChatUser] =
    useState<CurrentChatUser | null>(null);

  const setCurrentUserStatus = (status: string, lastSeen?: number | null) => {
    if (!currentChatUser) return;
    setCurrentChatUser((prev) => {
      if (prev === null) return null;
      return { ...prev, status, lastSeen };
    });
  };

  const setCurrentUserTypingStatus = (isTyping: boolean) => {
    if (!currentChatUser) return;
    setCurrentChatUser((prev) => {
      if (prev === null) return null;
      return { ...prev, isTyping };
    });
  };

  const handleConversationDeleted = () => {
    setCurrenConversation(null);
    setCurrentChatUser(null);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <div className="hidden md:block w-80 flex-shrink-0">
        <ChatSidebar
          currentConversation={currentConversation}
          currentChatUser={currentChatUser}
          onSelectConversation={setCurrenConversation}
          onSetCurrentChatUser={setCurrentChatUser}
        />
      </div>
      <main className="flex-1 flex flex-col min-w-0">
        <ChatArea
          currentConversation={currentConversation}
          currentChatUser={currentChatUser}
          setCurrentUserStatus={setCurrentUserStatus}
          setCurrentUserTypingStatus={setCurrentUserTypingStatus}
          onConversationDeleted={handleConversationDeleted}
        />
      </main>
    </div>
  );
};
