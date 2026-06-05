import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Moreel Leiderschap",
  description: "Een Next.js app voor moreel leiderschap.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
