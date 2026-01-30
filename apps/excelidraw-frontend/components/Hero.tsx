"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Github, Loader2 } from "lucide-react";
import axios from "axios";
import { HTTP_BACKEND } from "@/config";

// Generate a random slug for the room
function generateRandomSlug(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let slug = "";
  for (let i = 0; i < 8; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return slug;
}

export function Hero() {
  const router = useRouter();
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  const handleStartDrawing = async () => {
    const token = localStorage.getItem("token");
    
    // If not authenticated, redirect to signup
    if (!token) {
      router.push("/signup");
      return;
    }

    setIsCreatingRoom(true);
    
    try {
      const slug = generateRandomSlug();
      
      const response = await axios.post(
        `${HTTP_BACKEND}/room`,
        { name: slug },
        { headers: { authorization: token } }
      );

      if (response.data.roomId) {
        router.push(`/canvas/${slug}`);
      }
    } catch (error) {
      console.error("Failed to create room:", error);
      // If unauthorized, redirect to signin
      router.push("/signin");
    } finally {
      setIsCreatingRoom(false);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden aurora-glow">
      {/* Background glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-slate-400">Now in Public Beta</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight"
          >
            <span className="text-white">Collaborate in Real-Time,</span>
            <br />
            <span className="text-gradient text-glow">Without Limits.</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto"
          >
            A high-performance collaborative canvas built from the ground up for
            speed and precision. No heavy dependencies — just pure, lightweight
            rendering.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={handleStartDrawing}
              disabled={isCreatingRoom}
              className="group relative px-8 py-4 text-base font-medium text-white bg-violet-600 rounded-xl hover:bg-violet-500 transition-all duration-300 glow-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingRoom ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Room...
                </>
              ) : (
                <>
                  <Pencil className="w-5 h-5" />
                  Start Drawing
                </>
              )}
              <span className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 text-base font-medium text-slate-300 border border-slate-700 rounded-xl hover:bg-slate-800 hover:border-slate-600 hover:text-white transition-all duration-300 flex items-center gap-2"
            >
              <Github className="w-5 h-5" />
              View on GitHub
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
