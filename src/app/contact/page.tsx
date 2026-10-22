"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Send,
  MessageCircle,
  Sparkles,
  Crown,
  Flame,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function ContactPage() {
  const { user, showToast } = useApp();
  const [name, setName] = useState(user?.nickname || user?.name || "");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("VIP Upgrade / Pin Request");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      showToast("Please enter a message", "error");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      showToast("Message received! We will reply within a few hours.", "success");
    }, 600);
  };

  const faqs = [
    {
      q: "How do I upgrade to VIP Rank (20 posts/day)?",
      a: "Contact the platform founder directly on Instagram (@gaurabb_adk). We provide instant 1-on-1 support and activate your 20 daily submissions and VIP badge immediately.",
    },
    {
      q: "How do 24-hour Video Pins work?",
      a: "A 24h Pin places your short-form clip directly at the top of the feed under the owner clips with a glowing flame badge. You can request a pin by messaging @gaurabb_adk on Instagram.",
    },
    {
      q: "Why is liking the video required to claim post credits?",
      a: "Mutual support is the core of ClipEarn. By making likes mandatory alongside 13s watch time, we guarantee that every clipper receives authentic algorithmic engagement that boosts their videos on TikTok, YouTube Shorts, and Instagram Reels.",
    },
    {
      q: "How does the 3-minute fair shuffle work?",
      a: "Every 3 minutes, our algorithm deterministically rotates all active community videos. This prevents early posts from hogging top spots and gives every clipper equal exposure throughout the day.",
    },
    {
      q: "Are my Google login details or Gmail address ever exposed?",
      a: "Never. ClipEarn strictly uses Google Firebase for authentication. Your public identity consists only of your chosen Clipper Nickname, custom avatar, and optional bio.",
    },
  ];

  return (
    <div className="w-full min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12 text-fg">
      {/* 1. HEADER */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-bold uppercase tracking-wider">
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Creator Support & Inquiries</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-fg tracking-tight">
          Get in Touch with Us
        </h1>
        <p className="text-xs sm:text-sm text-muted max-w-xl mx-auto leading-relaxed">
          Need a VIP upgrade, 24h video pin, or creator support? We are active daily and ready to help.
        </p>
      </div>

      {/* 2. DIRECT CONTACT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* INSTAGRAM (PRIMARY / FASTEST) */}
        <a
          href="https://www.instagram.com/gaurabb_adk/"
          target="_blank"
          rel="noopener noreferrer"
          className="p-6 rounded-2xl bg-surface border-2 border-pink-500/40 hover:border-pink-500 transition-all space-y-4 shadow-xl group block"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-pink-500/15 text-pink-400 border border-pink-500/30">
              Instant Response
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-fg flex items-center gap-1.5">
              <span>Instagram Direct Message</span>
              <ExternalLink className="w-4 h-4 text-pink-400" />
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Message <strong className="text-pink-400">@gaurabb_adk</strong> on Instagram for instant VIP rank upgrades, 24h video pins, or creator queries.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-1.5 text-xs text-pink-400 font-bold">
            <span>Send DM on Instagram &rarr;</span>
          </div>
        </a>

        {/* EMAIL SUPPORT */}
        <a
          href="mailto:iamdeathflow11@gmail.com"
          className="p-6 rounded-2xl bg-surface border border-line hover:border-accent transition-all space-y-4 shadow-xl group block"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-surface2 border border-line flex items-center justify-center text-accent shadow-sm group-hover:scale-105 transition-transform">
              <Mail className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-accent/15 text-accent border border-accent/30">
              Direct Email
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-fg flex items-center gap-1.5">
              <span>Email Support</span>
              <ExternalLink className="w-4 h-4 text-accent" />
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              For formal inquiries, bug reports, partnerships, or DMCA copyright requests:{" "}
              <strong className="text-fg">iamdeathflow11@gmail.com</strong>
            </p>
          </div>

          <div className="pt-2 flex items-center gap-1.5 text-xs text-accent font-bold">
            <span>Send Email &rarr;</span>
          </div>
        </a>
      </div>

      {/* 3. CONTACT FORM */}
      <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-line shadow-xl space-y-6">
        <div>
          <h2 className="text-xl font-bold text-fg flex items-center gap-2">
            <Send className="w-5 h-5 text-accent" />
            <span>Send Us a Direct Message</span>
          </h2>
          <p className="text-xs text-muted mt-1">
            Fill out the form below and we will get back to your inquiry promptly.
          </p>
        </div>

        {submitted ? (
          <div className="p-6 rounded-xl bg-success/10 border border-success/30 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-success mx-auto" />
            <h3 className="text-base font-bold text-fg">Message Received!</h3>
            <p className="text-xs text-muted max-w-md mx-auto">
              Thank you for reaching out. We will review your message shortly. For immediate response regarding VIP or pins, you can also DM on Instagram.
            </p>
            <div className="pt-2">
              <a
                href="https://www.instagram.com/gaurabb_adk/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-pink-500 text-white font-bold text-xs shadow-md"
              >
                <span>Message @gaurabb_adk on Instagram</span>
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-fg">Your Clipper Nickname / Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. ApexClipper"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface2 border border-line text-xs text-fg placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-fg">Your Contact Email (optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface2 border border-line text-xs text-fg placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-fg">Inquiry Topic</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface2 border border-line text-xs text-fg focus:outline-none focus:border-accent transition-colors"
              >
                <option value="VIP Upgrade / Pin Request">VIP Upgrade / 24h Pin Showcase</option>
                <option value="Post Credits / Limits Question">Post Credits / Daily Limit Question</option>
                <option value="Technical Bug / Issue">Technical Bug or Error</option>
                <option value="Feedback / Feature Request">Feedback or Feature Suggestion</option>
                <option value="Other">Other Inquiry</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-fg">Your Message</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Explain what you need assistance with..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface2 border border-line text-xs text-fg placeholder:text-muted focus:outline-none focus:border-accent transition-colors resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 rounded-xl bg-accent text-accent-fg font-black text-xs uppercase tracking-wider shadow-md hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>

              <span className="text-[11px] text-muted">
                Or DM directly:{" "}
                <a
                  href="https://www.instagram.com/gaurabb_adk/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-400 hover:underline font-bold"
                >
                  @gaurabb_adk
                </a>
              </span>
            </div>
          </form>
        )}
      </div>

      {/* 4. FAQ ACCORDION */}
      <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-line space-y-5 shadow-xl">
        <h3 className="text-xl font-black text-fg flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-accent" />
          <span>Frequently Asked Questions</span>
        </h3>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-surface2 border border-line space-y-1.5">
              <p className="text-xs sm:text-sm font-bold text-fg">{faq.q}</p>
              <p className="text-xs text-muted leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER NAVIGATION */}
      <div className="flex items-center justify-between text-xs text-muted pt-4 border-t border-line">
        <Link href="/" className="hover:text-accent font-bold transition-colors">
          &larr; Back to Community Feed
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/about" className="hover:text-accent transition-colors">
            About ClipEarn
          </Link>
          <Link href="/privacy" className="hover:text-accent transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
