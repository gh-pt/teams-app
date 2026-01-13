"use client";

import { useCallback, useRef, useState } from "react";
import { ChatFetchResult, SelectedUser } from "./types";
import { UserData } from "@/components/navbar/TopNavbar";
import { searchUsers } from "@/app/actions/userAction";
import { ChatUI, PrismaChat } from "../interface";
import { ChatParticipant } from "@/generated/prisma/client";
import { searchChats } from "@/app/actions/chatActions";
import Image from "next/image";

export default function CreateChatHeader({
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

  // map prisma chat to ui chat
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
    unreadCount: chat.participants.find((p: ChatParticipant) => p.userId === sessionUserId)?.unreadCount ?? 0,
  });


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
