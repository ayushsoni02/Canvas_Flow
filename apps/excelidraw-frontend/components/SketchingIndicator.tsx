"use client";

interface SketchingIndicatorProps {
  userName: string;
}

export function SketchingIndicator({ userName }: SketchingIndicatorProps) {
  return (
    <div className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-4 py-2.5 bg-slate-900/90 backdrop-blur-lg border border-slate-700/50 rounded-full shadow-lg animate-pulse">
      {/* Animated dots */}
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
      
      {/* Text */}
      <span className="text-sm text-slate-300">
        <span className="font-medium text-white">{userName}</span>
        {" "}is sketching...
      </span>
    </div>
  );
}
