import { useEffect, useMemo, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { Search, UserPlus, MessageCirclePlus, X } from "lucide-react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import {
  FIND_USER_BY_EMAIL,
  GET_FRIENDS,
  SEND_FRIEND_REQUEST,
} from "../../graphql/friends.queries";
import { getConfig } from "../../config/Application";

type UserItem = {
  id: string;
  username: string;
  email: string;
  avatar_url?: string | null;
  created_at: string;
};

type Props = {
  open: boolean;
  currentUserId?: string;
  onClose: () => void;
  onStartChat: (user: UserItem) => Promise<void> | void;
};

export default function NewChatModal({
  open,
  currentUserId,
  onClose,
  onStartChat,
}: Props) {
  const { BASE_URL } = getConfig();
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResult, setSearchResult] = useState<UserItem | null>(null);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);
  const [friends, setFriends] = useState<UserItem[]>([]);
  const [requestSentTo, setRequestSentTo] = useState<string | null>(null);

  const [findUser, { loading: searching }] = useLazyQuery(FIND_USER_BY_EMAIL);
  const [fetchFriends, { loading: loadingFriends }] = useLazyQuery(GET_FRIENDS);
  const [sendFriendRequest, { loading: sendingRequest }] =
    useMutation(SEND_FRIEND_REQUEST);

  const friendIds = useMemo(() => new Set(friends.map((f) => f.id)), [friends]);

  useEffect(() => {
    if (!open) return;

    const loadFriends = async () => {
      try {
        const { data } = await fetchFriends();
        const rows = ((data as any)?.myfriends || []) as UserItem[];
        setFriends(rows);
      } catch (error) {
        setSearchMessage("Could not load friends");
      }
    };

    loadFriends();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [open, onClose]);

  if (!open) return null;

  const getAvatarSrc = (avatarUrl?: string | null) => {
    if (!avatarUrl) return null;
    if (avatarUrl.startsWith("http")) return avatarUrl;
    return `${BASE_URL}${avatarUrl}`;
  };

  const handleFindUser = async () => {
    const email = searchEmail.trim().toLowerCase();
    if (!email) return;

    setSearchMessage(null);
    setSearchResult(null);
    setRequestSentTo(null);

    try {
      const { data } = await findUser({
        variables: { email },
      });
      const found = ((data as any)?.userByEmail || null) as UserItem | null;

      if (!found) {
        setSearchMessage("No user found for this email");
        return;
      }

      setSearchResult(found);
    } catch (error: any) {
      const message =
        error?.graphQLErrors?.[0]?.message || "Could not search user";
      setSearchMessage(message);
    }
  };

  const handleSendFriendRequest = async (toUserId: string) => {
    try {
      setSearchMessage(null);
      await sendFriendRequest({ variables: { toUserId } });
      setRequestSentTo(toUserId);
      setSearchMessage("Friend request sent");
    } catch (error: any) {
      const message =
        error?.graphQLErrors?.[0]?.message || "Could not send friend request";
      setSearchMessage(message);
    }
  };

  const renderUserAvatar = (user: UserItem) => {
    const avatarSrc = getAvatarSrc(user.avatar_url);
    if (avatarSrc) {
      return (
        <img
          src={avatarSrc}
          alt={`${user.username} avatar`}
          className="h-11 w-11 rounded-full object-cover"
        />
      );
    }

    return (
      <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center">
        <span className="text-sm font-semibold text-primary">
          {user.username.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  };

  const isSelf = searchResult?.id === currentUserId;
  const isFriend = !!searchResult && friendIds.has(searchResult.id);
  const requestAlreadySent = requestSentTo === searchResult?.id;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/45 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
          <div>
            <h3 className="text-lg font-semibold">Start New Chat</h3>
            <p className="text-sm text-muted-foreground">
              Find users by email or pick from your friends.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium">Search by email</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchEmail}
                  onChange={(event) => setSearchEmail(event.target.value)}
                  placeholder="name@example.com"
                  className="pl-9"
                />
              </div>
              <Button
                onClick={handleFindUser}
                disabled={!searchEmail.trim() || searching}
              >
                {searching ? "Finding..." : "Find"}
              </Button>
            </div>

            {searchMessage && (
              <p className="text-xs text-muted-foreground">{searchMessage}</p>
            )}

            {searchResult && (
              <div className="rounded-xl border border-border bg-background/40 p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {renderUserAvatar(searchResult)}
                  <div className="min-w-0">
                    <p className="font-medium truncate">{searchResult.username}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {searchResult.email}
                    </p>
                  </div>
                </div>

                {isSelf ? (
                  <span className="text-xs text-muted-foreground">This is you</span>
                ) : isFriend ? (
                  <Button
                    variant="secondary"
                    onClick={() => void onStartChat(searchResult)}
                  >
                    <MessageCirclePlus className="h-4 w-4 mr-2" />
                    Start Chat
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    disabled={sendingRequest || requestAlreadySent}
                    onClick={() => void handleSendFriendRequest(searchResult.id)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {requestAlreadySent
                      ? "Request Sent"
                      : sendingRequest
                        ? "Sending..."
                        : "Send Request"}
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Your Friends</h4>
              {loadingFriends && (
                <span className="text-xs text-muted-foreground">Loading...</span>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="rounded-xl border border-border bg-background/40 p-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {renderUserAvatar(friend)}
                    <div className="min-w-0">
                      <p className="font-medium truncate">{friend.username}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {friend.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => void onStartChat(friend)}
                  >
                    <MessageCirclePlus className="h-4 w-4 mr-2" />
                    Start Chat
                  </Button>
                </div>
              ))}

              {!friends.length && !loadingFriends && (
                <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No friends found yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

