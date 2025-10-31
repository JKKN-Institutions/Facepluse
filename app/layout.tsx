'use client';

import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import { Sidebar } from '@/components/navigation/Sidebar';
import { MobileNav } from '@/components/navigation/MobileNav';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useState } from 'react';

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start closed, expand on hover
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <html lang="en">
      <body className={`${poppins.variable} font-poppins antialiased`}>
        <ThemeProvider>
          <div className="flex h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 overflow-hidden theme-transition">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
              <Sidebar
                open={sidebarOpen}
                onOpen={() => setSidebarOpen(true)}
                onClose={() => setSidebarOpen(false)}
              />
            </div>

            {/* Mobile Navigation */}
            <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

            {/* Main Content Area - No TopNav */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Mobile Menu Button - Only visible on mobile */}
              <div className="lg:hidden fixed top-4 right-4 z-30">
                <button
                  onClick={() => setMobileNavOpen(true)}
                  className="w-12 h-12 bg-white/90 backdrop-blur-lg border-2 border-emerald-200 rounded-xl flex items-center justify-center shadow-lg hover:bg-emerald-50 hover:border-emerald-400 transition-all duration-300 theme-transition"
                  aria-label="Open menu"
                >
                  <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>

              {/* Page Content - Full height */}
              <main className="flex-1 overflow-y-auto">
                {children}
              </main>
            </div>
          </div>
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
