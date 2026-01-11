"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { getSocket } from "@/lib/socket-client";
import { ChatInfoProps, TypingPayload } from "./types";
import CreateChatHeader from "./CreateChatHeader";
import ChatHeader from "./ChatHeader";
import { LuSend } from "react-icons/lu";

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
  }, [mode, openedChat?.chatId, socket, openedChat]);

  // Mark messages as read
  useEffect(() => {
    if (!openedChat) return;

    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("reset-unread-count", {
          detail: { chatId: openedChat.chatId },
        })
      );
    }, 500);

    socket.emit("mark-as-read", { chatId: openedChat.chatId });
    return () => {
      socket.emit("mark-as-read", { chatId: openedChat.chatId });
    };
  }, [openedChat, socket]);

  // Update typing text
  const updateTypingText = useCallback(() => {
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
  }, [openedChat, chatParticipants]);

  // Typing indicators for CHAT mode
  useEffect(() => {
    if (mode !== "CHAT" || !openedChat) return;

    const handleTyping = ({ chatId, userId }: TypingPayload) => {
      if (chatId !== openedChat.chatId || userId === session?.user?.id) return;
      typingUsersRef.current.add(userId);
      updateTypingText();
    };

    const handleStopTyping = ({ chatId, userId }: TypingPayload) => {
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
  }, [
    mode,
    openedChat?.chatId,
    socket,
    chatParticipants,
    session?.user?.id,
    openedChat,
    updateTypingText,
  ]);

  // auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
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
    [mode, openedChat, adjustTextareaHeight]
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

    return messages.map((msg) => {
      const isRead = msg.senderId === isMine && msg.readAt !== null;
      return (
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
            {isRead ? "✔" : ""}
          </small>
        </div>
      );
    });
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
