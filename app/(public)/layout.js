import "../globals.css";

export const metadata = {
  title: 'CampusX — Your Campus Community',
  description: 'Connect with students, discover events, join college communities.',
  openGraph: {
    title: 'CampusX — Your Campus Community',
    description: 'Connect with students, discover events, join college communities.',
    type: 'website',
    url: process.env.NEXT_PUBLIC_APP_URL,
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

export default function PublicLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-[#0f0f0f] text-[#f0f0f0] antialiased">
        {children}
      </body>
    </html>
  );
}
