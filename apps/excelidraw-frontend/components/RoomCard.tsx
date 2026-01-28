"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Calendar, ArrowRight } from "lucide-react";

interface Room {
  id: number;
  slug: string;
  title: string;
  createAt: string;
}

interface RoomCardProps {
  room: Room;
}

export function RoomCard({ room }: RoomCardProps) {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group glass-card rounded-xl p-5 hover:border-violet-500/50 transition-all duration-300 cursor-pointer"
      onClick={() => router.push(`/canvas/${room.slug}`)}
    >
      {/* Preview placeholder */}
      <div className="w-full h-32 rounded-lg bg-slate-800/50 mb-4 flex items-center justify-center overflow-hidden">
        <div className="text-slate-600 text-xs grid grid-cols-3 gap-2 p-4">
          <div className="w-8 h-8 border border-slate-700 rounded" />
          <div className="w-12 h-12 border border-slate-700 rounded-full" />
          <div className="w-10 h-6 border border-slate-700" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-violet-300 transition-colors truncate">
        {room.title}
      </h3>

      {/* Slug / ID */}
      <p className="text-slate-500 text-xs mb-3 font-mono">{room.slug}</p>

      {/* Date & Action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-slate-400 text-sm">
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(room.createAt)}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/canvas/${room.slug}`);
          }}
          className="flex items-center gap-1.5 text-violet-400 text-sm font-medium hover:text-violet-300 transition-colors"
        >
          Enter Room
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}
