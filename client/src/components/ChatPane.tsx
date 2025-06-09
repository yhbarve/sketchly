import { useEffect, useState } from 'react'
import type { Socket } from 'socket.io-client';

interface ChatMessage {
  userId: string;
  username: string;
  text: string;
  timestamp: number;
}

interface ChatPaneProps {
  socket: typeof Socket;
  username: string;
}

export default function ChatPane({ socket, username }: ChatPaneProps) {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    useEffect(() => {
        const handleMessage = (msg: ChatMessage) => {
            setMessages((ms) => [...ms, msg]);
        }

        socket.on("chat:message", handleMessage);

        return () => {socket.off("chat:message", handleMessage)};

    }, [socket]);

    function sendMessage() {
        if (!input.trim()) return;
        const msg: ChatMessage = {
            userId: socket.id,
            username,
            text: input.trim(),
            timestamp: Date.now()
        };
        socket.emit("chat:message", msg);
        setInput("");
    }

    return (
        <div className="w-72 flex flex-col ml-5">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto border border-gray-300 rounded p-2 bg-white">
        {messages.map((m, i) => (
          <div key={i} className="mb-2">
            <span className="font-semibold text-gray-800 mr-1">{m.username}:</span>
            <span className="text-gray-700">{m.text}</span>
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="mt-2 flex">
        <input
          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message…"
        />
        <button
          onClick={sendMessage}
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Send
        </button>
      </div>
    </div>
    )
}
