import { Message } from "@/generated/prisma/client";
import { ChatUI, OpenedChat } from "../interface";

export type ChatMode = "CHAT" | "CREATE_CHAT";

export type ChatFetchResult =
  | { type: "FOUND"; chat: ChatUI }
  | { type: "NOT_FOUND"; participants: string[] };

export type ChatInfoProps = {
  mode: ChatMode;
  openedChat: OpenedChat | null;
  messages: Message[];
  participants: string[] | null;
  onBack?: () => void;
  onChatFetched?: (result: ChatFetchResult) => void;
  onStartChatting: (participants: string[]) => void;
  chatParticipants: Record<string, string>;
};

export type TypingPayload = {
  chatId: string;
  userId: string;
};


export type SelectedUser = {
  id: string;
  name: string;
  image?: string | null;
};