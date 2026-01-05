"use client";

import { useState, useRef, useEffect } from "react";
import { LuAlignJustify, LuSearch, LuArrowLeft } from "react-icons/lu";
import { BsThreeDots } from "react-icons/bs";
import Image from "next/image";

export default function TopNavbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchFocused) {
      inputRef.current?.focus();
    }
  }, [isSearchFocused]);

  const toggleSidebar = () => {
    console.log("first");
    setIsSidebarOpen((prev) => !prev);
    window.dispatchEvent(new CustomEvent("sidebar-event", {}));
  };

  return (
    <div
      className={`w-full h-12 grid z-10 sm:z-0 relative items-center custom-md:grid-cols-[25%_50%_25%] ${
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
      <div
        className={`w-full h-[32px] flex items-center justify-center px-0.5`}
      >
        <div
          className={`w-full max-w-[772px] h-full flex items-center transition-colors rounded-lg sm:outline-1 outline-[#292929]  ${
            isSearchFocused ? "bg-[#292929]" : "sm:bg-[rgb(25,25,25)]"
          }`}
        >
          <button
            className="w-[10%] text-center"
            onClick={() => setIsSearchFocused(true)}
          >
            <LuSearch size={13} className="ml-2 sm:ml-8" />
          </button>
          <input
            ref={inputRef}
            id="search-input"
            type="text"
            placeholder={isSearchFocused ? "Look for people" : "Search"}
            className={`w-[90%] h-full font-normal outline-none pl-2 sm:block ${
              isSearchFocused ? "block" : "hidden"
            }`}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
        </div>
      </div>
      <div
        className={`h-full flex items-center gap-2 justify-end pr-4 ${
          isSearchFocused ? "hidden" : ""
        }`}
      >
        <div className="w-[32px] h-[32px] rounded-md hover:cursor-pointer hover:bg-[#292929] hover:text-[#7F85F5]">
          <span className="w-full h-full flex items-center justify-center text-center font-bold text-lg">
            <BsThreeDots size={15} />
          </span>
        </div>
        <div className="relative w-[28px] h-[28px]">
          <Image
            src="/logos/logo-transparent-1.png"
            alt="Profile"
            width={28}
            height={28}
            className="bg-white rounded-full"
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
      </div>
    </div>
  );
}
