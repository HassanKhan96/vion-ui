import { useEffect, useMemo, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Clock3, Mail, UserRoundPlus, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "../ui/Button";
import {
  GET_PENDING_FRIEND_REQUESTS,
  RESPOND_TO_FRIEND_REQUEST,
} from "../../graphql/friends.queries";
import { getConfig } from "../../config/Application";

type PendingFriendRequest = {
  id: string;
  status: boolean;
  created_at: string;
  from: {
    id: string;
    username: string;
    email: string;
    avatar_url?: string | null;
    created_at: string;
  };
};

type Props = {
  open: boolean;
  onClose: () => void;
  onPendingCountChange?: (count: number) => void;
};

const parseRequestDate = (value: string) => {
  if (/^\d+$/.test(value)) {
    const asNumber = Number(value);
    if (Number.isFinite(asNumber)) {
      return new Date(asNumber);
    }
  }

  return new Date(value);
};

export default function FriendRequestsModal({
  open,
  onClose,
  onPendingCountChange,
}: Props) {
  const { BASE_URL } = getConfig();
  const [requests, setRequests] = useState<PendingFriendRequest[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);

  const [fetchRequests, { loading }] = useLazyQuery(GET_PENDING_FRIEND_REQUESTS, {
    fetchPolicy: "network-only",
  });
  const [respondToRequest] = useMutation(RESPOND_TO_FRIEND_REQUEST);

  const pendingCount = requests.length;

  useEffect(() => {
    onPendingCountChange?.(pendingCount);
  }, [pendingCount, onPendingCountChange]);

  useEffect(() => {
    if (!open) return;

    const loadRequests = async () => {
      try {
        setFeedback(null);
        const { data } = await fetchRequests();
        const rows = ((data as any)?.myFriendRequests || []) as PendingFriendRequest[];
        setRequests(rows);
      } catch (error: any) {
        const message =
          error?.graphQLErrors?.[0]?.message ||
          error?.message ||
          "Could not load pending requests";
        setFeedback(message);
      }
    };

    void loadRequests();
  }, [open, fetchRequests]);

  useEffect(() => {
    if (!open) return;

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [open, onClose]);

  const sortedRequests = useMemo(
    () =>
      [...requests].sort(
        (left, right) =>
          new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
      ),
    [requests],
  );

  if (!open) return null;

  const getAvatarSrc = (avatarUrl?: string | null) => {
    if (!avatarUrl) return null;
    if (avatarUrl.startsWith("http")) return avatarUrl;
    return `${BASE_URL}${avatarUrl}`;
  };

  const handleRespond = async (
    requestId: string,
    status: "accepted" | "rejected",
  ) => {
    try {
      setFeedback(null);
      setActiveRequestId(requestId);
      await respondToRequest({
        variables: {
          input: {
            requestId,
            status,
          },
        },
      });

      setRequests((prev) => prev.filter((request) => request.id !== requestId));
      setFeedback(
        status === "accepted"
          ? "Friend request accepted"
          : "Friend request rejected",
      );
    } catch (error: any) {
      const message =
        error?.graphQLErrors?.[0]?.message ||
        error?.message ||
        "Could not update friend request";
      setFeedback(message);
    } finally {
      setActiveRequestId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.18 }}
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold">Friend Requests</h3>
            <p className="text-sm text-muted-foreground">
              Review pending requests you have received.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4 p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock3 className="h-4 w-4" />
            <span>
              {loading ? "Loading requests..." : `${pendingCount} pending request${pendingCount === 1 ? "" : "s"}`}
            </span>
          </div>

          {feedback && <p className="text-sm text-muted-foreground">{feedback}</p>}

          <div className="max-h-[28rem] space-y-3 overflow-y-auto pr-1">
            <AnimatePresence mode="popLayout">
              {sortedRequests.map((request) => {
                const avatarSrc = getAvatarSrc(request.from.avatar_url);
                const isBusy = activeRequestId === request.id;
                const createdAt = parseRequestDate(request.created_at);
                const receivedLabel = Number.isNaN(createdAt.getTime())
                  ? "Received recently"
                  : `Received ${formatDistanceToNow(createdAt, {
                      addSuffix: true,
                    })}`;

                return (
                  <motion.div
                    key={request.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background/40 p-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {avatarSrc ? (
                        <img
                          src={avatarSrc}
                          alt={`${request.from.username} avatar`}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <UserRoundPlus className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium">{request.from.username}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          <span className="truncate">{request.from.email}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {receivedLabel}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-shrink-0 items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isBusy}
                        onClick={() => void handleRespond(request.id, "rejected")}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        disabled={isBusy}
                        onClick={() => void handleRespond(request.id, "accepted")}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Accept
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {!loading && !sortedRequests.length && (
              <div className="rounded-xl border border-dashed border-border bg-background/30 px-4 py-10 text-center">
                <p className="font-medium">No pending requests</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  New friend requests will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
