"use client";

import { searchUsers } from "@/app/actions/userAction";
import { UserData } from "@/components/navbar/TopNavbar";
import Image from "next/image";
import { useRef, useState } from "react";
import { LuArrowLeft, LuSearch, LuX } from "react-icons/lu";

type CreateChatProps = {
  onBack: () => void;
};

export default function CreateChat({ onBack }: CreateChatProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // handle search
  const handleSearch = async (value: string) => {
    setQuery(value);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (value.trim().length === 0) {
      setUsers([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    debounceTimeout.current = setTimeout(async () => {
      const result = await searchUsers(value);

      if (result.status === "success" && result.data) {
        setUsers(result.data);
      } else {
        setUsers([]);
      }
      setLoading(false);
    }, 500);
  };

  const handleUserSelect = (user: {
    id: string;
    name: string;
    image?: string | null;
  }) => {
    setQuery("");
    setUsers([]);

    window.dispatchEvent(
      new CustomEvent("user-select", {
        detail: user,
      })
    );
  };

  const handleClear = () => {
    setQuery("");
    setUsers([]);
    inputRef.current?.focus();
  };

  const showDropdown = isSearchFocused;
  return (
    <div className="h-full w-full bg-[#292929] rounded-lg flex flex-col">
      {/* Header */}
      <div className="h-[61px] w-full flex items-center gap-2 px-4 border-b border-[#3F3F3F]">
        <button onClick={onBack} className="p-1 rounded-md hover:bg-[#1F1F1F]">
          <LuArrowLeft size={22} />
        </button>
        <div className="w-full h-full flex items-center justify-center px-0.5 relative">
          <div
            className={`w-full h-full flex items-center transition-colors rounded-lg outline-1`}
          >
            <button
              className="w-[10%] text-center"
              onClick={() => {
                setIsSearchFocused(true);
                inputRef.current?.focus();
              }}
            >
              To:
            </button>
            <input
              ref={inputRef}
              id="search-input-1"
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={isSearchFocused ? "Look for people" : "Search"}
              className={`w-[90%] h-full font-normal outline-none pl-2 bg-transparent text-white text-sm placeholder:text-gray-400 sm:block ${
                isSearchFocused ? "block" : "hidden"
              }`}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() =>
                setTimeout(() => {
                  setIsSearchFocused(false);
                }, 500)
              }
            />
            {query && (
              <button
                onClick={handleClear}
                className="w-[10%] text-center hover:text-white transition-colors"
              >
                <LuX size={16} />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showDropdown && (
            <div
              ref={dropdownRef}
              className="absolute top-[calc(100%+2px)] left-1/2 transform -translate-x-1/2 w-full max-w-[772px] bg-[#292929] border-gray-300 rounded-lg shadow-2xl max-h-[400px] overflow-y-auto"
            >
              {loading ? (
                // Loading State
                <div className="p-4 space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-3 animate-pulse"
                    >
                      <div className="h-10 w-10 bg-gray-200 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32" />
                        <div className="h-3 bg-gray-200 rounded w-48" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : users.length > 0 ? (
                // Results
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                    People ({users.length})
                  </div>
                  {users.map((user) => (
                    <div
                      key={user.id}
                      onClick={() =>
                        handleUserSelect({
                          id: user.id,
                          name: user.userName,
                          image: user.avatar,
                        })
                      }
                      className="flex items-center space-x-3 px-4 py-2 hover:bg-[#3d3d3d] rounded-lg cursor-pointer transition-colors group"
                    >
                      <Image
                        src={user.avatar || "/default-avatar.png"}
                        alt={user.userName}
                        className="h-10 w-10 rounded-full object-cover shrink-0"
                        width={40}
                        height={40}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {user.userName}
                        </p>
                        <p className="text-xs text-gray-300 truncate">
                          {user.email}
                        </p>
                      </div>
                      <LuSearch
                        size={16}
                        className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                // No Results
                <div className="p-8 text-center">
                  <LuSearch size={48} className="mx-auto text-gray-300 mb-3" />
                  {query ? (
                    <div>
                      <p className="text-sm font-medium">No users found</p>
                      <p className="text-xs text-gray-300 mt-1">
                        Try a different search term
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm font-medium">
                      Start typing to search
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-4 text-gray-400">
        Search users and start a conversation
      </div>
    </div>
  );
}
