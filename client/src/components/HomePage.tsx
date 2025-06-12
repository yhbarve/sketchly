import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

export default function HomePage() {
    const [username, setUsername] = useState("");
    const navigate = useNavigate();

    function handleGoToBoard(){
        const roomId = "default-room";
        navigate(`/board/${roomId}`, {state: {username}});
    }


  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Hero */}
      <header className="flex-grow bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center pt-20">
        <div className="text-center px-6 max-w-xl">
          <h1 className="text-6xl font-extrabold text-white mb-4">Sketchly</h1>
          <p className="text-xl text-indigo-100 mb-8">
            Draw, chat, and collaborate in real time—right in your browser.
          </p>
          <input
            type="text"
            placeholder="Enter your name..."
            className="inline-block px-6 py-3 ml-8 border-2 border-white font-semibold rounded-lg shadow text-white"
            onChange={(e) => setUsername(e.target.value)}
            />
          <a
            href="#features"
            className="inline-block px-6 py-3 ml-4 bg-white border-2 border-transparent text-indigo-600 font-semibold rounded-lg shadow hover:bg-indigo-50"
            onClick={handleGoToBoard}
            
          >
            Go To Board
          </a>
        </div>
      </header>

      {/* Features */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Real-time Drawing", icon: "✏️" },
              { title: "Per-User Undo", icon: "↩️" },
              { title: "Cursor Indicators", icon: "🖱️" },
              { title: "Integrated Chat", icon: "💬" },
              { title: "Custom Brushes", icon: "🎨" },
              { title: "Export as PNG", icon: "📥" },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-semibold">{f.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <span className="text-sm">&copy; 2025 Sketchly. All rights reserved.</span>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="https://github.com/yhbarve/sketchly" className="hover:text-white">
              GitHub
            </a>
            <a href="/terms" className="hover:text-white">
              Terms
            </a>
            <a href="/privacy" className="hover:text-white">
              Privacy
            </a>
            <a href="/contact" className="hover:text-white">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
