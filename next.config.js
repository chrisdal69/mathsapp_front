/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      new URL("https://storage.googleapis.com/mathsapp/images/**"),
      new URL("https://upload.wikimedia.org/wikipedia/**"),
    ],
  },
};

module.exports = nextConfig;
