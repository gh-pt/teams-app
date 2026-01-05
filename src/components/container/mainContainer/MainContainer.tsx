"use client";

import { ContainerProps } from "../interface";
import { useState } from "react";
import Image from "next/image";
import { IoFilter } from "react-icons/io5";
import { RiEditBoxLine } from "react-icons/ri";
import { Tooltip } from "@heroui/tooltip";
import { HiOutlineVideoCamera, HiMiniVideoCamera } from "react-icons/hi2";
import { MdArrowDropDown } from "react-icons/md";
import { LuArrowLeft } from "react-icons/lu";

export const users = [
  {
    id: 1,
    name: "Tony Reichert",
    role: "CEO",
    team: "Management",
    status: "active",
    age: "29",
    avatar: "https://d2u8k2ocievbld.cloudfront.net/memojis/male/1.png",
    email: "tony.reichert@example.com",
  },
  {
    id: 2,
    name: "Zoey Lang",
    role: "Tech Lead",
    team: "Development",
    status: "paused",
    age: "25",
    avatar: "https://d2u8k2ocievbld.cloudfront.net/memojis/female/1.png",
    email: "zoey.lang@example.com",
  },
  {
    id: 3,
    name: "Jane Fisher",
    role: "Sr. Dev",
    team: "Development",
    status: "active",
    age: "22",
    avatar: "https://d2u8k2ocievbld.cloudfront.net/memojis/female/2.png",
    email: "jane.fisher@example.com",
  },
  {
    id: 4,
    name: "William Howard",
    role: "C.M.",
    team: "Marketing",
    status: "vacation",
    age: "28",
    avatar: "https://d2u8k2ocievbld.cloudfront.net/memojis/male/2.png",
    email: "william.howard@example.com",
  },
  {
    id: 5,
    name: "William Howard",
    role: "C.M.",
    team: "Marketing",
    status: "vacation",
    age: "28",
    avatar: "https://d2u8k2ocievbld.cloudfront.net/memojis/male/2.png",
    email: "william.howard@example.com",
  },
  {
    id: 6,
    name: "William Howard",
    role: "C.M.",
    team: "Marketing",
    status: "vacation",
    age: "28",
    avatar: "https://d2u8k2ocievbld.cloudfront.net/memojis/male/2.png",
    email: "william.howard@example.com",
  },
  {
    id: 7,
    name: "William Howard",
    role: "C.M.",
    team: "Marketing",
    status: "vacation",
    age: "28",
    avatar: "https://d2u8k2ocievbld.cloudfront.net/memojis/male/2.png",
    email: "william.howard@example.com",
  },
  {
    id: 8,
    name: "William Howard",
    role: "C.M.",
    team: "Marketing",
    status: "vacation",
    age: "28",
    avatar: "https://d2u8k2ocievbld.cloudfront.net/memojis/male/2.png",
    email: "william.howard@example.com",
  },
  {
    id: 9,
    name: "William Howard",
    role: "C.M.",
    team: "Marketing",
    status: "vacation",
    age: "28",
    avatar: "https://d2u8k2ocievbld.cloudfront.net/memojis/male/2.png",
    email: "william.howard@example.com",
  },
  {
    id: 10,
    name: "William Howard",
    role: "C.M.",
    team: "Marketing",
    status: "vacation",
    age: "28",
    avatar: "https://d2u8k2ocievbld.cloudfront.net/memojis/male/2.png",
    email: "william.howard@example.com",
  },
  {
    id: 11,
    name: "William Howard",
    role: "C.M.",
    team: "Marketing",
    status: "vacation",
    age: "28",
    avatar: "https://d2u8k2ocievbld.cloudfront.net/memojis/male/2.png",
    email: "william.howard@example.com",
  },
  {
    id: 12,
    name: "William Howard",
    role: "C.M.",
    team: "Marketing",
    status: "vacation",
    age: "28",
    avatar: "https://d2u8k2ocievbld.cloudfront.net/memojis/male/2.png",
    email: "william.howard@example.com",
  },
  {
    id: 13,
    name: "William Howard",
    role: "C.M.",
    team: "Marketing",
    status: "vacation",
    age: "28",
    avatar: "https://d2u8k2ocievbld.cloudfront.net/memojis/male/2.png",
    email: "william.howard@example.com",
  },
];

