"use client";

import { Copy, Check, Users } from "lucide-react";
import { useState } from "react";

interface RoomUser {
  odId: string;
  name?: string;
}

interface CanvasHeaderProps {
  roomTitle: string;
  roomSlug: string;
  users?: RoomUser[];
}

export function CanvasHeader({ roomTitle, roomSlug, users = [] }: CanvasHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleInvite = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Get initials from name or odI
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

  // Generate consistent color based on string
  const getAvatarColor = (str: string) => {
    const colors = [
      "bg-violet-500",
      "bg-indigo-500",
      "bg-blue-500",
      "bg-emerald-500",
      "bg-amber-500",
      "bg-rose-500",
      "bg-cyan-500",
      "bg-purple-500",
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-4 bg-slate-900/50 backdrop-blur-md border-b border-slate-800/50">
      {/* Left - Room Title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
          <span className="text-white text-sm font-bold">C</span>
        </div>
        <div>
          <h1 className="text-white font-semibold text-sm">{roomTitle}</h1>
          <p className="text-slate-400 text-xs">{roomSlug}</p>
        </div>
      </div>

      {/* Right - Invite & Users */}
      <div className="flex items-center gap-4">
        {/* User Avatars */}
        {users.length > 0 && (
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {users.slice(0, 5).map((user, index) => (
                <div
                  key={user.odId}
                  className={`w-8 h-8 rounded-full ${getAvatarColor(user.odId)} flex items-center justify-center text-white text-xs font-semibold border-2 border-slate-900 shadow-md`}
                  style={{ zIndex: users.length - index }}
                  title={user.name || user.odId}
                >
                  {getInitials(user)}
                </div>
              ))}
              {users.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-semibold border-2 border-slate-900">
                  +{users.length - 5}
                </div>
              )}
            </div>
            <span className="ml-2 text-slate-400 text-xs flex items-center gap-1">
              <Users className="w-3 h-3" />
              {users.length} online
            </span>
          </div>
        )}

        {/* Invite Button */}
        <button
          onClick={handleInvite}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Invite
            </>
          )}
        </button>
      </div>
    </header>
  );
}
