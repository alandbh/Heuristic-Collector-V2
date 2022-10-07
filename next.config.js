/** @type {import('next').NextConfig} */

const withPWA = require("next-pwa")({
    dest: "public",
    register: true,
    skipWaiting: true,
});

const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
        domains: ["media.graphassets.com", "lh3.googleusercontent.com"],
    },
};

module.exports = withPWA(nextConfig);
