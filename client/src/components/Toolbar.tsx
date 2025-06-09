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
    <div className="flex items-center space-x-4">
      {/* Color picker */}
      <label className="flex items-center space-x-2">
        <span className="text-sm">Color:</span>
        <input
          type="color"
          value={color}
          onChange={(e) => onColorChange(e.target.value)}
          className="h-8 w-8 p-0 border-0"
        />
      </label>

      {/* Line width slider */}
      <label className="flex items-center space-x-2">
        <span className="text-sm">Brush:</span>
        <input
          type="range"
          min="1"
          max="20"
          value={lineWidth}
          onChange={(e) => onLineWidthChange(+e.target.value)}
          className="h-2 w-24 accent-blue-500"
        />
        <span className="w-6 text-right text-sm">{lineWidth}</span>
      </label>
    </div>
  );
}
