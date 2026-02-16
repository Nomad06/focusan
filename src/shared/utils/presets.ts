/**
 * Pre-configured regex patterns for blocking specific parts of sites
 * aka "Smart Filters"
 */

export interface Preset {
    id: string
    name: string
    host: string
    pattern: string
    description?: string
}

export const BLOCKING_PRESETS: Preset[] = [
    {
        id: 'yt-shorts',
        name: 'YouTube Shorts',
        host: 'youtube.com',
        pattern: '^https?:\\/\\/(?:www\\.)?youtube\\.com\\/shorts\\/.*',
        description: 'Blocks only Shorts, allowing normal videos.'
    },
    {
        id: 'twitter-feed',
        name: 'X (Twitter) Feed',
        host: 'x.com',
        pattern: '^https?:\\/\\/(?:www\\.)?(?:twitter|x)\\.com\\/(?:home|explore).*',
        description: 'Blocks the infinite scroll feed but allows messages/notifications.'
    },
    {
        id: 'insta-reels',
        name: 'Instagram Reels',
        host: 'instagram.com',
        pattern: '^https?:\\/\\/(?:www\\.)?instagram\\.com\\/reels\\/.*',
        description: 'Blocks Reels section only.'
    },
    {
        id: 'fb-watch',
        name: 'Facebook Watch',
        host: 'facebook.com',
        pattern: '^https?:\\/\\/(?:www\\.)?facebook\\.com\\/watch\\/?.*',
        description: 'Blocks Facebook video feed.'
    },
    {
        id: 'linkedin-feed',
        name: 'LinkedIn Feed',
        host: 'linkedin.com',
        pattern: '^https?:\\/\\/(?:www\\.)?linkedin\\.com\\/feed\\/?.*',
        description: 'Blocks the main LinkedIn news feed.'
    }
]
