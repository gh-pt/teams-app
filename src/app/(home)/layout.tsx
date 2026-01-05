import MainContainer from "@/components/container/mainContainer/MainContainer";
import SidebarConatiner from "@/components/container/sideBarContainer/SideBarContainer";
import TopNavbar from "@/components/navbar/TopNavbar";
import MainWrapper from "@/components/wrapper/mainWrapper/MainWrapper";
import PageWrapper from "@/components/wrapper/pageWrapper/PageWrapper";
import React from "react";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <PageWrapper className="flex relative">
      <SidebarConatiner />
      {children}
    </PageWrapper>
  );
}
