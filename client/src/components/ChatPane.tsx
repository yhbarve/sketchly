import { useState, useEffect, useRef } from 'react';
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
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Listen for incoming messages
  useEffect(() => {
    const handler = (msg: ChatMessage) => {
      setMessages((ms) => [...ms, msg]);
    };
    socket.on('chat:message', handler);
    return () => {
      socket.off('chat:message', handler);
    };
  }, [socket]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const c = containerRef.current;
    if (c) {
      c.scrollTop = c.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg: ChatMessage = {
      userId: socket.id,
      username,
      text: input.trim(),
      timestamp: Date.now(),
    };
    socket.emit('chat:message', msg);
    setInput('');
  };

  return (
    <div className="w-72 flex flex-col ml-5 h-full">
      {/* Messages container, capped at half viewport, scrollable */}
      <div
        ref={containerRef}
        className="overflow-y-auto border border-gray-300 rounded p-2 bg-white min-h-64 max-h-[50vh]"
      >
        {messages.map((m, i) => (
          <div key={i} className="mb-2">
            <span className="font-semibold text-gray-800 mr-1">{m.username}:</span>
            <span className="text-gray-700">{m.text}</span>
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="mt-2 flex space-x-2">
        <input
          className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
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
  );
}
