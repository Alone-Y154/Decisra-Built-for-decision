import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/start-session",
        destination: "/sessions/new",
        permanent: true,
      },
      {
        source: "/session/:sessionId",
        destination: "/sessions/:sessionId",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
