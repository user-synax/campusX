export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/feed',
          '/profile',
          '/admin',
          '/api',
          '/settings',
          '/chats',
          '/notifications',
          '/wallet',
          '/verify-student',
        ],
      },
    ],
    sitemap: 'https://campus-x-rho.vercel.app/sitemap.xml',
  }
}