export default function MainContainer({ children, className }: ContainerProps) {
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [activeUserId, setActiveUserId] = useState<number | null>(null);

  return (
    <main className={`${className} relative overflow-hidden`}>
      <div className="sidebar w-full custom-sm:w-[40%] custom-md:w-[30%] custom-lg:w-[25%] h-full flex flex-col box-border">
        {/* Header */}
        <div className="w-full h-[61px] min-h-[61px] flex items-center justify-center bg-black px-[20px]">
          <div className="w-fit h-full flex items-center font-bold text-xl">
            Chat
          </div>
          <div className="w-full h-full flex items-center justify-end gap-2">
            <Tooltip content="Filter" className="bg-[#1F1F1F] rounded-lg">
              <button className="group w-[32px] h-[32px] rounded-lg bg-[#1F1F1F] grid place-items-center cursor-pointer transition-all duration-200 hover:shadow-[-2px_2px_10px_rgba(127,133,245,0.5)] hover:border-[#7F85F5]/30">
                <IoFilter
                  size={18}
                  className="group-hover:text-[#7F85F5] transition-colors duration-200"
                />
              </button>
            </Tooltip>
            <Tooltip content="Meet now" className="bg-[#1F1F1F] rounded-lg">
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
            </Tooltip>
            <Tooltip content="Edit" className="bg-[#1F1F1F] rounded-lg">
              <button className="group w-[32px] h-[32px] rounded-lg bg-[#1F1F1F] grid place-items-center cursor-pointer transition-all duration-300 hover:shadow-[-2px_2px_10px_rgba(127,133,245,0.5)] hover:border-[#7F85F5]/30">
                <RiEditBoxLine
                  size={18}
                  className="group-hover:text-[#7F85F5] transition-colors duration-300"
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
            {users.map((user) => (
              <div
                key={user.id}
                onClick={() => {
                  setIsMobileChatOpen(true);
                  setActiveUserId(user.id);
                }}
                className={`group w-full h-[72px] flex items-center px-2 gap-2 cursor-pointer rounded-xl transition-colors ${
                  activeUserId === user.id
                    ? "bg-[#252525] text-white"
                    : "hover:bg-[#252525] text-gray-200"
                }`}
              >
                <div className="relative w-[44px] h-[44px] flex items-center justify-center">
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    className="rounded-full object-cover"
                    width={44}
                    height={44}
                  />
                </div>
                <div className="w-full flex flex-col gap-0.5">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-medium group-hover:text-white ${
                        activeUserId === user.id
                          ? "text-white"
                          : "text-gray-400"
                      }`}
                    >
                      {user.name}
                    </span>
                    <span
                      className={`text-xs group-hover:text-white ${
                        activeUserId === user.id
                          ? "text-white"
                          : "text-gray-400"
                      }`}
                    >
                      3.33pm
                    </span>
                  </div>
                  <span
                    className={`text-xs group-hover:text-white ${
                      activeUserId === user.id ? "text-white" : "text-gray-400"
                    }`}
                  >
                    {user.role} • {user.team}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div
        className={`main-content absolute custom-sm:static inset-0 flex-1 h-full transition-all duration-300 ease-in-out pr-2 pb-2 ${
          isMobileChatOpen ? "left-0" : "left-full custom-sm:left-0"
        }`}
      >
        <button
          onClick={() => setIsMobileChatOpen(false)}
          className="absolute top-2 left-2 z-30 p-2 text-white  custom-sm:hidden"
        >
          <LuArrowLeft size={24} />
        </button>
        {children}
      </div>
    </main>
  );
}
