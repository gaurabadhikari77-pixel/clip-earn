"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Flag, AlertTriangle } from "lucide-react";
import { Video } from "@/types";
import { useApp } from "@/context/AppContext";

import { clientApi } from "@/lib/client-api";

interface ReportModalProps {
  video: Video | null;
  onClose: () => void;
}

export function ReportModal({ video, onClose }: ReportModalProps) {
  const { user, showToast } = useApp();
  const [reason, setReason] = useState("Inappropriate or Not Working");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!video) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast("Please log in to report a video", "error");
      return;
    }

    setSubmitting(true);
    try {
      await clientApi.reportVideo(video.id, user.id, reason, details);
      showToast("Video reported. Our moderation team will review it.", "success");
      onClose();
    } catch {
      showToast("Failed to submit report", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md rounded-2xl bg-surface border border-line p-6 shadow-2xl space-y-4 text-fg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-danger font-bold text-base">
              <Flag className="w-5 h-5" />
              <span>Report Video</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-muted hover:text-fg hover:bg-surface2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-muted">
            Reporting clip: <strong className="text-fg">{video.title}</strong>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-fg mb-1.5">
                Reason for report
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface2 border border-line text-xs text-fg focus:outline-none focus:border-danger transition-colors"
              >
                <option value="Broken link or deleted video">Broken link or deleted video</option>
                <option value="Not a genuine clip or spam">Not a genuine clip or spam</option>
                <option value="Inappropriate or offensive content">Inappropriate or offensive content</option>
                <option value="Copyright infringement">Copyright infringement</option>
                <option value="Other abuse">Other abuse</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-fg mb-1.5">
                Additional Details (Optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                placeholder="Explain what was wrong with this video..."
                className="w-full px-3 py-2 rounded-xl bg-surface2 border border-line text-xs text-fg placeholder:text-muted focus:outline-none focus:border-danger transition-colors"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-muted hover:text-fg hover:bg-surface2 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-danger hover:opacity-90 text-white font-bold text-xs transition-opacity flex items-center gap-1.5 shadow-md"
              >
                {submitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
