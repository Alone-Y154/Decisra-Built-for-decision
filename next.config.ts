import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/start-session",
        destination: "/session/new",
        permanent: true,
      },
      {
        source: "/sessions/new",
        destination: "/session/new",
        permanent: true,
      },
      {
        source: "/sessions/:sessionId",
        destination: "/session/:sessionId",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
