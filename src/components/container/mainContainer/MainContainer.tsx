"use client";

import {
  Chat,
  OpenedChat,
  OpenedChatFromList,
  OpenedChatFromSearch,
} from "./interface";
import { useEffect, useState } from "react";
import MainContainerSideBar from "./MainContainerSideBar";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import ChatInfo from "./ChatInfo";
import { ContainerProps } from "../interface";
import { Message } from "@/generated/prisma";
import { getSocket } from "@/lib/socket-client";
import { normalizeMessage } from "@/lib/utils";

export default function MainContainer({ className }: ContainerProps) {
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [openedChat, setOpenedChat] = useState<OpenedChat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChats = async () => {
      if (status === "loading") return;
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/chat/user/${session?.user?.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch chats");
        }

        console.log(result.data);
        setChats(result.data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load chats";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [session?.user?.id, status]);

  useEffect(() => {
    const handleUserSelect = async (
      event: CustomEvent<{ id: string; name: string; image?: string }>
    ) => {
      if (!session?.user?.id) return;
      const user = event.detail;

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            participants: [session.user.id, user.id],
          }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error);

        const opened: OpenedChatFromSearch = {
          source: "SEARCH",
          chatId: result.data.id,
          userId: user.id,
          header: {
            name: user.name,
            avatar: user.image,
            isGroup: false,
          },
        };

        setOpenedChat(opened);
        setActiveChatId(result.data.id);
        setMessages(result.data?.messages || []);
        // await fetchMessages(result.data.id);
        setIsMobileChatOpen(true);
      } catch (err) {
        toast.error("Failed to open chat");
      }
    };

    window.addEventListener(
      "user-select",
      handleUserSelect as unknown as EventListener
    );

    return () =>
      window.removeEventListener(
        "user-select",
        handleUserSelect as unknown as EventListener
      );
  }, [session?.user?.id]);

  useEffect(() => {
    if (!openedChat) return;

    const socket = getSocket();

    const handleNewMessage = (message: Message) => {
      // Update open chat messages
      if (message.chatId === openedChat.chatId) {
        setMessages((prev) => [...prev, message]);
      }

      // Update chat list (lastMessage + ordering)
      setChats((prevChats) => {
        const normalizedLastMessage = normalizeMessage(message);

        const updatedChats = prevChats.map((chat) =>
          chat.id === message.chatId
            ? {
                ...chat,
                lastMessage: normalizedLastMessage,
                updatedAt: normalizedLastMessage.createdAt,
              }
            : chat
        );

        return updatedChats.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });
    };

    socket.on("new-message", handleNewMessage);

    return () => {
      socket.off("new-message", handleNewMessage);
    };
  }, [openedChat?.chatId]);

  const fetchMessages = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chat/${chatId}/messages`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch messages");
      }

      setMessages(result.data);
    } catch (err) {
      toast.error("Failed to load messages");
    }
  };

  const handleChatSelect = async (chat: Chat) => {
    const opened: OpenedChatFromList = {
      source: "CHAT_LIST",
      chatId: chat.id,
      header: {
        name: chat.chatName,
        avatar: chat.avatar,
        isGroup: chat.isGroup,
      },
    };

    setOpenedChat(opened);
    setActiveChatId(chat.id);
    await fetchMessages(chat.id);
    setIsMobileChatOpen(true);
  };

  return (
    <main className={`${className} relative overflow-hidden`}>
      <MainContainerSideBar
        chats={chats}
        error={error}
        activeChatId={activeChatId}
        onChatSelect={handleChatSelect}
        setIsMobileChatOpen={setIsMobileChatOpen}
      />
      {/* Main Content */}
      <div
        className={`main-content absolute custom-sm:static inset-0 flex-1 h-full transition-all duration-300 ease-in-out sm:pr-2 sm:pb-2 ${
          isMobileChatOpen ? "left-0" : "left-full custom-sm:left-0"
        }`}
      >
        <ChatInfo
          openedChat={openedChat}
          messages={messages}
          onBack={() => setIsMobileChatOpen(false)}
        />
      </div>
    </main>
  );
}
