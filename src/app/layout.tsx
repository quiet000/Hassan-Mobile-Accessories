import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { DateProvider } from "@/lib/date-context";
import { AuthProvider } from "@/lib/auth-context";
import AuthGate from "@/components/AuthGate";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "داشبورد تتبع المبيعات والشحنات",
  description: "لوحة تحكم تتبع مبيعات وشحنات متجر إكسسوارات الهواتف",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full`}>
      <body className="min-h-full flex bg-gray-50 font-[var(--font-cairo)]">
        <AuthProvider>
          <DateProvider>
            <AuthGate>{children}</AuthGate>
          </DateProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
