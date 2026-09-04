import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { Toaster } from "sonner";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Stylist — Wear Your Confidence",
  description: "AI personal stylist, curated for you.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${inter.variable} font-sans bg-cream text-espresso antialiased`}
      >
        <main>
          {children}
        </main>
        <BottomNav />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#2A2321',
              color: '#FDFBF7',
              border: '1px solid rgba(241,233,221,0.15)',
              fontFamily: 'var(--font-inter)',
              fontSize: '13px',
              borderRadius: '16px',
            },
          }}
        />
      </body>
    </html>
  );
}
