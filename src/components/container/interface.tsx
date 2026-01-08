export interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

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
  createdAt: string;
  updatedAt: string;
  participants: Participant[];
  messages: Message[];
  chatName: string;
  avatar: string | null;
  lastMessage: Message | null;
}

export interface MainContainerSideBarProps {
  setIsMobileChatOpen: (isOpen: boolean) => void;
  chats: Chat[];
  loading: boolean;
  error: string | null;
}
