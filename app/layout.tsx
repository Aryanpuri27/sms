import "./globals.css";
import { Inter } from "next/font/google";
import AuthProvider from "@/components/auth-provider";
import LoginStatus from "@/components/login-status";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "School Management System",
  description: "A comprehensive school management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          {children}
          {/* Include LoginStatus component for development debugging */}
          {process.env.NODE_ENV === "development" && <LoginStatus />}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
