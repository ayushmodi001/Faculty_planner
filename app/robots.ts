import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://uaps.edu';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/admin/',
                '/dashboard/',
                '/api/',
                '/_next/',
                '/static/',
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
