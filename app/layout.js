import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: "CampusX",
  description: "Social network for students",
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
