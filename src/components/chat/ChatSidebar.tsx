import {
  Search,
  Plus,
  MessageSquare,
  MoreVertical,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { formatDistanceToNow } from "date-fns";
import type { CurrentChatUser } from "../../interfaces/user.interface";
import { useConversation } from "../../hooks/conversationHook";
import { useAuth } from "../../hooks/authHook";
import { useApi } from "../../hooks/useApi";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  className?: string;
  currentConversation: string | null;
  currentChatUser: CurrentChatUser | null;
  onSelectConversation: (conversation: string) => void;
  onSetCurrentChatUser: (user: CurrentChatUser) => void;
};

export const ChatSidebar = ({
  className,
  currentConversation,
  onSetCurrentChatUser,
  onSelectConversation,
}: Props) => {
  const { conversations } = useConversation();
  const { user, clearAuth } = useAuth();
  const { logout } = useApi();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (_) {
      // ignore API errors on logout
    } finally {
      clearAuth();
    }
  };

  const handleConversationSelect = (
    conversation: string,
    user_id: string,
    username: string,
    avatar?: string | null,
  ) => {
    onSelectConversation(conversation);
    onSetCurrentChatUser({
      id: user_id,
      username,
      avatar,
      email: "",
      created_at: "",
      status: "",
    });
  };

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "?";

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-muted/20 border-r border-border",
        className,
      )}
    >
      {/* User Profile Section (Top) */}
      <div className="p-4 border-b border-border bg-background/50">
        <div className="flex items-center justify-between gap-2">
          {/* Avatar + Name */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-sm shadow-primary/30">
              <span className="text-sm font-bold text-white">{initials}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate text-foreground">
                {user?.username ?? "You"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email ?? ""}
              </p>
            </div>
          </div>

          {/* Menu button + dropdown */}
          <div className="relative flex-shrink-0" ref={menuRef}>
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <MoreVertical className="h-5 w-5" />
            </Button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 mt-2 w-44 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50"
                >
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/60 transition-colors text-foreground"
                    onClick={() => setMenuOpen(false)}
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    Profile
                  </button>
                  <div className="h-px bg-border mx-3" />
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-destructive/10 transition-colors text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Header (Messages & Search) */}
      <div className="p-4 border-b border-border space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Messages</h2>
          <Button size="icon" variant="ghost">
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            className="pl-9 bg-background"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {conversations.map((conversation) => (
          <button
            key={conversation.conversation_id}
            onClick={() =>
              handleConversationSelect(
                conversation.conversation_id,
                conversation.other_user_id,
                conversation.username,
                null,
              )
            }
            className={cn(
              "w-full flex items-start space-x-3 p-3 rounded-lg transition-colors text-left",
              currentConversation === conversation.conversation_id
                ? "bg-primary/10 text-accent-foreground"
                : "hover:bg-muted/50",
            )}
          >
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="font-medium truncate">
                  {conversation.username}
                </span>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                  {formatDistanceToNow(Number(conversation.created_at))}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {conversation.last_message}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
