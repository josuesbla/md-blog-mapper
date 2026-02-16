import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "export",
    basePath: "/md-blog-mapper",
    assetPrefix: "/md-blog-mapper",
    images: {
        unoptimized: true,
    },
};

export default nextConfig;
