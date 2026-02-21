import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  // Use canonical format: HTTPS without www subdomain
  const baseUrl = 'https://vekthos.com'
  
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
