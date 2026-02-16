import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
    output: "export",
    basePath: isProd ? "/md-blog-mapper" : "",
    assetPrefix: isProd ? "/md-blog-mapper/" : "",
    images: {
        unoptimized: true,
    },
    distDir: "out",
};

export default nextConfig;
