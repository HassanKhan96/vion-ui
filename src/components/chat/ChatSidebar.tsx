import {
  Search,
  Plus,
  MessageSquare,
  MoreVertical,
  LogOut,
  Camera,
  UserRoundPlus,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { formatDistanceToNow } from "date-fns";
import type { CurrentChatUser } from "../../interfaces/user.interface";
import { useConversation } from "../../hooks/conversationHook";
import { useAuth } from "../../hooks/authHook";
import { useApi } from "../../hooks/useApi";
import { useState, useRef, useEffect, type ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { UPLOAD_MY_AVATAR } from "../../graphql/user.queries";
import { getConfig } from "../../config/Application";
import NewChatModal from "./NewChatModal";
import FriendRequestsModal from "./FriendRequestsModal";
import { getConversationId } from "../../lib/conversation";
import type { User as VionUser } from "../../interfaces/user.interface";
import { GET_PENDING_FRIEND_REQUESTS } from "../../graphql/friends.queries";
import { parseAppDate } from "../../lib/date";
import { MessageStatus } from "./MessageStatus";

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
  const { conversations, ensureConversation } = useConversation();
  const { user, clearAuth, updateUser } = useAuth();
  const { logout } = useApi();
  const { BASE_URL } = getConfig();
  const [uploadAvatar, { loading: avatarUploading }] =
    useMutation(UPLOAD_MY_AVATAR);
  const [fetchPendingRequests] = useLazyQuery(GET_PENDING_FRIEND_REQUESTS, {
    fetchPolicy: "network-only",
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [isFriendRequestsModalOpen, setIsFriendRequestsModalOpen] =
    useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    const loadPendingRequests = async () => {
      try {
        const { data } = await fetchPendingRequests();
        const rows = ((data as any)?.myFriendRequests || []) as Array<{
          id: string;
        }>;
        setPendingRequestsCount(rows.length);
      } catch (_) {
        setPendingRequestsCount(0);
      }
    };

    void loadPendingRequests();
  }, [fetchPendingRequests]);

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
    const avatarSrc = avatar
      ? avatar.startsWith("http")
        ? avatar
        : `${BASE_URL}${avatar}`
      : null;

    onSelectConversation(conversation);
    onSetCurrentChatUser({
      id: user_id,
      username,
      avatar: avatarSrc,
      email: "",
      created_at: "",
      status: "",
    });
  };

  const handleStartChatWithUser = async (targetUser: VionUser) => {
    if (!user?.id) return;

    const existingConversation = conversations.find(
      (conversation) => conversation.other_user_id === targetUser.id,
    );

    const conversationId =
      existingConversation?.conversation_id ??
      (await getConversationId(user.id, targetUser.id));

    ensureConversation({
      conversation_id: conversationId,
      type: "direct",
      created_at: Date.now().toString(),
      last_read_message_id: null,
      last_message_id: null,
      last_message: null,
      last_message_at: null,
      other_user_id: targetUser.id,
      username: targetUser.username,
      avatar_url: targetUser.avatar_url ?? null,
    } as any);

    handleConversationSelect(
      conversationId,
      targetUser.id,
      targetUser.username,
      targetUser.avatar_url ?? null,
    );

    setIsNewChatModalOpen(false);
  };

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "?";

  const avatarSrc = user?.avatar_url
    ? user.avatar_url.startsWith("http")
      ? user.avatar_url
      : `${BASE_URL}${user.avatar_url}`
    : null;

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Could not read image file"));
      reader.readAsDataURL(file);
    });

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      event.target.value = "";
      return;
    }

    try {
      const base64 = await toBase64(file);
      const response = await uploadAvatar({
        variables: {
          input: {
            base64,
            filename: file.name,
            mimeType: file.type,
          },
        },
      });

      const nextUser = (response.data as any)?.uploadMyAvatar;
      if (nextUser) {
        updateUser(nextUser);
      }
    } catch (error) {
      console.log(error);
    } finally {
      event.target.value = "";
    }
  };

  const formatConversationTime = (value: string) => {
    const parsed = parseAppDate(value);
    if (!parsed) return "";
    return formatDistanceToNow(parsed);
  };

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
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="Profile avatar"
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-bold text-white">{initials}</span>
              )}
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
                    onClick={() => {
                      setMenuOpen(false);
                      fileInputRef.current?.click();
                    }}
                  >
                    <Camera className="h-4 w-4 text-muted-foreground" />
                    {avatarUploading ? "Uploading..." : "Upload Avatar"}
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
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Header (Messages & Search) */}
      <div className="p-4 border-b border-border space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Messages</h2>
          <div className="flex items-center gap-1">
            <div className="relative">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsFriendRequestsModalOpen(true)}
              >
                <UserRoundPlus className="h-5 w-5" />
              </Button>
              {pendingRequestsCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  {pendingRequestsCount > 9 ? "9+" : pendingRequestsCount}
                </span>
              )}
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsNewChatModalOpen(true)}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
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
                (conversation as any).avatar_url ?? null,
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
              {(conversation as any).avatar_url ? (
                <img
                  src={
                    String((conversation as any).avatar_url).startsWith("http")
                      ? String((conversation as any).avatar_url)
                      : `${BASE_URL}${String((conversation as any).avatar_url)}`
                  }
                  alt={`${conversation.username} avatar`}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="font-medium truncate">
                  {conversation.username}
                </span>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                  {formatConversationTime(
                    conversation.last_message_at ?? conversation.created_at,
                  )}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {conversation.last_message_sender_id === user?.id ? (
                  <span className="inline-flex items-center gap-1">
                    <MessageStatus
                      status={(conversation as any).last_message_status ?? "sent"}
                      className="h-3.5 w-3.5"
                    />
                    <span>{conversation.last_message}</span>
                  </span>
                ) : (
                  conversation.last_message
                )}
              </p>
            </div>
            {Number((conversation as any).unread_count ?? 0) > 0 && (
              <span className="ml-2 mt-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                {Number((conversation as any).unread_count) > 99
                  ? "99+"
                  : Number((conversation as any).unread_count)}
              </span>
            )}
          </button>
        ))}
      </div>

      <NewChatModal
        open={isNewChatModalOpen}
        currentUserId={user?.id}
        onClose={() => setIsNewChatModalOpen(false)}
        onStartChat={handleStartChatWithUser}
      />
      <FriendRequestsModal
        open={isFriendRequestsModalOpen}
        onClose={() => setIsFriendRequestsModalOpen(false)}
        onPendingCountChange={setPendingRequestsCount}
      />
    </div>
  );
};
