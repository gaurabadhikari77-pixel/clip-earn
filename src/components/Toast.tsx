"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function Toast() {
  const { toast } = useApp();

  if (!toast) return null;

  return (
    <AnimatePresence>
      <div className="fixed top-20 right-5 z-50 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border pointer-events-auto max-w-sm bg-surface ${
            toast.type === "success"
              ? "border-success/40 text-fg"
              : toast.type === "error"
              ? "border-danger/40 text-fg"
              : "border-line text-fg"
          }`}
        >
          {toast.type === "success" && (
            <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
          )}
          {toast.type === "error" && (
            <AlertCircle className="w-5 h-5 text-danger shrink-0" />
          )}
          {toast.type === "info" && (
            <Info className="w-5 h-5 text-accent shrink-0" />
          )}
          <span className="text-xs font-semibold leading-snug">{toast.message}</span>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
