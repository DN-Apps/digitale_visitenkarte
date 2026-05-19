import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Digitale Visitenkarte",
  description: "Erstelle deine digitale Visitenkarte – mit vCard-Download, QR-Code und Google Wallet.",
  themeColor: "#2563eb",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" }
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.svg"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body>
        <div className="demo-watermark" aria-hidden="true">
          DEMONSTRATION
        </div>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}