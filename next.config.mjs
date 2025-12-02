/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // output: 'export', // Disabled to allow rewrites
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://ats.octavision.in/api/:path*',
      },
    ]
  },
}

export default nextConfig
