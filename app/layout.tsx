import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Digitale Visitenkarte",
  description: "Static Next.js app for digital business cards"
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