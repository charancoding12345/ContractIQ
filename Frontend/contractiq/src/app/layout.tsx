// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ContractIQ",
  description: "Phase 1 & 2 — OCR + clause analysis",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning lets your client theme toggle set/remove the "dark" class safely
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
