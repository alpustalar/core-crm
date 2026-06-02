import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Standalone output creates a self-contained bundle for Docker deployments.
  // Does not affect `next dev` — only applies after `next build`.
  output: "standalone",

  // Let Next.js trace files from the monorepo root so shared packages are included.
  outputFileTracingRoot: path.join(__dirname, "../../"),
};

export default nextConfig;
