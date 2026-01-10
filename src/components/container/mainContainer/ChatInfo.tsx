"use client";

import Image from "next/image";
import { BsThreeDots } from "react-icons/bs";
import { LuArrowLeft, LuSend } from "react-icons/lu";
import { ChatUI, OpenedChat, PrismaChat } from "./interface";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChatParticipant, Message } from "@/generated/prisma";
import { useSession } from "next-auth/react";
import { getSocket } from "@/lib/socket-client";
import { searchUsers } from "@/app/actions/userAction";
import { UserData } from "@/components/navbar/TopNavbar";
import { searchChats } from "@/app/actions/chatActions";

export type ChatMode = "CHAT" | "CREATE_CHAT";

export type ChatFetchResult =
  | { type: "FOUND"; chat: ChatUI }
  | { type: "NOT_FOUND"; participants: string[] };

type ChatInfoProps = {
  mode: ChatMode;
  openedChat: OpenedChat | null;
  messages: Message[];
  participants: string[] | null;
  onBack?: () => void;
  onChatFetched?: (result: ChatFetchResult) => void;
  onStartChatting: (participants: string[]) => void;
  chatParticipants: Record<string, string>;
};

type TypingPayload = {
  chatId: string;
  userId: string;
};

type StopTypingPayload = {
  chatId: string;
  userId: string;
};

type SelectedUser = {
  id: string;
  name: string;
  image?: string | null;
};

function CreateChatHeader({
  sessionUserId,
  onBack,
  onChatFetched,
}: {
  sessionUserId: string;
  onBack?: () => void;
  onChatFetched?: (result: ChatFetchResult) => void;
}) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // handle search
  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);

      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

      if (!value.trim()) {
        setUsers([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      debounceTimeout.current = setTimeout(async () => {
        try {
          const result = await searchUsers(value);
          if (result.status === "success") {
            setUsers(
              result.data.filter(
                (u) => !selectedUsers.some((s) => s.id === u.id)
              )
            );
          } else {
            setUsers([]);
          }
        } finally {
          setLoading(false);
        }
      }, 400);
    },
    [selectedUsers]
  );

  const mapPrismaChatToUI = (chat: PrismaChat): ChatUI => ({
    id: chat.id,
    chatName:
      chat.groupName ??
      chat.participants.find((p: ChatParticipant) => p.userId !== sessionUserId)
        ?.user?.userName ??
      "Chat",
    avatar: chat.groupAvatar ?? null,
    isGroup: chat.chatType === "GROUP",
    lastMessage: chat.messages?.[chat.messages.length - 1] ?? null,
    createdAt: chat.createdAt.toISOString(),
    updatedAt: chat.updatedAt.toISOString(),
    messages: chat.messages ?? [],
    participants: chat.participants ?? [],
  });

  // run chat search
  const runChatSearch = async (userIds: string[]) => {
    if (userIds.length < 2) {
      onChatFetched?.({
        type: "NOT_FOUND",
        participants: userIds,
      });
      return;
    }

    const result = await searchChats(userIds);

    if (result.status === "success" && result.data?.length) {
      const uiChat = mapPrismaChatToUI(result.data[0] as PrismaChat);
      onChatFetched?.({
        type: "FOUND",
        chat: uiChat,
      });
    } else {
      onChatFetched?.({
        type: "NOT_FOUND",
        participants: userIds,
      });
    }
  };

  // select user
  const handleUserSelect = async (user: SelectedUser) => {
    if (selectedUsers.some((u) => u.id === user.id)) return;

    const nextSelectedUsers = [...selectedUsers, user];
    setSelectedUsers(nextSelectedUsers);
    setQuery("");
    setUsers([]);

    const participants = [...nextSelectedUsers.map((u) => u.id), sessionUserId];
    await runChatSearch(participants);

    inputRef.current?.focus();
  };

  // Remove user from selected users
  const removeUser = (id: string) => {
    const updatedUsers = selectedUsers.filter((u) => u.id !== id);
    setSelectedUsers(updatedUsers);

    const participants = [...updatedUsers.map((u) => u.id), sessionUserId];
    console.log(participants);
    runChatSearch(participants);
  };

  return (
    <div className="h-[61px] w-full flex items-center gap-2 px-4 border-b border-[#3F3F3F] relative">
      <button onClick={onBack} className="p-1 rounded-md hover:bg-[#1F1F1F]">
        ←
      </button>

      <div
        className="w-full min-h-[40px] flex items-center flex-wrap gap-1 px-2 rounded-lg bg-[#1F1F1F] border border-[#3F3F3F]"
        onClick={() => inputRef.current?.focus()}
      >
        <span className="text-sm text-gray-400">To:</span>

        {/* Selected Users (Chips) */}
        {selectedUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-1 bg-[#3A3A3A] px-2 py-1 rounded-md text-sm"
          >
            <span>{user.name}</span>
            <button
              onClick={() => removeUser(user.id)}
              className="text-gray-400 hover:text-white"
              onMouseDown={(e) => e.preventDefault()}
            >
              ✕
            </button>
          </div>
        ))}

        {/* Input */}
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setTimeout(() => setIsSearchFocused(false), 500)}
          placeholder={selectedUsers.length === 0 ? "Type a name" : ""}
          className="flex-1 bg-transparent outline-none text-sm text-white min-w-[120px]"
        />
      </div>

      {/* Dropdown */}
      {isSearchFocused && (
        <div className="absolute top-[70px] left-1/2 -translate-x-1/2 w-full max-w-[774px]  bg-[#292929] border border-[#3F3F3F] rounded-lg shadow-xl z-50">
          {loading ? (
            <div className="p-4 text-sm text-gray-400">Searching...</div>
          ) : users.length > 0 ? (
            users.map((user) => (
              <div
                key={user.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleUserSelect({
                    id: user.id,
                    name: user.userName,
                    image: user.avatar,
                  });
                }}
                className="flex items-center gap-3 px-4 py-2 hover:bg-[#3d3d3d] cursor-pointer"
              >
                <Image
                  src={user.avatar || "/default-avatar.png"}
                  className="h-8 w-8 rounded-full"
                  alt={user.userName}
                  width={32}
                  height={32}
                />
                <div>
                  <p className="text-sm">{user.userName}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-sm text-gray-400">No results</div>
          )}
        </div>
      )}
    </div>
  );
}

