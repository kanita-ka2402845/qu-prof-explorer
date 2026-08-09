import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QU Prof Explorer",
  description: "Honest instructor reviews, by QU students.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
