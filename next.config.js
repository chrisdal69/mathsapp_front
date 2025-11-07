/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      new URL("https://storage.googleapis.com/mathsapp/images/**"),
    ],
  },
};

module.exports = nextConfig;
