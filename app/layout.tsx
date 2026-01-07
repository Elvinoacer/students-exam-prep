import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "./components/Navbar";
import { Providers } from "./components/Providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://studentsexamprepportalmu-24cs.vercel.app'),
  title: {
    default: "Exam Prep Portal | GTSS",
    template: "%s | GTSS Exam Prep"
  },
  description: "Official Computer Science exam preparation hub. Access past papers, assignments, and learning resources exclusively for GTSS students.",
  keywords: ["exam prep", "computer science", "past papers", "assignments", "GTSS", "university resources"],
  openGraph: {
    title: "GTSS Exam Prep Portal",
    description: "Your central hub for exam success. Access verified resources, assignments, and solutions.",
    url: 'https://studentsexamprepportalmu-24cs.vercel.app',
    siteName: 'GTSS Exam Prep',
    locale: 'en_US',
    type: 'website',
    images: [{
      url: '/images/opengraph-image.png',
      width: 1200,
      height: 630,
      alt: 'GTSS Exam Prep Portal Banner'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "GTSS Exam Prep Portal",
    description: "Official resource hub for Computer Science students.",
    images: ['/images/opengraph-image.png'],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}

