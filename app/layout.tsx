import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const registryAssetsUrl = "https://bambiui.com/registry/assets";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://studio.bambiui.com"),
  title: "BambiUI Studio",
  description: "Visual theme and component studio for BambiUI.",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: `${registryAssetsUrl}/favicon.ico`, sizes: "any" },
      { url: `${registryAssetsUrl}/favicon.svg`, type: "image/svg+xml" },
    ],
    apple: [{ url: `${registryAssetsUrl}/apple-touch-icon.png` }],
  },
  manifest: `${registryAssetsUrl}/site.webmanifest`,
  openGraph: {
    title: "BambiUI Studio",
    description: "Visual theme and component studio for BambiUI.",
    url: "https://studio.bambiui.com",
    siteName: "BambiUI Studio",
    type: "website",
    images: [{ url: `${registryAssetsUrl}/og-image.png` }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BambiUI Studio",
    description: "Visual theme and component studio for BambiUI.",
    images: [`${registryAssetsUrl}/twitter-image.png`],
  },
  other: {
    "msapplication-TileImage": `${registryAssetsUrl}/mstile-150x150.png`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
