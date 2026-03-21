import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  title: "CampusX",
  description: "Social network for students",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
