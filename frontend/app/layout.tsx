import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/query-client";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Scout Panel",
  description: "Scout Panel for football player analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} dark h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
