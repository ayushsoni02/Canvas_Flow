"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus, Users, Loader2, Clock } from "lucide-react";
import axios from "axios";
import { HTTP_BACKEND } from "@/config";
import { Dialog, DialogInput, DialogActions } from "@/components/ui/Dialog";
import { RoomCard } from "@/components/RoomCard";

interface Room {
  id: number;
  slug: string;
  title: string;
  createAt: string;
}

// Generate a random slug for the room
function generateRandomSlug(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let slug = "";
  for (let i = 0; i < 8; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return slug;
}

export default function DashboardPage() {
  const router = useRouter();
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [roomSlug, setRoomSlug] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRoomTitle, setNewRoomTitle] = useState("");

  // Recent rooms
  const [recentRooms, setRecentRooms] = useState<Room[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);

  // Navigation guard - check for token on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin");
    } else {
      setIsLoading(false);
      fetchRecentRooms(token);
    }
  }, [router]);

  const fetchRecentRooms = async (token: string) => {
    try {
      const response = await axios.get(`${HTTP_BACKEND}/rooms`, {
        headers: { authorization: token },
      });
      setRecentRooms(response.data.rooms || []);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const handleOpenDialog = () => {
    setNewRoomTitle("");
    setIsDialogOpen(true);
  };

  const handleCreateRoom = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin");
      return;
    }

    if (!newRoomTitle.trim()) {
      return;
    }

    setIsCreatingRoom(true);

    try {
      const slug = generateRandomSlug();

      const response = await axios.post(
        `${HTTP_BACKEND}/room`,
        { name: slug, title: newRoomTitle.trim() },
        { headers: { authorization: token } }
      );

      if (response.data.roomId) {
        setIsDialogOpen(false);
        router.push(`/canvas/${slug}`);
      }
    } catch (error) {
      console.error("Failed to create room:", error);
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomSlug.trim()) return;

    setIsJoining(true);

    try {
      // Check if room exists
      const response = await axios.get(`${HTTP_BACKEND}/room/${roomSlug}`);

      if (response.data.room) {
        router.push(`/canvas/${roomSlug}`);
      } else {
        alert("Room not found. Please check the Room ID.");
      }
    } catch (error) {
      console.error("Failed to join room:", error);
      alert("Room not found. Please check the Room ID.");
    } finally {
      setIsJoining(false);
    }
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-animated bg-grid-pattern aurora-glow flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-950 bg-gradient-animated bg-grid-pattern aurora-glow">
      {/* Background orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-slate-400 text-lg">
            Ready to create something amazing?
          </p>
        </motion.div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Start New Whiteboard Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <button
              onClick={handleOpenDialog}
              disabled={isCreatingRoom}
              className="w-full h-full min-h-[200px] glass-card rounded-2xl p-8 text-left group hover:border-violet-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-violet-500/25 transition-shadow">
                  <Plus className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-violet-300 transition-colors">
                    Start a New Whiteboard
                  </h2>
                  <p className="text-slate-400 text-sm">
                    Create a fresh canvas and start collaborating in real-time
                    with your team.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex items-center text-violet-400 text-sm font-medium group-hover:text-violet-300 transition-colors">
                Click to create →
              </div>
            </button>
          </motion.div>

          {/* Join Room Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card rounded-2xl p-8"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-white mb-2">
                  Join a Room
                </h2>
                <p className="text-slate-400 text-sm">
                  Enter a room ID to join an existing whiteboard session.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                value={roomSlug}
                onChange={(e) => setRoomSlug(e.target.value)}
                placeholder="Enter Room ID"
                className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 input-focus-ring transition-all duration-200"
                onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
              />
              <button
                onClick={handleJoinRoom}
                disabled={isJoining || !roomSlug.trim()}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isJoining ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Join"
                )}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Recent Canvases Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-5 h-5 text-slate-400" />
            <h2 className="text-xl font-semibold text-white">Recent Canvases</h2>
          </div>

          {isLoadingRooms ? (
            <div className="glass-card rounded-2xl p-12 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
            </div>
          ) : recentRooms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentRooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-medium text-slate-300 mb-2">
                No recent canvases found
              </h3>
              <p className="text-slate-500 text-sm max-w-md">
                Your recently accessed canvases will appear here. Start a new
                whiteboard to get started!
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Create Room Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Create New Whiteboard"
      >
        <DialogInput
          label="Workspace Name"
          placeholder="e.g., Marketing Brainstorm"
          value={newRoomTitle}
          onChange={setNewRoomTitle}
          autoFocus
        />
        <DialogActions>
          <button
            onClick={() => setIsDialogOpen(false)}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateRoom}
            disabled={isCreatingRoom || !newRoomTitle.trim()}
            className="px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isCreatingRoom ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Whiteboard"
            )}
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
