import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "AFTERLIGHT — AI-Powered Digital Memory Garden",
  description:
    "Preserve family histories, personal stories, and memories of loved ones using open-weight AI (Gemma). People leave. Their stories don't have to.",
  keywords: [
    "memory garden",
    "family history",
    "oral history",
    "gemma",
    "open-weight ai",
    "remembrance",
    "dia de los muertos",
    "hacktoberfest",
    "local ai",
    "ollama",
  ],
  authors: [{ name: "Megh Shah" }],
  openGraph: {
    title: "AFTERLIGHT — A Digital Memory Garden",
    description: "People leave. Their stories don't have to.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#090a0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-charcoal-950 text-charcoal-100 min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
