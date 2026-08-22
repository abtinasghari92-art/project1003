import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@majara/ui', '@majara/types'],
  ...(process.env.VERCEL
    ? {}
    : {
        output: 'standalone',
        outputFileTracingRoot: path.join(__dirname, '../..'),
      }),
};

export default nextConfig;
