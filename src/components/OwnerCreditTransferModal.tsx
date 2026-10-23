"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coins,
  Search,
  Crown,
  X,
  Copy,
  Check,
  Send,
  UserCheck,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useApp } from "@/context/AppContext";
import { isOwnerEmail } from "@/config/site";
import { clientApi } from "@/lib/client-api";
import { User } from "@/types";

interface OwnerCreditTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUserId?: string;
}

export function OwnerCreditTransferModal({
  isOpen,
  onClose,
  initialUserId,
}: OwnerCreditTransferModalProps) {
  const { user, showToast } = useApp();

  const isOwner = user && isOwnerEmail(user.email);

  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [creditAmount, setCreditAmount] = useState<number>(10);
  const [customAmount, setCustomAmount] = useState<string>("10");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load all users on open
  useEffect(() => {
    if (isOpen && isOwner) {
      clientApi.getAllUsers().then((users) => {
        setAllUsers(users);
        if (initialUserId) {
          const match = users.find((u) => u.id === initialUserId);
          if (match) setSelectedUser(match);
        }
      });
    }
  }, [isOpen, isOwner, initialUserId]);

  // Filtered users by ID, nickname, name, or email
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) {
      return allUsers.slice(0, 10);
    }
    const q = searchQuery.trim().toLowerCase();
    return allUsers.filter(
      (u) =>
        u.id.toLowerCase().includes(q) ||
        (u.nickname && u.nickname.toLowerCase().includes(q)) ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q))
    );
  }, [allUsers, searchQuery]);

  if (!isOpen || !isOwner) return null;

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    showToast("User ID copied to clipboard!", "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSelectPreset = (amount: number) => {
    setCreditAmount(amount);
    setCustomAmount(amount.toString());
  };

  const handleCustomAmountChange = (val: string) => {
    setCustomAmount(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setCreditAmount(parsed);
    }
  };

  const handleTransfer = async () => {
    if (!selectedUser) {
      showToast("Please select a user to transfer credits to.", "error");
      return;
    }
    const amount = parseInt(customAmount, 10) || creditAmount;
    if (amount <= 0) {
      showToast("Please enter a valid credit amount greater than 0.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await clientApi.transferCredits(selectedUser.id, amount);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
      showToast(
        `Successfully transferred +${amount} free credits to @${
          selectedUser.nickname || selectedUser.name
        }! New Balance: ${res.newBalance} credits.`,
        "success"
      );

      // Refresh local user list & selected user
      const updated = await clientApi.getAllUsers();
      setAllUsers(updated);
      const match = updated.find((u) => u.id === selectedUser.id);
      if (match) setSelectedUser(match);
    } catch (err: any) {
      showToast(err.message || "Failed to transfer credits.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-surface border-2 border-warning/40 rounded-3xl shadow-2xl z-10 text-fg overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Top Gold Accent Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500" />

          {/* Header */}
          <div className="p-6 border-b border-line flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-warning/15 text-warning border border-warning/30 flex items-center justify-center">
                  <Crown className="w-4 h-4 fill-warning" />
                </span>
                <h2 className="text-lg sm:text-xl font-black text-fg tracking-tight">
                  Owner Tools: Search IDs & Transfer Free Credits
                </h2>
              </div>
              <p className="text-xs text-muted">
                Search any user by ID, nickname, or email and grant free upload credits directly.
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-muted hover:text-fg rounded-xl hover:bg-surface2 transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-6">
            {/* SEARCH INPUT */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-fg flex items-center justify-between">
                <span>Search Clipper Accounts</span>
                <span className="text-[10px] text-muted font-mono">
                  {filteredUsers.length} {filteredUsers.length === 1 ? "user" : "users"} found
                </span>
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type User ID (e.g. usr_...), nickname, or name to search..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface2 border border-line text-xs text-fg placeholder:text-muted focus:outline-none focus:border-warning transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-fg"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* USERS RESULTS LIST */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">
                {searchQuery ? "Search Results" : "Recent Active Clippers"}
              </span>

              {filteredUsers.length === 0 ? (
                <div className="p-6 rounded-2xl bg-surface2 border border-line text-center text-xs text-muted">
                  No users found matching &quot;{searchQuery}&quot;. Try searching with their User ID or nickname.
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto divide-y divide-line rounded-2xl border border-line bg-surface2/50">
                  {filteredUsers.map((u) => {
                    const isSelected = selectedUser?.id === u.id;
                    return (
                      <div
                        key={u.id}
                        onClick={() => setSelectedUser(u)}
                        className={`p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-warning/10 border-l-4 border-warning"
                            : "hover:bg-surface2"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={u.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=clipearn"}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover shrink-0 border border-line"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-xs text-fg truncate">
                                {u.nickname || u.name}
                              </p>
                              <span
                                className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                                  u.role === "owner"
                                    ? "bg-warning/20 text-warning"
                                    : u.role === "vip"
                                    ? "bg-accent/20 text-accent"
                                    : "bg-surface2 text-muted"
                                }`}
                              >
                                {u.role}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 pt-0.5">
                              <span className="text-[10px] font-mono text-muted truncate max-w-[150px]">
                                ID: {u.id}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleCopyId(u.id, e)}
                                className="text-[10px] text-accent hover:underline flex items-center gap-0.5"
                                title="Copy full User ID"
                              >
                                {copiedId === u.id ? (
                                  <>
                                    <Check className="w-2.5 h-2.5 text-success" />
                                    <span className="text-success">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-2.5 h-2.5" />
                                    <span>Copy ID</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="text-xs font-black text-warning font-mono block">
                              {u.role === "owner" ? "∞" : u.credits || 0}
                            </span>
                            <span className="text-[9px] text-muted">credits</span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUser(u);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              isSelected
                                ? "bg-warning text-black shadow-sm"
                                : "bg-surface2 hover:bg-line border border-line text-fg"
                            }`}
                          >
                            {isSelected ? "Selected" : "Select"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* TRANSFER CREDITS PANEL (When a user is selected) */}
            {selectedUser && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 border-2 border-warning/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-warning" />
                    <span className="text-xs font-black text-fg uppercase tracking-wider">
                      Selected Recipient:
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-muted">
                    ID: {selectedUser.id}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-line">
                  <div className="flex items-center gap-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedUser.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=clipearn"}
                      alt={selectedUser.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-bold text-xs text-fg">
                        @{selectedUser.nickname || selectedUser.name}
                      </p>
                      <p className="text-[10px] text-muted">{selectedUser.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-warning">
                      Current: {selectedUser.credits || 0} Credits
                    </span>
                  </div>
                </div>

                {/* AMOUNT PRESETS */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-fg block">
                    Choose Amount to Grant (Free Credits):
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[5, 10, 25, 50, 100].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handleSelectPreset(amt)}
                        className={`py-2 px-1 rounded-xl text-xs font-extrabold border transition-all ${
                          creditAmount === amt && customAmount === amt.toString()
                            ? "bg-warning text-black border-warning shadow-md scale-105"
                            : "bg-surface2 hover:bg-line border-line text-muted hover:text-fg"
                        }`}
                      >
                        +{amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CUSTOM AMOUNT INPUT */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-muted block">
                    Or Enter Custom Credit Amount:
                  </label>
                  <div className="relative">
                    <Coins className="w-4 h-4 text-warning absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min={1}
                      max={10000}
                      value={customAmount}
                      onChange={(e) => handleCustomAmountChange(e.target.value)}
                      placeholder="Enter credits amount..."
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-surface border border-line text-xs font-bold text-fg focus:outline-none focus:border-warning"
                    />
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="button"
                  onClick={handleTransfer}
                  disabled={isSubmitting || !selectedUser}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 text-black font-black text-xs uppercase tracking-wider shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin text-black" />
                      <span>Transferring Credits...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-black" />
                      <span>
                        Transfer +{customAmount || creditAmount} Free Credits to @
                        {selectedUser.nickname || selectedUser.name}
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
