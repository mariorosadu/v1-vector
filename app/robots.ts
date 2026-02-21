import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  // Use canonical format: HTTPS with www subdomain
  const baseUrl = 'https://www.vekthos.com'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/app/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
