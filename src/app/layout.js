// src/app/layout.js
"use client"; // ✅ ต้องเป็น Client Component

import { SessionProvider } from "next-auth/react"; // ✅ Import
import { Toaster } from "react-hot-toast";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider> {/* ✅ ห่อทุกอย่างด้วย SessionProvider */}
          {children}
        </SessionProvider>
        <Toaster position="top-right" reverseOrder={false} />
      </body>
    </html>
  );
}
