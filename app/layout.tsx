import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./context/CartContext";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

<<<<<<< HEAD
export const metadata: Metadata = {
  title: "CIOs Camera - Thiết Bị An Ninh & Nhà Thông Minh Cao Cấp",
  description: "Cung cấp giải pháp an ninh, camera quan sát AI 4.0, thiết bị mạng router switch toàn diện",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#0369a1",
=======
export const metadata = {
  title: "CIOs - impossible is nothing | Chuyên thiết bị an ninh",
  description: "Cung cấp giải pháp an ninh, camera, mạng toàn diện",
>>>>>>> 083ad7c1a70f1fd081841d97908a4defe4ae5d96
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        {/* Font Awesome CDN */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body className={plusJakartaSans.className}>
        {/* Bọc toàn bộ trang web bằng CartProvider */}
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}