

import "./globals.css";
import { Inter } from "next/font/google";


import Header from "@/components/Header";
import SessionWrapper from "@/components/SessionWrapper";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
       <SessionWrapper>
          <Header />
          <main>{children}</main>
        </SessionWrapper>
      </body>
    </html>
  );
}