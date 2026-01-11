"use client";

import { LuArrowLeft } from "react-icons/lu";
import { OpenedChat } from "../interface";
import Image from "next/image";
import { BsThreeDots } from "react-icons/bs";

export default function ChatHeader({
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
