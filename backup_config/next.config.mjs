/** @type {import('next').NextConfig} */
const nextConfig = {
  // Otimizações de performance combinadas
  experimental: {
    scrollRestoration: true,
    optimizeCss: true,
    optimizePackageImports: ['framer-motion', 'lucide-react'],
    turbo: {
      rules: {
        '*.svg': ['@svgr/webpack'],
      },
    },
  },
  
  // Compressor de imagens
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 dias
  },
  
  // Headers combinados (segurança + performance)
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
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
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
  
  // Webpack otimizado combinado
  webpack: (config, { dev, isServer }) => {
    // Otimizações de produção
    if (!dev && !isServer) {
      // Otimizar framer-motion
      config.resolve.alias = {
        ...config.resolve.alias,
        'framer-motion': 'framer-motion/dist/framer-motion.js',
      }
      
      // Code splitting otimizado combinado
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
            enforce: true,
          },
          animations: {
            test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
            name: 'animations',
            chunks: 'all',
            priority: 15,
          },
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