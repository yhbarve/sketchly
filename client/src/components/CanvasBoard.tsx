// client/src/components/CanvasBoard.tsx
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

  // Single handler for all draw-related events
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
    } else if (ev.type === "end") {
      ctx.closePath();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = e.clientX;
    const y = e.clientY;
    socket.emit("cursor-move", { x, y, userId: socket.id });
  };

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

  useEffect(() => {
    if (!socket) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Replay any existing history first
    socket.on("init-state", (history: DrawEvent[]) => {
      history.forEach(handleDraw);
    });

    // Then subscribe to new draw events
    socket.on("draw", handleDraw);

    return () => {
      socket.off("init-state", () => {});
      socket.off("draw", handleDraw);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Replay history
    socket.on("init-state", (history: DrawEvent[]) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      history.forEach(handleDraw);
    });

    // Live draws
    socket.on("draw", handleDraw);

    return () => {
      socket.off("init-state", () => {});
      socket.off("draw", handleDraw);
    };
  }, [socket]);

  // Emit helpers
  const emitEvent = (type: DrawEvent["type"], x: number, y: number) => {
    socket.emit("draw", { type, x, y, color, width: lineWidth } as DrawEvent);
  };

  // Pointer event handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Begin locally
    handleDraw({ type: "begin", x, y, color, width: lineWidth });
    emitEvent("begin", x, y);
    setIsDrawing(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Draw locally
    handleDraw({ type: "draw", x, y, color, width: lineWidth });
    emitEvent("draw", x, y);
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    emitEvent("end", 0, 0);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        id="sketchly-canvas"
        width={800}
        height={600}
        style={{ border: "1px solid #ccc", touchAction: "none" }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerMove={(e) => {
          handlePointerMove(e);
          handleMouseMove(e);
        }}
      />

      {Object.entries(remoteCursors).map(([id, pos]) => (
        <div
          key={id}
          style={{
            position: "absolute",
            left: pos.x,
            top: pos.y,
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "red",
            pointerEvents: "none",
          }}
        />
      ))}
    </div>
  );
}
