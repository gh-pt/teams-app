"use client";

import { Chat, ContainerProps } from "../interface";
import { useEffect, useState } from "react";
import { LuArrowLeft } from "react-icons/lu";
import MainContainerSideBar from "./MainContainerSideBar";
import { useSession } from "next-auth/react";

export default function MainContainer({ children, className }: ContainerProps) {
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const { data: session, status } = useSession();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChats = async () => {
      if (status === "loading") return;
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/chat/${session?.user?.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch chats");
        }

        if (result.success) {
          console.log(result.data);
          setChats(result.data);
        } else {
          throw new Error(result.error || "Failed to fetch chats");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load chats";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [session?.user?.id, status]);

  return (
    <main className={`${className} relative overflow-hidden`}>
      <MainContainerSideBar
        setIsMobileChatOpen={setIsMobileChatOpen}
        {...{ chats, loading, error }}
      />
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
