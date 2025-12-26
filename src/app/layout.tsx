import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistem Manajemen Sekolah - School Management System",
  description: "Sistem informasi manajemen sekolah modern untuk mengelola data siswa, guru, staff, dan operasional sekolah secara efisien.",
  keywords: ["Sekolah", "Manajemen Sekolah", "SIAKAD", "Sistem Informasi", "Akademik", "Siswa", "Guru", "Staff"],
  authors: [{ name: "School Admin Team" }],
  openGraph: {
    title: "Sistem Manajemen Sekolah",
    description: "Platform manajemen sekolah terpadu dan modern",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sistem Manajemen Sekolah",
    description: "Platform manajemen sekolah terpadu dan modern",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
