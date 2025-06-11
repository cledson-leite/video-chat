import type { Metadata } from "next";
import { Gochi_Hand } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import NavBar from "@/components/NavBar";
import Container from "@/components/Container";
import { SocketProvider } from "@/context/SocketContext";
import { cn } from "@/lib/utils";

const gochi = Gochi_Hand({
  weight: "400",
  subsets: ["latin"],
  display: "auto",
});

export const metadata: Metadata = {
  title: "Video Chat",
  description: "Video char with WebRTC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <ClerkProvider>
        <body
          className={cn(`${gochi.className} antialiased relative`)}
        >
          <SocketProvider>
            <main className="flex min-h-screen flex-col bg-secondary">
              <NavBar />
              <Container>
                {children}
              </Container>
            </main>
          </SocketProvider>
        </body>
      </ClerkProvider>
    </html>
  );
}
