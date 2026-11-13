/** @type {import('next').NextConfig} */
const nextConfig = {
  // Self-contained server output for the container image in `Dockerfile`.
  output: "standalone",
};

export default nextConfig;
