import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Footer } from "@/components/footer";
import { GlobalOrnaments } from "@/components/global-ornaments";
import { Header } from "@/components/header";
import { AuthProvider } from "@/providers/auth-provider";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "Admire Boutique | Premium Indian Kurtis",
  description: "Admire Boutique brings premium Indian fashion, elegant kurtis and festive ethnic wear for modern women.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
  other: {
    "color-scheme": "only light",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${manrope.variable} ${fraunces.variable} antialiased`}>
      <body className="flex flex-col bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
        <AuthProvider>
          <ToastProvider>
            <div className="app-shell flex min-h-svh flex-col">
              <GlobalOrnaments />
              <Header />
              <div className="flex-1">{children}</div>
              <Footer />
              <BottomNavigation />
            </div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
