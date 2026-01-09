import type { Metadata } from "next";
import "./globals.css";
import HeroUiProvider from "./providers/heroProvider";
import { Toaster } from "@/components/ui/sonner";
import SessionProviders from "./providers/sessionProvider";

export const metadata: Metadata = {
  title: "Teams-App",
  description: "Teams-App",
};  

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SessionProviders>
          <HeroUiProvider>
            <Toaster position="top-right" duration={2000} />
            {children}
          </HeroUiProvider>
        </SessionProviders>
      </body>
    </html>
  );
}
