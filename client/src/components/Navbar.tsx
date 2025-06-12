// client/src/components/Navbar.tsx
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-white/90 backdrop-blur-md fixed top-0 left-0 w-full z-20 shadow-sm">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo / Brand */}
        <Link to="/" className="text-2xl font-extrabold text-indigo-600">
          Sketchly
        </Link>

        {/* Nav Links */}
        <div className="space-x-6">
          <Link
            to="/"
            className="text-gray-700 hover:text-indigo-600 transition-colors"
          >
            Home
          </Link>
          <Link
            to="/board/test-room"
            className="text-gray-700 hover:text-indigo-600 transition-colors"
          >
            My Board
          </Link>
          <Link
            to="/contact"
            className="text-gray-700 hover:text-indigo-600 transition-colors"
          >
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
}
