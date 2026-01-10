"use client";

import {
  ChatUI,
  ChatParticipantWithUser,
  OpenedChat,
  OpenedChatFromList,
  OpenedChatFromSearch,
  PrismaChat,
} from "./interface";
import { useCallback, useEffect, useMemo, useState } from "react";
import MainContainerSideBar from "./MainContainerSideBar";
import { useSession } from "next-auth/react";
import ChatInfo, { ChatFetchResult } from "./ChatInfo";
import { ContainerProps } from "../interface";
import { ChatParticipant, Message } from "@/generated/prisma";
import { getSocket } from "@/lib/socket-client";
import { normalizeMessage } from "@/lib/utils";

type MainView = "CHAT" | "CREATE_CHAT";

export default function MainContainer({ className }: ContainerProps) {
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [openedChat, setOpenedChat] = useState<OpenedChat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const [chats, setChats] = useState<ChatUI[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mainView, setMainView] = useState<MainView>("CHAT");
  const [participants, setParticipants] = useState<string[] | null>(null);
  const [chatParticipantsMap, setChatParticipantsMap] = useState<
    Record<string, Record<string, string>>
  >({});
  const socket = useMemo(() => getSocket(), []);

  // Map Participants
  const mapParticipants = (participants?: ChatParticipantWithUser[]) => {
    if (!participants?.length) return {};
    return participants.reduce((acc, p) => {
      acc[p.userId] = p.user?.userName || "";
      return acc;
    }, {} as Record<string, string>);
  };

  // Normalize Chat for List
  const normalizeChatForList = useCallback(
    (chat: PrismaChat): ChatUI => ({
      id: chat.id,
      chatName:
        chat.chatType === "GROUP"
          ? chat.groupName
          : chat.participants.find((p) => p.userId !== session?.user?.id)?.user
              ?.userName ?? "Unknown",
      avatar:
        chat.chatType === "GROUP"
          ? chat.groupAvatar
          : chat.participants.find((p) => p.userId !== session?.user?.id)?.user
              ?.avatar ?? null,
      isGroup: chat.chatType === "GROUP",
      lastMessage: null,
      updatedAt: chat.createdAt,
      messages: [],
      createdAt: chat.createdAt,
      participants: chat.participants,
    }),
    [session?.user?.id]
  );

  // join user
  useEffect(() => {
    if (!session?.user?.id) return;

    socket.emit("join-user");

    return () => {
      socket.off("chat-created");
    };
  }, [session?.user?.id]);

  // handle new chat created
  useEffect(() => {
    if (!session?.user?.id) return;

    const handleChatCreated = (chat: PrismaChat) => {
      setChats((prev) => {
        if (prev.some((c) => c.id === chat.id)) {
          return prev;
        }
        const normalizedChat = normalizeChatForList(chat);

        return [normalizedChat, ...prev];
      });
    };

    socket.on("chat-created", handleChatCreated);

    return () => {
      socket.off("chat-created", handleChatCreated);
    };
  }, [session?.user?.id, normalizeChatForList]);

  // Fetch User's Chats
  useEffect(() => {
    const fetchChats = async () => {
      if (!session?.user?.id) return;

      try {
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

        setChats(result.data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load chats";
        setError(errorMessage);
      }
    };

    fetchChats();
  }, [session?.user?.id, status]);

  // Create Chat
  async function createChat(data: string[]) {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participants: data,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create chat");
      }

      return result;
    } catch (error) {
      console.log(error);
    }
  }

  // handle User Select
  useEffect(() => {
    const handleUserSelect = async (
      event: CustomEvent<{ id: string; name: string; image?: string }>
    ) => {
      if (!session?.user?.id) return;
      const user = event.detail;

      try {
        const result = await createChat([session.user.id, user.id]);

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
        setMainView("CHAT");
        setActiveChatId(result.data.id);
        setMessages(result.data?.messages || []);
        setIsMobileChatOpen(true);
        setChatParticipantsMap((prev) => ({
          ...prev,
          [result.data.id]: mapParticipants(result.data.participants),
        }));
        setChats((prevChats) => {
          const exists = prevChats.some((c) => c.id === result.data.id);
          if (exists) return prevChats;

          const newChatItem = normalizeChatForList(result.data);

          return [newChatItem, ...prevChats];
        });
      } catch (err) {
        console.log(err);
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

  // handle Opened Chat
  useEffect(() => {
    if (!activeChatId) return;

    const handleNewMessage = (message: Message) => {
      console.log("new-message");
      setMessages((prev) =>
        message.chatId === activeChatId ? [...prev, message] : prev
      );

      setChats((prevChats) => {
        const normalizedLastMessage = normalizeMessage(message);

        return prevChats
          .map((chat) =>
            chat.id === message.chatId
              ? {
                  ...chat,
                  lastMessage: normalizedLastMessage,
                  updatedAt: normalizedLastMessage.createdAt,
                }
              : chat
          )
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
      });
    };

    socket.on("new-message", handleNewMessage);
    return () => {
      socket.off("new-message", handleNewMessage);
    };
  }, [activeChatId]);

  // handle Create Chat mode
  useEffect(() => {
    const handleCreateChat = (event: CustomEvent<{ userId: string }>) => {
      setOpenedChat(null);
      setMessages([]);
      setIsMobileChatOpen(true);
      setMainView("CREATE_CHAT");
    };

    window.addEventListener(
      "open-create-chat",
      handleCreateChat as EventListener
    );

    return () => {
      window.removeEventListener(
        "open-create-chat",
        handleCreateChat as EventListener
      );
    };
  }, []);

  const fetchMessages = useCallback(async (chatId: string) => {
    try {
      const response = await fetch(`/api/chat/${chatId}/messages`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch messages");
      }

      setMessages(result.data);
    } catch (err) {
      console.log(err);
    }
  }, []);

  // handle Chat Select
  const handleChatSelect = useCallback(
    async (chat: ChatUI) => {
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
      setMainView("CHAT");
      setActiveChatId(chat.id);
      await fetchMessages(chat.id);
      setIsMobileChatOpen(true);
      if (chat.participants?.length) {
        setChatParticipantsMap((prev) => ({
          ...prev,
          [chat.id]: mapParticipants(chat.participants),
        }));
      }
    },
    [fetchMessages]
  );

  const handleChatFetched = (result: ChatFetchResult) => {
    if (result.type === "NOT_FOUND") {
      setOpenedChat(null);
      setMessages([]);
      setMainView("CREATE_CHAT");
      setParticipants(result.participants);
      return;
    }

    const chat = result.chat;

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
    setMessages((chat.messages as unknown as Message[]) || []);
    setMainView("CREATE_CHAT");
    setActiveChatId(chat.id);
    setIsMobileChatOpen(true);
    setChatParticipantsMap((prev) => ({
      ...prev,
      [chat.id]: mapParticipants(chat.participants),
    }));
    setParticipants(chat.participants.map((p) => p.userId));
  };

  const handleStartChatting = async (participants: string[]) => {
    const result = await createChat(participants);
    const chat = result.data;

    const isGroup = chat.chatType === "GROUP";

    let chatName: string;
    let avatar: string | null;

    if (isGroup) {
      chatName = chat.groupName || "Group Chat";
      avatar = chat.groupAvatar || null;
    } else {
      const otherParticipant = chat.participants.find(
        (p: ChatParticipant) => p.userId !== session?.user?.id
      );
      chatName = otherParticipant?.user?.userName || "Unknown User";
      avatar = otherParticipant?.user?.avatar || null;
    }

    const opened: OpenedChatFromList = {
      source: "CHAT_LIST",
      chatId: chat.id,
      header: {
        name: chatName,
        avatar,
        isGroup,
      },
    };

    setOpenedChat(opened);
    setMainView("CHAT");
    setActiveChatId(chat.id);
    setIsMobileChatOpen(true);
    // update chats list
    setChats((prevChats) => {
      const exists = prevChats.some((c) => c.id === chat.id);
      if (exists) return prevChats;

      const newChatItem = normalizeChatForList(chat);

      return [newChatItem, ...prevChats];
    });
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
          mode={mainView}
          openedChat={openedChat}
          messages={messages}
          onBack={() => {
            setMainView("CHAT");
            setIsMobileChatOpen(false);
          }}
          onChatFetched={handleChatFetched}
          participants={participants}
          onStartChatting={handleStartChatting}
          chatParticipants={chatParticipantsMap[openedChat?.chatId || ""] ?? {}}
        />
      </div>
    </main>
  );
}
