import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/providers/convex-client-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TenantInbox — AI-assisted tenant message triage",
  description: "AI-assisted tenant message triage for property managers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ConvexClientProvider>
          <header className="border-b border-border bg-background">
            <div className="mx-auto flex max-w-4xl items-center px-4 py-3 sm:px-6 lg:px-8">
              <Link
                href="/inbox"
                className="font-semibold tracking-tight text-foreground hover:text-muted-foreground"
              >
                TenantInbox
              </Link>
            </div>
          </header>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
