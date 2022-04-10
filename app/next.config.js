/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Only run ESLint on the 'src' directory during production builds (next build)
    dirs: ['src'],
  },
}

module.exports = nextConfig
