"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Game } from "@/draw/Game";
import { CanvasHeader, getAvatarColor } from "./CanvasHeader";
import { ToolDock } from "./ToolDock";
import type { Tool } from "./ToolDock";
import { GhostCursor } from "./GhostCursor";
import { SketchingIndicator } from "./SketchingIndicator";

interface RoomUser {
  odId: string;
  name?: string;
  color?: string;
}

interface CursorPosition {
  odId: string;
  name?: string;
  x: number;
  y: number;
  color: string;
}

interface RoomData {
  id: number;
  slug: string;
  title: string;
}

interface SketchingUser {
  odId: string;
  name?: string;
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [game, setGame] = useState<Game>();
  const [selectedTool, setSelectedTool] = useState<Tool>("pencil");
  const [users, setUsers] = useState<RoomUser[]>([]);
  const [cursors, setCursors] = useState<Map<string, CursorPosition>>(new Map());
  const [sketchingUsers, setSketchingUsers] = useState<SketchingUser[]>([]);

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

  // Broadcast cursor position on mouse move
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "cursor_update",
            roomId,
            x: e.clientX,
            y: e.clientY,
          })
        );
      }
    },
    [socket, roomId]
  );

  // Listen for presence, cursor updates, and sketching status
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "presence" || data.type === "user_joined") {
          // Deduplicate users by odId
          const uniqueUsers = (data.users || []).filter(
            (user: RoomUser, index: number, self: RoomUser[]) =>
              index === self.findIndex((u) => u.odId === user.odId)
          );
          setUsers(uniqueUsers);
        } else if (data.type === "user_left") {
          setUsers((prev) => prev.filter((u) => u.odId !== data.userId));
          // Remove cursor for leaving user
          setCursors((prev) => {
            const next = new Map(prev);
            next.delete(data.userId);
            return next;
          });
          // Remove from sketching users
          setSketchingUsers((prev) => prev.filter((u) => u.odId !== data.userId));
        } else if (data.type === "cursor_update") {
          // Update remote cursor position
          const colorScheme = getAvatarColor(data.userId);
          setCursors((prev) => {
            const next = new Map(prev);
            next.set(data.userId, {
              odId: data.userId,
              name: data.userName || data.userId.slice(0, 8),
              x: data.x,
              y: data.y,
              color: colorScheme?.hex || "#8b5cf6",
            });
            return next;
          });
        } else if (data.type === "drawing_status") {
          // Handle sketching status updates
          if (data.isDrawing) {
            setSketchingUsers((prev) => {
              if (!prev.some((u) => u.odId === data.userId)) {
                return [...prev, { odId: data.userId, name: data.userName }];
              }
              return prev;
            });
          } else {
            setSketchingUsers((prev) => prev.filter((u) => u.odId !== data.userId));
          }
        }
      } catch {
        // Ignore parse errors
      }
    };

    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, [socket]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative h-screen overflow-hidden bg-slate-950"
    >
      {/* Grid Dot Background */}
      <div className="absolute inset-0 bg-grid-dots pointer-events-none" />
      
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
        className="mt-14"
      />

      {/* Ghost Cursors */}
      {Array.from(cursors.values()).map((cursor) => (
        <GhostCursor
          key={cursor.odId}
          x={cursor.x}
          y={cursor.y}
          name={cursor.name || cursor.odId.slice(0, 8)}
          color={cursor.color}
        />
      ))}

      {/* Sketching Indicator */}
      {sketchingUsers.length > 0 && (
        <SketchingIndicator
          userName={sketchingUsers[0]?.name || sketchingUsers[0]?.odId.slice(0, 8) || "Someone"}
        />
      )}

      {/* Tool Dock */}
      <ToolDock selectedTool={selectedTool} onToolSelect={setSelectedTool} />
    </div>
  );
}