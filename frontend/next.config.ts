import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/upload",
        destination: "http://127.0.0.1:8000/upload",
      },
      {
        source: "/api/tailor",
        destination: "http://127.0.0.1:8000/tailor",
      },
    ];
  },
};

export default nextConfig;
