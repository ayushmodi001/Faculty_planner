import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://uaps.edu';

    // In a real app, we might also get dynamic paths, but for an Enterprise platform,
    // the core public landing pages are the most important.
    return [
        {
            url: `${baseUrl}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${baseUrl}/login`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/reset-password`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.2,
        },
    ];
}
