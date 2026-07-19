/** @type {import('next').NextConfig} */
import { join } from 'node:path';

const nextConfig = {
  async headers() {
    return [
      {
        source: '/zk/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ];
  },
  webpack: (config) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true, topLevelAwait: true };
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      child_process: false,
      stream: 'stream-browserify',
    };
    config.resolve.alias = {
      ...config.resolve.alias,
      'isomorphic-ws': join(process.cwd(), 'lib/isomorphic-ws-fix.mjs'),
    };
    return config;
  },
  images: { unoptimized: true },
};

export default nextConfig;
