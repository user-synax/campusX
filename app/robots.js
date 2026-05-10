export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/feed',
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
    sitemap: 'https://zen.socialnomad.com/sitemap.xml',
  }
}
