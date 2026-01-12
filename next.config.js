/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Variables d'environnement publiques
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },

  // Optimisations d'images
  images: {
    domains: [
      'lh3.googleusercontent.com', // Pour les avatars Google
      'avatars.githubusercontent.com', // Pour les avatars GitHub
      's.gravatar.com', // Pour les avatars par défaut
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Optimisations de performance
  swcMinify: true,

  // Compression et optimisation
  compress: true,

  // Headers de cache pour les ressources statiques
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // Désactive le cache du système de fichiers pour les données de requête
}

module.exports = nextConfig
