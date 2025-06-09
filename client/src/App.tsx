import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import CanvasBoard from "./components/CanvasBoard";
import download from "downloadjs";
import ChatPane from "./components/ChatPane";
import Toolbar from "./components/Toolbar";

const SERVER_NS = "http://localhost:4000/whiteboard";

function App() {
  const [socket, setSocket] = useState<typeof Socket | null>(null);
  const [username] = useState(() => prompt("Enter your name") || "anon");
  const [color, setColor] = useState<string>("#333333");
  const [lineWidth, setLineWidth] = useState<number>(3);

  const undo = () => {
    socket?.emit("undo");
  };

  const clear = () => {
    socket?.emit("clear");
  }

  function exportPNG() {
    const canvas = document.getElementById(
      "sketchly-canvas"
    ) as HTMLCanvasElement | null;

    if (!canvas) {
      return alert("Canvas not found");
    }

    canvas.toBlob((blob) => {
      if (blob) {
        download(blob, `sketchly-${Date.now().toString()}.png`, "image/png");
      } else {
        alert("Failed to export image.");
      }
    });
  }

  useEffect(() => {
    const s = io(SERVER_NS, {
      query: { roomId: "test-room", username },
    });
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, [username]);

  if (!socket) return <p>Connecting…</p>;

  return (
    <div style={{ display: "flex", padding: 20 }}>
      <div>
        <h1>Sketchly</h1>
        <Toolbar
            color={color}
            lineWidth={lineWidth}
            onColorChange={setColor}
            onLineWidthChange={setLineWidth}
          />
        <button onClick={undo}>Undo</button>
        <button onClick={clear}>Clear</button>
        <button
          onClick={exportPNG}
          className="ml-2 px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600"
        >
          Export PNG
        </button>
        <CanvasBoard socket={socket} color={color} lineWidth={lineWidth} />
      </div>
      <ChatPane socket={socket} username={username} />
    </div>
  );
}

export default App;
