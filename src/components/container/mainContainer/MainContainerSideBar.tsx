"use client";

import { IoFilter } from "react-icons/io5";
import { RiEditBoxLine } from "react-icons/ri";
import { Tooltip } from "@heroui/tooltip";
import { HiOutlineVideoCamera, HiMiniVideoCamera } from "react-icons/hi2";
import { MdArrowDropDown } from "react-icons/md";
import Image from "next/image";
import { MainContainerSideBarProps } from "./interface";
import { useSession } from "next-auth/react";
import { memo } from "react";

export default memo(function MainContainerSideBar({
  chats,
  error,
  activeChatId,
  onChatSelect,
  setIsMobileChatOpen,
}: MainContainerSideBarProps) {
  const session = useSession();

  function handleCreateChat(userId: string) {
    window.dispatchEvent(
      new CustomEvent("open-create-chat", { detail: { userId } })
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <p className="text-red-500 font-medium">Failed to load chats</p>
        <p className="text-sm text-gray-500 mt-1">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="sidebar w-full custom-sm:w-[40%] custom-md:w-[30%] custom-lg:w-[25%] h-full flex flex-col box-border">
      {/* Header */}
      <div className="w-full h-[61px] min-h-[61px] flex items-center justify-center bg-[#0A0A0A] px-[20px]">
        <div className="w-fit h-full flex items-center font-bold text-xl">
          Chat
        </div>
        <div className="w-full h-full flex items-center justify-end gap-2">
          {/* <Tooltip content="Filter" className="bg-[#1F1F1F] rounded-lg">
            <button className="group w-[32px] h-[32px] rounded-lg bg-[#1F1F1F] grid place-items-center cursor-pointer transition-all duration-200 hover:shadow-[-2px_2px_10px_rgba(127,133,245,0.5)] hover:border-[#7F85F5]/30">
              <IoFilter
                size={18}
                className="group-hover:text-[#7F85F5] transition-colors duration-200"
              />
            </button>
          </Tooltip> */}
          {/* <Tooltip content="Meet now" className="bg-[#1F1F1F] rounded-lg">
            <button className="group w-[32px] h-[32px] rounded-lg bg-[#1F1F1F] grid place-items-center cursor-pointer transition-all duration-200 hover:shadow-[-2px_2px_10px_rgba(127,133,245,0.5)] hover:border-[#7F85F5]/30">
              <HiOutlineVideoCamera
                size={18}
                className="group-hover:hidden transition-colors duration-200"
              />
              <HiMiniVideoCamera
                size={18}
                className="hidden group-hover:block text-[#7F85F5] transition-colors duration-200"
              />
            </button>
          </Tooltip> */}
          <Tooltip content="Edit" className="bg-[#1F1F1F] rounded-lg">
            <button className="group w-[32px] h-[32px] rounded-lg bg-[#1F1F1F] grid place-items-center cursor-pointer transition-all duration-300 hover:shadow-[-2px_2px_10px_rgba(127,133,245,0.5)] hover:border-[#7F85F5]/30">
              <RiEditBoxLine
                size={18}
                className="group-hover:text-[#7F85F5] transition-colors duration-300"
                onClick={() => handleCreateChat(session?.data?.user?.id || "")}
              />
            </button>
          </Tooltip>
        </div>
      </div>
      {/* Body */}
      <div className="w-full h-full flex flex-col">
        <div className="h-[36px] px-4 flex items-center justify-baseline">
          <span className="mt-4 flex items-center justify-baseline gap-1">
            <MdArrowDropDown size={18} color="#adadad" />
            <span className="text-[12px] text-[#adadad]">Recent</span>
          </span>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
          {chats.length > 0 ? (
            chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => {
                  setIsMobileChatOpen(true);
                  onChatSelect(chat);
                  setIsMobileChatOpen(true);
                }}
                className={`group w-full h-[72px] flex items-center px-2 gap-2 cursor-pointer rounded-xl transition-colors ${
                  activeChatId === chat.id
                    ? "bg-[#252525] text-white"
                    : "hover:bg-[#252525] text-gray-200"
                }`}
              >
                <div className="relative w-[44px] h-[44px] flex items-center justify-center">
                  <Image
                    src={chat.avatar || "/logos/logo-transparent-1.png"}
                    alt={chat.chatName || "Image-alt"}
                    className="rounded-full object-cover"
                    width={44}
                    height={44}
                  />
                </div>
                <div className="w-full flex flex-col gap-0.5">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-medium group-hover:text-white ${
                        activeChatId === chat.id
                          ? "text-white"
                          : "text-gray-400"
                      }`}
                    >
                      {chat.chatName}
                    </span>
                    <span
                      className={`text-xs group-hover:text-white ${
                        activeChatId === chat.id
                          ? "text-white"
                          : "text-gray-400"
                      }`}
                    >
                      {chat?.lastMessage?.createdAt &&
                        new Date(
                          chat.lastMessage?.createdAt || ""
                        ).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs group-hover:text-white ${
                        activeChatId === chat.id
                          ? "text-white"
                          : "text-gray-400"
                      }`}
                    >
                      {chat.lastMessage?.content || ""}
                    </span>
                    <span>
                      {(chat.unreadCount ?? 0) > 0 && (
                        <span className="bg-[#7F85F5] text-white text-xs px-2 py-1 rounded-full">
                          {chat.unreadCount}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              No chats found
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
