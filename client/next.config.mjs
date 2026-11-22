/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@frameflow/shared'],
  distDir: process.env.NEXT_DIST_DIR || '.next',
};

export default nextConfig;
