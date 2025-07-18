/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push("pino-pretty", "encoding");
    return config;
  },
  // Asegurarse de que PostCSS se procese correctamente
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  // Compresión para mejorar el rendimiento
  compress: true,
  // Optimización de imágenes
  images: {
    domains: ['ipfs.filebase.io'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  // Headers de seguridad
  async headers() {
    return [
      {
        // Aplicar a todas las rutas
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://fonts.googleapis.com; connect-src 'self' https://*.solana.com wss://*.solana.com https://api.mainnet-beta.solana.com wss://api.mainnet-beta.solana.com https://api.devnet.solana.com wss://api.devnet.solana.com https://s3.filebase.com https://*.vercel.app wss://*.vercel.app ws://localhost:* wss://localhost:* https://solana-devnet-rpc.allthatnode.com wss://solana-devnet-rpc.allthatnode.com https://solana-mainnet-rpc.allthatnode.com wss://solana-mainnet-rpc.allthatnode.com; img-src 'self' data: https://*.filebase.io blob: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; frame-ancestors 'none';"
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  }
};

export default nextConfig;
