import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['mongoose', 'bcryptjs'],
  // AI generation can take a long time, extend fetch timeout if we use fetch() internally
  // But this applies more to static generation.
};

export default nextConfig;
