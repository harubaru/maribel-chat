const { EnvironmentPlugin } = require('webpack');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    runtime: 'experimental-edge',
  },
  reactStrictMode: true,
  swcMinify: true,
  webpack(config) {
    return config;
  },
}

module.exports = nextConfig
