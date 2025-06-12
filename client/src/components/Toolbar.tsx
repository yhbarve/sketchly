interface ToolbarProps {
  color: string;
  lineWidth: number;
  onColorChange: (color: string) => void;
  onLineWidthChange: (w: number) => void;
}

export default function Toolbar({
  color,
  lineWidth,
  onColorChange,
  onLineWidthChange,
}: ToolbarProps) {
  return (
    <div className="flex items-center space-x-6 bg-indigo-50 backdrop-blur-lg rounded-full px-6 py-3">
      {/* Color picker */}
      <label className="flex items-center space-x-2">
        <span className="text-sm font-semibold text-gray-800">Color</span>
        <input
          type="color"
          value={color}
          onChange={(e) => onColorChange(e.target.value)}
          className="h-8 w-8 p-0 border-0 rounded-full"
        />
      </label>

      {/* Line width slider */}
      <label className="flex items-center space-x-2">
        <span className="text-sm text-gray-800 font-semibold">Brush</span>
        <input
          type="range"
          min="1"
          max="20"
          value={lineWidth}
          onChange={(e) => onLineWidthChange(+e.target.value)}
          className="h-6 w-24 accent-blue-500"
        />
        <span className="w-6 text-right text-sm text-gray-800">{lineWidth}</span>
      </label>
    </div>
  );
}
