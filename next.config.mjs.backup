/** @type {import('next').NextConfig} */
const nextConfig = {
  // Otimizações de performance
  experimental: {
    scrollRestoration: true,
  },
  
  // Compressor de imagens
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 dias
  },
  
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  
  // Redirects para otimizar SEO
  async redirects() {
    return [
      // Redirects para páginas antigas (se existirem)
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/portal',
        destination: '/login',
        permanent: true,
      },
      {
        source: '/admin',
        destination: '/admin/login',
        permanent: true,
      },
    ]
  },
  
  // Rewrites para melhor estrutura de URLs
  async rewrites() {
    return [
      // API routes customizadas podem ser adicionadas aqui
    ]
  },
  
  // Otimização de bundle
  webpack: (config, { dev, isServer }) => {
    // Otimizações de produção
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'async',
          priority: 5,
          reuseExistingChunk: true,
        },
      }
    }
    
    return config
  },
  
  // Configurações de output
  output: 'standalone',
  
  // Configurações de compilação
  compiler: {
    // Remove console.log em produção
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Configurações de runtime
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
}

export default nextConfig