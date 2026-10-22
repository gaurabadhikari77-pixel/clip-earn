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
import { NicknameModal } from "@/components/NicknameModal";
import { Toast } from "@/components/Toast";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ClipEarn — #1 Content Reward Platform | Helping Clippers Get Views & Engagement",
    template: "%s | ClipEarn — Content Reward Platform",
  },
  description:
    "ClipEarn helps video clippers get authentic views, watch time, and genuine engagement. Support fellow video creators, earn post credits, and explode your short-form reach across TikTok, YouTube Shorts, and Instagram Reels.",
  keywords: [
    "content reward",
    "whop",
    "whop clipster",
    "clipster",
    "whop clipping",
    "whop clip rewards",
    "noisy.la",
    "noisy la",
    "noisy.la alternative",
    "noisy clip farm",
    "clipper rewards",
    "video clipper",
    "short video clippers",
    "tiktok clippers",
    "youtube shorts clippers",
    "instagram reels clippers",
    "stream clippers",
    "kick clippers",
    "twitch clippers",
    "video view exchange",
    "watch and earn",
    "organic reel views",
    "short form video exchange",
    "watch to earn post credits",
    "clipping community",
    "discord clipper hub",
    "capcut templates clippers",
    "viral shorts boost",
    "creator content rewards",
    "clipearn",
  ],
  authors: [{ name: "ClipEarn Community" }],
  creator: "ClipEarn",
  publisher: "ClipEarn",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://gaurabadhikari77-pixel.github.io/clip-earn/",
    siteName: "ClipEarn",
    title: "ClipEarn — Helping Video Clippers Get Views & Engagement",
    description:
      "Support fellow video creators, exchange authentic watch time, earn post credits, and explode your short-form reach on TikTok, YouTube Shorts, and Reels.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClipEarn — Content Reward Platform for Short-Form Clippers",
    description:
      "Community video exchange with real watch time and verified credits. Helps clippers get authentic views and engagement.",
    creator: "@clipearn",
  },
  alternates: {
    canonical: "https://gaurabadhikari77-pixel.github.io/clip-earn/",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://gaurabadhikari77-pixel.github.io/clip-earn/#webapp",
      "name": "ClipEarn",
      "url": "https://gaurabadhikari77-pixel.github.io/clip-earn/",
      "applicationCategory": "MultimediaApplication",
      "operatingSystem": "Web Browser",
      "description":
        "ClipEarn helps video clippers get authentic views, genuine engagement, and organic reach across TikTok, YouTube Shorts, and Instagram Reels through community content rewards.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://gaurabadhikari77-pixel.github.io/clip-earn/#website",
      "url": "https://gaurabadhikari77-pixel.github.io/clip-earn/",
      "name": "ClipEarn",
      "description":
        "Content reward platform for short-form clippers across TikTok, YouTube Shorts, and Instagram Reels.",
    },
  ],
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
        {/* Structured Data: JSON-LD for rich SEO indexing */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
                <main className="flex-1 w-full min-w-0 overflow-y-auto bg-bg flex flex-col justify-between">
                  <div className="flex-1">{children}</div>
                  <Footer />
                </main>
              </div>

              {/* Floating Engagement Tracker */}
              <FloatingEngagementTracker />

              {/* Global Login Modal */}
              <LoginModal />

              {/* Clipper Nickname Selection Modal */}
              <NicknameModal />

              {/* Interactive toast notifications */}
              <Toast />
            </AppProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
