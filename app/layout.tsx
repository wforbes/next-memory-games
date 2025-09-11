import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Memory Game",
  description: "Flip some cards, use some brains",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
