import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "./context/CartContext"; // <-- Kéo CartProvider vào

export const metadata: Metadata = {
  title: "CIOs - impossible is nothing",
  description: "Hệ thống camera an ninh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body>
        {/* Bọc toàn bộ trang web bằng CartProvider */}
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}