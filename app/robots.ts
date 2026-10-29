import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.shahananwar.tech';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/tools', '/tools/*'],
        disallow: ['/admin/', '/api/', '/chat/login', '/chat/pending'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
