export default function sitemap() {
  const baseUrl = 'https://campus-x-rho.vercel.app'
  
  const routes = [
    '',
    '/login',
    '/signup',
    '/terms',
    '/privacy',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: route === '' ? 'daily' : 'monthly',
    priority: route === '' ? 1 : 0.8,
  }))

  return routes
}
