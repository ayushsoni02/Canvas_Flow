"use client";

import { WS_URL, HTTP_BACKEND } from "@/config";
import { useEffect, useState } from "react";
import { Canvas } from "./Canvas";
import axios from "axios";
import { Loader2 } from "lucide-react";

interface RoomData {
  id: number;
  slug: string;
  title: string;
}

export function RoomCanvas({ roomId }: { roomId: string }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get token from localStorage
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Not authenticated. Please sign in.");
      setIsLoading(false);
      return;
    }

    // Fetch room details
    const fetchRoom = async () => {
      try {
        const res = await axios.get(`${HTTP_BACKEND}/room/${roomId}`);
        if (res.data.room) {
          setRoomData(res.data.room);
        } else {
          setError("Room not found");
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.error("Failed to fetch room:", e);
        setError("Failed to load room");
        setIsLoading(false);
        return;
      }

      // Connect to WebSocket
      const ws = new WebSocket(`${WS_URL}?token=${token}`);

      ws.onopen = () => {
        setSocket(ws);
        setIsLoading(false);
        const data = JSON.stringify({
          type: "join_room",
          roomId,
        });
        console.log("Joining room:", data);
        ws.send(data);
      };

      ws.onerror = () => {
        setError("Failed to connect to server");
        setIsLoading(false);
      };

      ws.onclose = () => {
        console.log("WebSocket closed");
      };
    };

    fetchRoom();

    return () => {
      if (socket) {
        socket.send(
          JSON.stringify({
            type: "leave_room",
            roomId,
          })
        );
        socket.close();
      }
    };
  }, [roomId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
          <p className="text-slate-400">Connecting to canvas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-500 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!socket) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
          <p className="text-slate-400">Connecting to server...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Canvas
        roomId={roomId}
        socket={socket}
        roomData={roomData || undefined}
      />
    </div>
  );
}