import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Speech AI",
  description: "Analyze your speech with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
