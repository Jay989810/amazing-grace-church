import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navigation } from "@/components/navigation";
import Footer from "@/components/footer";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Default metadata - will be overridden by dynamic settings
export const metadata: Metadata = {
  title: "Amazing Grace Baptist Church - U/Zawu, Gonin Gora, Kaduna State",
  description: "Welcome to Amazing Grace Baptist Church. Join us for worship, fellowship, and spiritual growth. Located in U/Zawu, Gonin Gora, Kaduna State, Nigeria.",
  keywords: "church, baptist, kaduna, nigeria, worship, fellowship, sermons, amazing grace",
  authors: [{ name: "Amazing Grace Baptist Church" }],
  openGraph: {
    title: "Amazing Grace Baptist Church",
    description: "Welcome to Amazing Grace Baptist Church. Join us for worship, fellowship, and spiritual growth.",
    type: "website",
    locale: "en_NG",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <Providers>
          <div className="min-h-screen flex flex-col" suppressHydrationWarning>
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
