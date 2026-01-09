"use client";

import { useState, useRef, useEffect } from "react";
import { LuAlignJustify, LuSearch, LuArrowLeft, LuX } from "react-icons/lu";
import { BsThreeDots } from "react-icons/bs";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "next-auth/react";
import { searchUsers } from "@/app/actions/userAction";

interface UserData {
  id: string;
  userName: string;
  email: string;
  avatar: string | null;
}

export default function TopNavbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  const avatar = session?.user?.image || "/logos/logo-transparent-1.png";

  useEffect(() => {
    if (isSearchFocused) {
      inputRef.current?.focus();
    }
  }, [isSearchFocused]);

  // handle toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
    window.dispatchEvent(new CustomEvent("sidebar-event", {}));
  };

  // handle logout
  function handleLogout() {
    signOut({ redirectTo: "/login" });
  }

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
    <div
      className={`w-full h-12 grid z-10 relative items-center custom-md:grid-cols-[25%_50%_25%] ${
        isSearchFocused ? "grid-cols-[15%_82%]" : "grid-cols-[15%_60%_25%]"
      }`}
    >
      <div className="flex items-center justify-center">
        <button
          className={`p-2 rounded-sm custom-md1:hidden ${
            isSidebarOpen ? "bg-[#1F1F1F]" : "bg-black"
          }`}
          onClick={toggleSidebar}
        >
          <span>
            {isSearchFocused ? (
              <LuArrowLeft
                size={20}
                color={isSidebarOpen ? "#7F85F5" : "#FFFFFF"}
              />
            ) : (
              <LuAlignJustify
                size={20}
                color={isSidebarOpen ? "#7F85F5" : "#FFFFFF"}
              />
            )}
          </span>
        </button>
      </div>
      <div className="w-full h-[32px] flex items-center justify-center px-0.5 relative">
        <div
          className={`w-full max-w-[772px] h-full flex items-center transition-colors rounded-lg sm:outline-1 outline-[#292929] ${
            isSearchFocused ? "bg-[#292929]" : "sm:bg-[rgb(25,25,25)]"
          }`}
        >
          <button
            className="w-[10%] text-center text-gray-400"
            onClick={() => {
              setIsSearchFocused(true);
              inputRef.current?.focus();
            }}
          >
            <LuSearch size={13} className="ml-2 sm:ml-8" />
          </button>
          <input
            ref={inputRef}
            id="search-input"
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={isSearchFocused ? "Look for people" : "Search"}
            className={`w-[80%] h-full font-normal outline-none pl-2 bg-transparent text-white text-sm placeholder:text-gray-400 sm:block ${
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
              className="w-[10%] text-center text-gray-400 hover:text-white transition-colors"
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
                  <p className="text-sm font-medium">Start typing to search</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <div
        className={`h-full flex items-center gap-2 justify-end pr-4 ${
          isSearchFocused ? "hidden sm:flex" : ""
        }`}
      >
        <div className="w-[32px] h-[32px] rounded-md hover:cursor-pointer hover:bg-[#292929] hover:text-[#7F85F5]">
          <span className="w-full h-full flex items-center justify-center text-center font-bold text-lg">
            <BsThreeDots size={15} />
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="relative w-[28px] h-[28px] cursor-pointer">
              <Image
                src={avatar}
                alt="Profile"
                width={28}
                height={28}
                className="bg-white rounded-full"
                loading="eager"
              />
              {/* Verified badge */}
              <div className="absolute bottom-0 -right-0.5 w-[10px] h-[10px] bg-green-500 rounded-full flex items-center justify-center border border-black">
                <svg
                  className="w-[6px] h-[6px] text-black"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32 mt-2">
            <DropdownMenuLabel className="font-normal text-bold text-sm text-muted-foreground">
              {session?.user?.name || "User"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500 focus:text-red-500 cursor-pointer hover:bg-gray-400"
              onClick={handleLogout}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
