import MainContainer from "@/components/container/mainContainer/MainContainer";
import TopNavbar from "@/components/navbar/TopNavbar";
import MainWrapper from "@/components/wrapper/mainWrapper/MainWrapper";
import React from "react";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <MainWrapper className="w-full h-full flex flex-col">
      <TopNavbar />
      <MainContainer className="w-full h-[calc(100%-3rem)] flex">
        {children}
      </MainContainer>
    </MainWrapper>
  );
}
