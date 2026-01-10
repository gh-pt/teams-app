import { Chat, ChatParticipant } from "@/generated/prisma";

export interface User {
  id: string;
  userName: string;
  email: string;
  avatar: string | null;
}

export interface ChatParticipantWithUser extends ChatParticipant {
  user: User | null;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
}

export interface ChatUI {
  id: string;
  chatName: string | null;
  avatar: string | null;
  isGroup: boolean;
  lastMessage: Message | null;
  updatedAt: Date | string;
  messages: Message[];
  createdAt: Date | string;
  participants: ChatParticipantWithUser[];
}

export interface MainContainerSideBarProps {
  chats: ChatUI[];
  error: string | null;
  activeChatId: string | null;
  onChatSelect: (chat: ChatUI) => void;
  setIsMobileChatOpen: (open: boolean) => void;
}

// export type SelectedUser = {
//   id: string;
//   name: string;
//   image?: string | null;
// };

export interface PrismaChat extends Chat {
  participants: ChatParticipantWithUser[];
  messages?: Message[];
}

interface ChatHeader {
  name: string | null;
  avatar?: string | null;
  isGroup: boolean;
}

interface BaseOpenedChat {
  chatId: string;
  header: ChatHeader;
}

// Chat opened from search - includes userId for new chat creation
export interface OpenedChatFromSearch extends BaseOpenedChat {
  source: "SEARCH";
  userId: string;
}

// Chat opened from chat list - existing chat
export interface OpenedChatFromList extends BaseOpenedChat {
  source: "CHAT_LIST";
}

// Union type that handles both cases
export type OpenedChat = OpenedChatFromSearch | OpenedChatFromList;
