import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  metadataBase: new URL("https://campus-x-rho.vercel.app"),
  title: {
    default: "CampusX",
    template: "%s | CampusX",
  },
  description: "The exclusive social network for Indian college students to connect, share, and grow.",
  keywords: [
    "student social network", 
    "college students india", 
    "campus community", 
    "student platform india", 
    "campusx",
    "exclusive social media"
  ],
  authors: [{ name: "CampusX" }],
  creator: "CampusX",
  publisher: "CampusX",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "CampusX",
    description: "Connect with your campus community, share notes, and join exclusive student events.",
    url: "https://campus-x-rho.vercel.app",
    siteName: "CampusX",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CampusX — Student Social Network",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CampusX",
    description: "The exclusive social network for Indian college students.",
    images: ["/og-image.png"],
    creator: "@campusx",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport = {
  themeColor: "#6c3bff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        <Analytics />
        <SpeedInsights />
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
