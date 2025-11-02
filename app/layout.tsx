import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Froncort - Collaborative Editor & Kanban",
  description: "A Confluence-style collaborative editor with Jira-style Kanban boards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
