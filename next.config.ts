import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  serverExternalPackages: ['mongoose', 'bcryptjs'],
};

export default nextConfig;
