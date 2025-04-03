/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
    domains: [], // 在这里添加允许的图片域名
  },
  output: 'export',
  trailingSlash: true,
}

module.exports = nextConfig 