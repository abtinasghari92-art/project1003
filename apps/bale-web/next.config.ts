import path from 'node:path';
import type { NextConfig } from 'next';

const dockerBuild = process.env.DOCKER_BUILD === '1';

const nextConfig: NextConfig = {
  transpilePackages: ['@majara/ui', '@majara/types', '@phosphor-icons/react'],
  ...(dockerBuild
    ? {
        eslint: { ignoreDuringBuilds: true },
      }
    : {
        output: 'standalone',
        outputFileTracingRoot: path.join(__dirname, '../..'),
      }),
};

export default nextConfig;
