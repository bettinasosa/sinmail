/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Required for x402-next middleware until Edge runtime support is added
    nodeMiddleware: true
  }
}

export default nextConfig
