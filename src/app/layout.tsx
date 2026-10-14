import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { AuthProvider } from "@/components/AuthProvider";
import { ThemeProvider } from "@/context/ThemeContext";
import { AppProvider } from "@/context/AppContext";
import { TopBar } from "@/components/TopBar";
import { Sidebar } from "@/components/Sidebar";
import { FloatingEngagementTracker } from "@/components/FloatingEngagementTracker";
import { LoginModal } from "@/components/LoginModal";
import { Toast } from "@/components/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="midnight" suppressHydrationWarning>
      <head>
        {/* Instant Theme Script before first paint to eliminate FOUT (flash of wrong theme) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('clipearn_theme');
                  var customAccent = localStorage.getItem('clipearn_custom_accent');
                  var theme = saved;
                  if (!theme) {
                    theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'snow' : 'midnight';
                  }
                  document.documentElement.setAttribute('data-theme', theme);
                  if (customAccent) {
                    document.documentElement.style.setProperty('--accent', customAccent);
                    var c = customAccent.replace('#', '');
                    if (c.length === 3) c = c.split('').map(function(x) { return x + x; }).join('');
                    var r = parseInt(c.substr(0, 2), 16) / 255;
                    var g = parseInt(c.substr(2, 2), 16) / 255;
                    var b = parseInt(c.substr(4, 2), 16) / 255;
                    var lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                    document.documentElement.style.setProperty('--accent-fg', lum > 0.45 ? '#000000' : '#FFFFFF');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-bg text-fg flex flex-col font-sans selection:bg-accent/30 selection:text-fg pb-16 lg:pb-0`}
      >
        <AuthProvider>
          <ThemeProvider>
            <AppProvider>
              {/* Top Bar with solid styling, theme switcher, metrics, avatar */}
              <TopBar />

              {/* Core Layout: Left Sidebar + Main Content Area */}
              <div className="flex-1 flex w-full relative z-10">
                {/* Left Sidebar (collapses to bottom tab bar on mobile) */}
                <Sidebar />

                {/* Main Area */}
                <main className="flex-1 w-full min-w-0 overflow-y-auto bg-bg">
                  {children}
                </main>
              </div>

              {/* Floating Engagement Tracker */}
              <FloatingEngagementTracker />

              {/* Global Login Modal */}
              <LoginModal />

              {/* Interactive toast notifications */}
              <Toast />
            </AppProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
