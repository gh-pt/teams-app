"use client";

import MainSideBar from "../../sidebar/main/MainSideBar";
import TopSideBar from "../../sidebar/top/TopSideBar";
import { useEffect, useState } from "react";

export default function SidebarConatiner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleSidebarEvent = () => {
      setVisible((prev) => !prev);
    };

    window.addEventListener("sidebar-event", handleSidebarEvent);

    return () => {
      window.removeEventListener("sidebar-event", handleSidebarEvent);
    };
  }, []);

  return (
    <div
      className={`w-18 h-full fixed pt-12 border-r-[.25px] border-[#292929] ${
        visible ? "left-0 z-10" : "-left-18"
      } custom-md1:static custom-md1:pt-0 transition-left duration-300 ease-in-out flex flex-col`}
    >
      <TopSideBar className="hidden custom-md1:flex" />
      <MainSideBar />
    </div>
  );
}
