"use client";

interface GhostCursorProps {
  x: number;
  y: number;
  name: string;
  color: string;
}

export function GhostCursor({ x, y, name, color }: GhostCursorProps) {
  return (
    <div
      className="pointer-events-none fixed z-50 transition-all duration-75 ease-out"
      style={{
        left: x,
        top: y,
        transform: "translate(-2px, -2px)",
      }}
    >
      {/* Custom SVG Cursor */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        <path
          d="M5.65376 12.4563L11.0001 2.38867L16.3464 12.4563C16.5927 12.9133 16.4685 13.4757 16.0569 13.795L11.0001 17.5L5.94316 13.795C5.53155 13.4757 5.40735 12.9133 5.65376 12.4563Z"
          fill={color}
          stroke="white"
          strokeWidth="1.5"
        />
        <path
          d="M11 17.5L11 21"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {/* Name Tag */}
      <div
        className="absolute top-6 left-4 px-2 py-1 rounded-md text-xs font-medium text-white whitespace-nowrap shadow-lg"
        style={{
          backgroundColor: color,
        }}
      >
        {name}
      </div>
    </div>
  );
}
