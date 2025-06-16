/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Configurações para permitir acesso via rede local (iPhone)
  experimental: {
    // Permite que o servidor Next.js escute em todas as interfaces de rede
    serverActions: {
      allowedOrigins: ['*'],
    },
  },
  // Headers de segurança e CORS
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ]
  },
}

export default nextConfig