import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  // Canonical format: HTTPS without www subdomain
  const baseUrl = 'https://vekthos.com'
  
  // Only include public, canonical URLs that return 200 status
  // Exclude: auth-protected routes (/admin, /app, /login, /box/metacognition)
  const routes = [
    '',
    '/privacy',
    '/terms',
    '/publications',
    '/prototype',
    '/box',
    '/box/map',
    '/box/profile-analysis',
    '/box/voiceflux',
    '/contact',
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))
}
