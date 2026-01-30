"use client";

import { initDraw } from "@/draw";
import { useEffect, useRef, useState } from "react";
import { Game } from "@/draw/Game";
import { CanvasHeader } from "./CanvasHeader";
import { ToolDock } from "./ToolDock";
import type { Tool } from "./ToolDock";

interface RoomUser {
  odId: string;
  name?: string;
}

interface RoomData {
  id: number;
  slug: string;
  title: string;
}

export function Canvas({
  roomId,
  socket,
  roomData,
}: {
  socket: WebSocket;
  roomId: string;
  roomData?: RoomData;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<Game>();
  const [selectedTool, setSelectedTool] = useState<Tool>("pencil");
  const [users, setUsers] = useState<RoomUser[]>([]);

  useEffect(() => {
    game?.setTool(selectedTool);
  }, [selectedTool, game]);

  useEffect(() => {
    if (canvasRef.current) {
      const g = new Game(canvasRef.current, roomId, socket);
      setGame(g);

      return () => {
        g.destroy();
      };
    }
  }, [canvasRef, roomId, socket]);

  // Listen for presence updates
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "presence" || data.type === "user_joined") {
          setUsers(data.users || []);
        } else if (data.type === "user_left") {
          setUsers((prev) => prev.filter((u) => u.odId !== data.userId));
        }
      } catch (e) {
        // Ignore parse errors
      }
    };

    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, [socket]);

  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Canvas Header */}
      <CanvasHeader
        roomTitle={roomData?.title || "Untitled Canvas"}
        roomSlug={roomId}
        users={users}
      />

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={typeof window !== "undefined" ? window.innerWidth : 1920}
        height={typeof window !== "undefined" ? window.innerHeight : 1080}
        style={{ marginTop: "56px" }}
      />

      {/* Tool Dock */}
      <ToolDock selectedTool={selectedTool} onToolSelect={setSelectedTool} />
    </div>
  );
}