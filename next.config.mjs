/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Next.js 14: keep TypeORM and pg out of webpack bundling so
  // optional-driver warnings and dynamic require issues don't appear.
  experimental: {
    serverComponentsExternalPackages: ['typeorm', 'pg', 'pg-query-stream', 'reflect-metadata'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // TypeORM bundles many optional drivers that aren't installed.
      // Tell webpack to treat them as empty modules instead of erroring.
      config.resolve.alias = {
        ...config.resolve.alias,
        'react-native-sqlite-storage': false,
        '@sap/hana-client/extension/Stream': false,
        mysql: false,
        mysql2: false,
        oracledb: false,
        'pg-native': false,
        redis: false,
        ioredis: false,
        'better-sqlite3': false,
        sqlite3: false,
        mssql: false,
        'mongodb-client-encryption': false,
        mongodb: false,
        hdb: false,
        'sql.js': false,
      };
    }
    return config;
  },
};

export default nextConfig;
