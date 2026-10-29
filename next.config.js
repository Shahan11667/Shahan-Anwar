/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
    unoptimized: true,
  },
  // Prevent @xenova/transformers from being bundled on the server
  serverExternalPackages: ['@xenova/transformers'],
  webpack(config) {
    // Required for @xenova/transformers WASM files
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    // Prevent Node built-ins from breaking client bundle
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/uploads/:path*',
      },
    ]
  },
}

module.exports = nextConfig