function ChatHeader({
  openedChat,
  onBack,
  typingText,
}: {
  openedChat: OpenedChat | null;
  onBack?: () => void;
  typingText: string;
}) {
  return (
    <div className="h-[61px] flex flex-col justify-center border-b border-[#3F3F3F]">
      <div className="px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="custom-sm:hidden p-1 hover:bg-[#1F1F1F] rounded"
            >
              <LuArrowLeft size={20} />
            </button>
          )}
          <Image
            src={openedChat?.header.avatar || "/logos/logo-transparent-1.png"}
            alt={openedChat?.header.name || ""}
            width={32}
            height={32}
            className="rounded-full"
          />
          <span className="font-bold">{openedChat?.header.name || ""}</span>
        </div>
        <BsThreeDots className="cursor-pointer hover:text-[#7F85F5]" />
      </div>
      {/* Typing indicator */}
      <div className="w-full h-[10px] px-4 text-[8px] text-gray-400 italic">
        {typingText}
      </div>
    </div>
  );
}

export default function ChatInfo({
  mode,
  openedChat,
  messages,
  onBack,
  onChatFetched,
  participants,
  onStartChatting,
  chatParticipants,
}: ChatInfoProps) {
  const { data: session } = useSession();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [textareaValue, setTextareaValue] = useState("");
  const typingUsersRef = useRef<Set<string>>(new Set());
  const [typingText, setTypingText] = useState("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const shouldShowChatUI =
    mode === "CREATE_CHAT" || (mode === "CHAT" && !!openedChat);
  const socket = useMemo(() => getSocket(), []);

  // Socket connection for CHAT mode
  useEffect(() => {
    if (mode !== "CHAT" || !openedChat) return;

    socket.emit("join-chat", openedChat.chatId);

    return () => {
      socket.emit("leave-chat", openedChat.chatId);
    };
  }, [mode, openedChat?.chatId, socket]);

  // Update typing text
  const updateTypingText = () => {
    if (!openedChat) {
      setTypingText("");
      return;
    }

    const names = Array.from(typingUsersRef.current)
      .map((id) => chatParticipants[id])
      .filter(Boolean);

    if (names.length === 0) {
      setTypingText("");
      return;
    }

    // One-to-one chat
    if (!openedChat.header.isGroup) {
      setTypingText(`${openedChat.header.name} is typing…`);
      return;
    }

    // Group chat
    if (names.length === 1) {
      setTypingText(`${names[0]} is typing…`);
    } else if (names.length <= 3) {
      setTypingText(`${names.join(", ")} are typing…`);
    } else {
      setTypingText("Multiple people are typing…");
    }
  };

  // Typing indicators for CHAT mode
  useEffect(() => {
    if (mode !== "CHAT" || !openedChat) return;

    const handleTyping = ({ chatId, userId }: TypingPayload) => {
      if (chatId !== openedChat.chatId || userId === session?.user?.id) return;
      typingUsersRef.current.add(userId);
      updateTypingText();
    };

    const handleStopTyping = ({ chatId, userId }: StopTypingPayload) => {
      if (chatId !== openedChat.chatId || userId === session?.user?.id) return;
      typingUsersRef.current.delete(userId);
      updateTypingText();
    };

    socket.on("user-typing", handleTyping);
    socket.on("user-stop-typing", handleStopTyping);

    return () => {
      socket.off("user-typing", handleTyping);
      socket.off("user-stop-typing", handleStopTyping);
    };
  }, [mode, openedChat?.chatId, socket, chatParticipants]);


  // Auto-scroll to bottom when messages change
  const isNearBottom = () => {
    const el = bottomRef.current?.parentElement;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 150;
  };

  useEffect(() => {
    if (isNearBottom()) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Adjust textarea height
  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "45px";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 100) + "px";
    }
  }, []);

  // Handle textarea change
  const handleTextareaChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setTextareaValue(event.target.value);
      adjustTextareaHeight();

      if (mode !== "CHAT" || !openedChat) return;

      const socket = getSocket();
      socket.emit("typing", { chatId: openedChat.chatId });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stop-typing", { chatId: openedChat.chatId });
      }, 800);
    },
    [mode, openedChat]
  );

  // Handle input focus
  const handleInputFocus = async () => {
    if (mode === "CREATE_CHAT") {
      onStartChatting(participants || []);
      return;
    }
  };

  // Handle send
  const handleSend = useCallback(() => {
    if (!textareaValue.trim() || !openedChat) return;

    socket.emit("send-message", {
      chatId: openedChat.chatId,
      content: textareaValue,
    });

    socket.emit("stop-typing", { chatId: openedChat.chatId });

    setTextareaValue("");
    textareaRef.current!.style.height = "45px";
  }, [textareaValue, openedChat, socket]);

  // Handle keydown
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // Check if message is mine
  const isMine = session?.user?.id;

  const renderedMessages = useMemo(() => {
    if (messages.length === 0) return null;

    return messages.map((msg) => (
      <div
        key={msg.id}
        className={`w-fit min-w-[50px] max-w-[70%] p-2 rounded-md flex flex-col gap-0.5 ${
          msg.senderId === isMine
            ? "ml-auto bg-blue-500 text-white"
            : "bg-gray-700 text-white"
        }`}
      >
        <span className="wrap-break-word">{msg.content}</span>
        <small className="text-[8px] ml-auto opacity-70">
          {new Date(msg.createdAt).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </small>
      </div>
    ));
  }, [messages, isMine]);

  return (
    <div className="h-full w-full bg-[#292929] rounded-lg flex flex-col">
      {/* Header based on mode */}
      {mode === "CREATE_CHAT" ? (
        <CreateChatHeader
          onBack={onBack}
          sessionUserId={session?.user?.id || ""}
          onChatFetched={onChatFetched}
        />
      ) : openedChat ? (
        <ChatHeader
          openedChat={openedChat}
          onBack={onBack}
          typingText={typingText}
        />
      ) : (
        ""
      )}

      {/* Empty state */}
      {!shouldShowChatUI && (
        <div className="flex-1 hidden md:flex items-center justify-center text-gray-400">
          <div className="text-center">
            <p className="text-lg">Select a chat to start Conversation</p>
          </div>
        </div>
      )}

      {/* Messages + Input */}
      {shouldShowChatUI && (
        <div className="h-[calc(100%-61px)] w-full flex flex-col">
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-2 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                {mode === "CREATE_CHAT"
                  ? "Start a conversation"
                  : "No messages yet. Say hi! 👋"}
              </div>
            ) : (
              renderedMessages
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-2">
            <div className="ChatInput border-2 border-[#3F3F3F] rounded-lg flex items-center gap-2 px-2 py-1 bg-[#1F1F1F]">
              <textarea
                ref={textareaRef}
                value={textareaValue}
                onFocus={handleInputFocus}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Message"
                className="w-full bg-transparent border-none outline-none resize-none custom-scrollbar text-white"
                style={{ minHeight: "45px" }}
              />
              <button
                onClick={handleSend}
                disabled={!textareaValue.trim()}
                className={`p-2 rounded-md transition-colors ${
                  textareaValue.trim()
                    ? "hover:bg-[#2F2F2F] text-blue-400"
                    : "text-gray-600 cursor-not-allowed"
                }`}
              >
                <LuSend size={22} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
