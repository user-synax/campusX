import "./globals.css";

export const metadata = {
  title: "CampusX",
  description: "Social network for students",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
