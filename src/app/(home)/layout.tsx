import SidebarConatiner from "@/components/container/sideBarContainer/SideBarContainer";
import PageWrapper from "@/components/wrapper/pageWrapper/PageWrapper";

import React from "react";

export default async function layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageWrapper className="flex relative">
      <SidebarConatiner />
      {children}
    </PageWrapper>
  );
}
