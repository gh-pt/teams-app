interface User {
  id: string;
  userName: string;
  email: string;
  avatar: string | null;
}

interface Participant {
  userId: string;
  user: User;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
}

export interface Chat {
  id: string;
  chatName: string;
  avatar: string | null;
  isGroup: boolean;
  lastMessage: Message | null;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
  participants?: Participant[];
}

export interface MainContainerSideBarProps {
  chats: Chat[];
  error: string | null;
  activeChatId: string | null;
  onChatSelect: (chat: Chat) => void;
  setIsMobileChatOpen: (open: boolean) => void;
}

// export type SelectedUser = {
//   id: string;
//   name: string;
//   image?: string | null;
// };

interface ChatHeader {
  name: string;
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
