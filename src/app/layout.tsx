import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter, Oswald } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Condensed athletic display face for headings, the wordmark, and stat numbers.
const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SCAD Atlanta Distance — Team Hub",
  description:
    "Private team platform for the SCAD Atlanta distance squad — personalized schedules, calendar, messaging, and athlete feedback.",
  applicationName: "SCAD Distance",
  appleWebApp: { capable: true, title: "SCAD Distance", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#13171F",
  width: "device-width",
  initialScale: 1,
  // Let content extend under the notch/home indicator; we pad with safe-area insets.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${oswald.variable}`}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
