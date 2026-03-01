

import "./globals.css";
import { JetBrains_Mono } from "next/font/google";


import Header from "@/components/Header";
import SessionWrapper from "@/components/SessionWrapper";

const jbm = JetBrains_Mono({ subsets: ["latin"] });

export const metadata = {
  title: "ImageKit Next.js Integration",
  description: "Demo of ImageKit integration with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${jbm.className} bg-[#F4F0EA] text-[#1A1A1A] selection:bg-[#FF5722] selection:text-[#F4F0EA]`}>
        {/* GLOBAL THICK FRAME */}
        <div className="pointer-events-none fixed inset-0 z-[60] border-[12px] border-[#1A1A1A]"></div>
        <SessionWrapper>
          <Header />
          <main>{children}</main>
        </SessionWrapper>
      </body>
    </html>
  );
}