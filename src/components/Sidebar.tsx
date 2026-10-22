"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Sparkles,
  PlusCircle,
  Trophy,
  Crown,
  User,
  Zap,
  Pin,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

interface SidebarNavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  highlight?: boolean;
  vip?: boolean;
  external?: boolean;
}

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useApp();

  const navItems: SidebarNavItem[] = [
    { label: "Feed", href: "/", icon: Compass },
    { label: "Fresh Clips", href: "/#fresh", icon: Sparkles, badge: "New" },
    { label: "Upload Clip", href: "/post", icon: PlusCircle, highlight: true },
    { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { label: "VIP Upgrade", href: "/upgrade", icon: Crown, vip: true },
    { label: "My Profile", href: "/profile", icon: User },
  ];

  return (
    <>
      {/* DESKTOP LEFT SIDEBAR (Solid surface with 1px border) */}
      <aside className="hidden lg:flex flex-col w-60 h-[calc(100vh-65px)] sticky top-[65px] border-r border-line bg-surface p-4 justify-between z-30 select-none">
        <div className="space-y-6">
          <div className="space-y-1">
            <p className="px-3 text-[10px] uppercase font-bold tracking-wider text-muted">
              Discover & Engage
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href ||
                    (item.href === "/#fresh" &&
                      pathname === "/" &&
                      typeof window !== "undefined" &&
                      window.location.hash === "#fresh");

              const LinkComponent = item.external ? "a" : Link;
              const linkProps = item.external
                ? { href: item.href, target: "_blank", rel: "noopener noreferrer" }
                : { href: item.href };

              return (
                <LinkComponent
                  key={item.label}
                  {...(linkProps as any)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all group ${
                    isActive
                      ? "bg-surface2 text-fg border border-line shadow-sm"
                      : "text-muted hover:text-fg hover:bg-surface2"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                        isActive
                          ? "text-accent"
                          : item.highlight
                          ? "text-accent"
                          : item.vip
                          ? "text-warning"
                          : "text-muted group-hover:text-fg"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        (item as any).isPin
                          ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                          : "bg-success/15 text-success border border-success/30"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.vip && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-accent/15 text-accent border border-accent/30">
                      20x
                    </span>
                  )}
                </LinkComponent>
              );
            })}
          </div>

          {/* QUICK CLIPPER TIP CARD */}
          <div className="p-3.5 rounded-2xl bg-surface2 border border-line space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-fg">
              <Zap className="w-3.5 h-3.5 text-warning fill-warning" />
              <span>Watch Rule</span>
            </div>
            <p className="text-[11px] text-muted leading-relaxed">
              All clippers start with 0 credits. Watch community clips for 13s + like to earn <strong className="text-fg">+1 credit</strong>, or Owner clips for <strong className="text-warning">+2 credits & +2 upload slots</strong>! (Upload costs 1.5 credits).
            </p>
          </div>
        </div>

        {/* SIDEBAR FOOTER */}
        <div className="pt-3 border-t border-line text-[10px] text-muted space-y-1.5">
          <div className="flex items-center justify-between">
            <span>ClipEarn Platform</span>
            <span className="text-fg font-medium">Solid Theme</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted">
            <Link href="/about" className="hover:text-fg transition-colors">
              About
            </Link>
            <span>&bull;</span>
            <Link href="/privacy" className="hover:text-fg transition-colors">
              Privacy
            </Link>
            <span>&bull;</span>
            <Link href="/contact" className="hover:text-fg transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION TAB BAR */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 h-16 bg-surface border-t border-line z-50 flex items-center justify-around px-2 select-none">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-xl transition-colors ${
                isActive ? "text-accent font-bold" : "text-muted hover:text-fg"
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  item.highlight
                    ? "p-0.5 rounded-lg bg-accent text-accent-fg"
                    : ""
                }`}
              />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
