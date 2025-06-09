import type { Metadata } from "next";
import { Playwrite_HU } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import NavBar from "@/components/NavBar";
import Container from "@/components/Container";

const playwrite = Playwrite_HU({
  display: "swap",
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
          className={`${playwrite.className} antialiased`}
        >
          <main className="flex min-h-screen flex-col bg-secondary">
            <NavBar />
            <Container>
              {children}
            </Container>
          </main>
        </body>
      </ClerkProvider>
    </html>
  );
}
