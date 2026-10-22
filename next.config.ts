import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  serverExternalPackages: ["@libsql/client"],
  experimental: {
    agentUpgrade: "security",
  },
}

export default nextConfig
