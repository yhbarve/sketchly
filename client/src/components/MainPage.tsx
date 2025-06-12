import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import CanvasBoard from "./CanvasBoard";
import download from "downloadjs";
import ChatPane from "./ChatPane";
import Toolbar from "./Toolbar";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";

const SERVER_NS = "http://localhost:4000/whiteboard";

function MainPage() {
  // const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const state = location.state;
  const username = state?.username ?? "anon";
  const [socket, setSocket] = useState<typeof Socket | null>(null);
  const [color, setColor] = useState<string>("#4285f4");
  const [lineWidth, setLineWidth] = useState<number>(11);

  const undo = () => {
    socket?.emit("undo");
  };

  const clear = () => {
    socket?.emit("clear");
  };

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
    <div className="flex flex-col h-screen overflow-hidden pb-4">
      {/* Navbar */}
      <Navbar />

      {/* Toolbar & Actions */}
      <div className="flex-none pt-16 flex items-center justify-between gap-4 px-8 mb-4">
        <Toolbar
          color={color}
          lineWidth={lineWidth}
          onColorChange={setColor}
          onLineWidthChange={setLineWidth}
        />
        <div>
          <button
            onClick={undo}
            className="px-6 py-3 bg-red-600 text-white rounded-lg mr-2 hover:bg-red-700"
          >
            Undo
          </button>
          <button
            onClick={clear}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg mr-2 hover:bg-indigo-700"
          >
            Clear
          </button>
          <button
            onClick={exportPNG}
            className="px-6 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white"
          >
            Export PNG
          </button>
        </div>
      </div>

      {/* Canvas + Chat */}
      <div className="flex flex-1 px-8 space-x-4 overflow-hidden">
        {/* Canvas takes all leftover space */}
        <div className="flex-1 h-full">
          <CanvasBoard socket={socket} color={color} lineWidth={lineWidth} />
        </div>

        {/* Chat pane */}
        <div className="h-full">
          <ChatPane socket={socket} username={username} />
        </div>
      </div>
    </div>
  );
}

export default MainPage;
