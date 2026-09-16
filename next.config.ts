import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Thêm dòng này để cho phép IP mạng LAN của bạn truy cập
  allowedDevOrigins: ['192.168.1.14'],
};

export default nextConfig;