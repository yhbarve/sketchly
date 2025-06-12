import React, { useRef, useEffect, useState } from "react";
import type { Socket } from "socket.io-client";

export interface DrawEvent {
  x: number;
  y: number;
  color: string;
  width: number;
  type: "begin" | "draw" | "end";
}

interface CanvasBoardProps {
  socket: typeof Socket;
  color?: string;
  lineWidth?: number;
}

export default function CanvasBoard({
  socket,
  color = "#000000",
  lineWidth = 2,
}: CanvasBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [remoteCursors, setRemoteCursors] = useState<
    Record<string, { x: number; y: number }>
  >({});

  // Resize canvas buffer to match its CSS size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  // Drawing logic
  const handleDraw = (ev: DrawEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (ev.type === "begin") {
      ctx.beginPath();
      ctx.moveTo(ev.x, ev.y);
      ctx.strokeStyle = ev.color;
      ctx.lineWidth = ev.width;
    } else if (ev.type === "draw") {
      ctx.lineTo(ev.x, ev.y);
      ctx.stroke();
    } else {
      ctx.closePath();
    }
  };

  // Subscribe to init-state & draw
  useEffect(() => {
    if (!socket) return;

    // replay entire history
    socket.on("init-state", (history: DrawEvent[]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      history.forEach(handleDraw);
    });

    // live strokes
    socket.on("draw", handleDraw);

    return () => {
      socket.off("init-state");
      socket.off("draw", handleDraw);
    };
  }, [socket]);

  // Cursor moves
  useEffect(() => {
    if (!socket) return;
    const onCursor = (data: { x: number; y: number; userId: string }) => {
      setRemoteCursors((prev) => ({
        ...prev,
        [data.userId]: { x: data.x, y: data.y },
      }));
    };
    socket.on("cursor-move", onCursor);
    return () => {
      socket.off("cursor-move", onCursor);
    };
  }, [socket]);

  // Emit draw events
  const emitEvent = (type: DrawEvent["type"], x: number, y: number) => {
    socket.emit("draw", { type, x, y, color, width: lineWidth } as DrawEvent);
  };

  // Handlers
  const getPos = (e: React.PointerEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    const { x, y } = getPos(e);
    handleDraw({ type: "begin", x, y, color, width: lineWidth });
    emitEvent("begin", x, y);
    setIsDrawing(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    // broadcast cursor
    const { x: cx, y: cy } = getPos(e);
    socket.emit("cursor-move", { x: cx, y: cy, userId: socket.id });

    if (!isDrawing) return;
    const { x, y } = getPos(e);
    handleDraw({ type: "draw", x, y, color, width: lineWidth });
    emitEvent("draw", x, y);
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    emitEvent("end", 0, 0);
  };

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        id="sketchly-canvas"
        className="w-full h-full border border-gray-200 bg-white rounded-md"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />

      {/* Render remote cursors */}
      {Object.entries(remoteCursors).map(([id, pos]) => (
        <div
          key={id}
          className="pointer-events-none absolute w-3 h-3 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: pos.x, top: pos.y }}
        />
      ))}
    </div>
  );
}
