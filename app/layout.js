import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "@/components/ui/sonner";
import SchemaMarkup from "@/components/shared/SchemaMarkup";

export const metadata = {
  metadataBase: new URL("https://campuszen.vercel.app"),
  title: {
    default: "CampusZen",
    template: "%s | CampusZen",
  },
  verification: {
    google: 'K-xkYw1Y1PqYEcOS3grjVfobh5EH_UFVzU8jESjBzKg'
  },
  description: "The exclusive social network for Indian college students to connect, share, and grow.",
  keywords: [
    "student social network", 
    "college students india", 
    "campus community", 
    "student platform india", 
    "campuszen",
    "exclusive social media"
  ],
  authors: [{ name: "CampusZen" }],
  creator: "CampusZen",
  publisher: "CampusZen",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "CampusZen",
    description: "Connect with your campus community, share notes, and join exclusive student events.",
    url: "https://campuszen.vercel.app",
    siteName: "CampusZen",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CampusZen — Student Social Network",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CampusZen",
    description: "The exclusive social network for Indian college students.",
    images: ["/og-image.png"],
    creator: "@campuszen",
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
        <SchemaMarkup />
        {children}
        <Analytics />
        <SpeedInsights />
        <Toaster position="center" />
      </body>
    </html>
  );
}
