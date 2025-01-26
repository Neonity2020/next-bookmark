import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      'www.google.com', 
      'icon.horse', 
      'neomatrix.netlify.app', 
      // 添加其他可能的域名
    ],
  },
};

export default nextConfig;
