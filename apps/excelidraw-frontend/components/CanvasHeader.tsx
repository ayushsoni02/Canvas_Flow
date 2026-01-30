"use client";

import { Check, Users, Home, Share2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface RoomUser {
  odId: string;
  name?: string;
  color?: string;
}

interface CanvasHeaderProps {
  roomTitle: string;
  roomSlug: string;
  users?: RoomUser[];
}

// Consistent color palette for users
const USER_COLORS = [
  { bg: "bg-violet-500", text: "text-white", hex: "#8b5cf6" },
  { bg: "bg-indigo-500", text: "text-white", hex: "#6366f1" },
  { bg: "bg-blue-500", text: "text-white", hex: "#3b82f6" },
  { bg: "bg-emerald-500", text: "text-white", hex: "#10b981" },
  { bg: "bg-amber-500", text: "text-white", hex: "#f59e0b" },
  { bg: "bg-rose-500", text: "text-white", hex: "#f43f5e" },
  { bg: "bg-cyan-500", text: "text-white", hex: "#06b6d4" },
  { bg: "bg-purple-500", text: "text-white", hex: "#a855f7" },
];

export function getAvatarColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
}

export function CanvasHeader({ roomTitle, roomSlug, users = [] }: CanvasHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Get initials from name or odId
  const getInitials = (user: RoomUser) => {
    if (user.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user.odId.slice(0, 2).toUpperCase();
  };

  const visibleUsers = users.slice(0, 4);
  const overflowCount = users.length - 4;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-4 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800">
      {/* Left - Home & Room Title */}
      <div className="flex items-center gap-3">
        {/* Home Button */}
        <Link
          href="/dashboard"
          className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 text-slate-400 hover:text-white transition-all duration-200"
          title="Back to Dashboard"
        >
          <Home className="w-4 h-4" />
        </Link>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-700/50" />

        {/* Room Title */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <span className="text-white text-sm font-bold">C</span>
          </div>
          <div>
            <h1 className="text-white font-semibold text-sm leading-tight">{roomTitle}</h1>
            <p className="text-slate-500 text-xs">{roomSlug}</p>
          </div>
        </div>
      </div>

      {/* Right - Users & Share */}
      <div className="flex items-center gap-4">
        {/* User Avatar Pile */}
        {users.length > 0 && (
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {visibleUsers.map((user, index) => {
                const colorScheme = getAvatarColor(user.odId);
                return (
                  <div
                    key={user.odId}
                    className={`w-8 h-8 rounded-full ${colorScheme.bg} flex items-center justify-center ${colorScheme.text} text-xs font-semibold border-2 border-slate-950 shadow-md ring-1 ring-slate-800/50 transition-transform hover:scale-110 hover:z-10`}
                    style={{ zIndex: visibleUsers.length - index }}
                    title={user.name || user.odId}
                  >
                    {getInitials(user)}
                  </div>
                );
              })}
              {overflowCount > 0 && (
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-semibold border-2 border-slate-950 shadow-md">
                  +{overflowCount}
                </div>
              )}
            </div>
            <span className="ml-3 text-slate-400 text-xs flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-800/50 border border-slate-700/50">
              <Users className="w-3 h-3" />
              {users.length} online
            </span>
          </div>
        )}

        {/* Share Room Button */}
        <button
          onClick={handleShare}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            copied
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
          }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              Share Room
            </>
          )}
        </button>
      </div>
    </header>
  );
}
