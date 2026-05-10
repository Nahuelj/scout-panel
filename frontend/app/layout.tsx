import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/query-client";
import { Toaster } from "sonner";

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
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background:
                'radial-gradient(ellipse 115% 90% at 50% -18%, rgba(125,211,252,0.28), rgba(56,189,248,0.12) 38%, rgba(30,58,138,0.08) 55%, transparent 72%), radial-gradient(ellipse 95% 75% at 100% 85%, rgba(96,165,250,0.18), transparent 58%), linear-gradient(165deg, rgb(18,32,52) 0%, rgb(14,26,44) 45%, rgb(12,22,40) 100%)',
              border: '1px solid rgb(14 165 233 / 0.5)',
              color: 'rgb(125 211 252)',
              fontSize: '0.875rem',
            },
            actionButtonStyle: {
              background: 'transparent',
              color: 'rgb(125 211 252)',
              padding: 0,
              fontSize: '0.8rem',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
              fontWeight: '400',
            },
          }}
        />
      </body>
    </html>
  );
}
