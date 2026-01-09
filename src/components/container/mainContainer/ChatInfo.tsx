"use client";

import Image from "next/image";
import { BsThreeDots } from "react-icons/bs";
import { LuArrowLeft, LuSend } from "react-icons/lu";
import { OpenedChat } from "./interface";
import { useEffect, useRef, useState } from "react";
import { Message } from "@/generated/prisma";
import { useSession } from "next-auth/react";
import { getSocket } from "@/lib/socket-client";

type ChatInfoProps = {
  openedChat: OpenedChat | null;
  messages: Message[];
  onBack?: () => void;
};

type TypingPayload = {
  chatId: string;
  userId: string;
};

type StopTypingPayload = {
  chatId: string;
  userId: string;
};

export default function ChatInfo({
  openedChat,
  messages,
  onBack,
}: ChatInfoProps) {
  const { data: session } = useSession();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [textareaValue, setTextareaValue] = useState("");
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!openedChat) return;

    const socket = getSocket();

    socket.emit("join-chat", openedChat.chatId);

    return () => {
      socket.emit("leave-chat", openedChat.chatId);
    };
  }, [openedChat?.chatId]);

  useEffect(() => {
    if (!openedChat) return;

    const socket = getSocket();

    const handleTyping = ({ chatId, userId }: TypingPayload) => {
      if (chatId !== openedChat.chatId) return;
      if (userId === session?.user?.id) return;

      setIsOtherUserTyping(true);
    };

    const handleStopTyping = ({ chatId, userId }: StopTypingPayload) => {
      if (chatId !== openedChat.chatId) return;
      if (userId === session?.user?.id) return;

      setIsOtherUserTyping(false);
    };

    socket.on("user-typing", handleTyping);
    socket.on("user-stop-typing", handleStopTyping);

    return () => {
      socket.off("user-typing", handleTyping);
      socket.off("user-stop-typing", handleStopTyping);
    };
  }, [openedChat?.chatId, session?.user?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTextareaChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setTextareaValue(event.target.value);
    adjustTextareaHeight();

    if (!openedChat) return;

    const socket = getSocket();

    socket.emit("typing", { chatId: openedChat.chatId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing", { chatId: openedChat.chatId });
    }, 800);
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "45px";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 100) + "px";
    }
  };

  const sendMessage = (content: string) => {
    if (!openedChat || !content.trim()) return;

    const socket = getSocket();

    socket.emit("send-message", {
      chatId: openedChat.chatId,
      content,
    });
  };

  const handleSend = () => {
    if (!textareaValue.trim() || !openedChat) return;

    sendMessage(textareaValue);

    const socket = getSocket();
    socket.emit("stop-typing", { chatId: openedChat.chatId });

    setTextareaValue("");
  };

  if (!openedChat) {
    return (
      <div className="h-full w-full bg-[#292929] rounded-lg items-center justify-center text-gray-400 hidden custom-sm:flex">
        Select a user to start chatting
      </div>
    );
  }
  const isMine = session?.user?.id;

  return (
    <div className="h-full w-full bg-[#292929] rounded-lg flex flex-col">
      {/* Header */}
      <div className="h-[61px] flex flex-col justify-center items-center px-4 border-b border-[#3F3F3F]">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="custom-sm:hidden p-1 rounded-md hover:bg-[#1F1F1F]"
              >
                <LuArrowLeft size={22} />
              </button>
            )}

            <Image
              src={openedChat.header.avatar || "/logos/logo-transparent-1.png"}
              alt={openedChat.header.name}
              width={32}
              height={32}
              className="rounded-full"
            />

            <span className="font-bold">{openedChat.header.name}</span>
          </div>
          <BsThreeDots className="cursor-pointer hover:text-[#7F85F5]" />
        </div>
        {/* Typing indicator */}
        <div className="w-full h-3 px-4 text-[8px] text-gray-300 italic">
          {isOtherUserTyping ? `${openedChat.header.name} is typing…` : ""}
        </div>
      </div>

      {/* Messages */}
      <div className="h-[calc(100%-61px)] w-full flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto space-y-2 custom-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`w-fit min-w-[50px] max-w-[70%] p-2 rounded-md flex flex-col gap-0.5 ${
                msg.senderId === isMine ? "ml-auto bg-blue-400" : "bg-gray-700"
              }`}
            >
              {msg.content}
              <small className="text-[6px] ml-auto">
                {new Date(msg.createdAt).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </small>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="ChatInput border-2 border-[#3F3F3F] rounded-lg flex items-center gap-2 px-2 py-1">
          <textarea
            ref={textareaRef}
            value={textareaValue}
            onChange={handleTextareaChange}
            placeholder="Message"
            className="w-full border-none outline-none resize-none custom-scrollbar"
          />
          <button
            onClick={handleSend}
            className="p-2 hover:bg-[#1F1F1F] rounded-md"
          >
            <LuSend size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}
