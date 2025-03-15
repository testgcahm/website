'use client';

import "./globals.css";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  const pathname = usePathname();

  return (
    <html lang="en">
      <body>
        {pathname === "/display" || pathname === "/upload" || pathname === '/delete' ? (
          <Navbar />
        ) : null}
        {children}
      </body>
    </html>
  );
}
