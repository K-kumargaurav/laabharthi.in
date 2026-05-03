// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Laabharthi — Find Government Schemes You Deserve",
  description:
    "Discover and apply for 1000+ Indian government schemes tailored to your profile. Free eligibility matching in seconds.",
  keywords: "government schemes, india, eligibility, pm kisan, ayushman bharat, sarkari yojana",
  openGraph: {
    title: "Laabharthi",
    description: "Find government schemes you deserve",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}