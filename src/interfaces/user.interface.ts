export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
}

export interface UserPresence {
  status: string;
  lastSeen?: number | null;
}

export interface CurrentChatUser extends User, UserPresence {
  avatar?: string | null;
  isTyping?: boolean;
}
