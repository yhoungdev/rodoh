import { useState, useRef } from "react";

function VideoSliceModule({
  duration = 100,
  onSliceChange,
}: {
  duration?: number;
  onSliceChange?: (start: number, end: number) => void;
}) {
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(duration);
  const rangeRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (type: "start" | "end") => (e: React.MouseEvent) => {
    const onMouseMove = (moveEvent: MouseEvent) => {
      const rect = rangeRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = moveEvent.clientX - rect.left;
      const newValue = Math.max(
        0,
        Math.min(duration, (x / rect.width) * duration),
      );

      if (type === "start") {
        if (newValue < end) {
          setStart(newValue);
          onSliceChange?.(newValue, end);
        }
      } else {
        if (newValue > start) {
          setEnd(newValue);
          onSliceChange?.(start, newValue);
        }
      }
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div className="w-full mt-4">
      <div className="relative h-10 bg-gray-800 rounded" ref={rangeRef}>
        <div
          className="absolute top-0 h-full bg-gradient-to-r from-blue-600 to-blue-700  bg-opacity-40"
          style={{
            left: `${(start / duration) * 100}%`,
            width: `${((end - start) / duration) * 100}%`,
          }}
        ></div>

        <div
          className="absolute top-0 w-2 h-full bg-blue-600 cursor-ew-resize"
          style={{ left: `${(start / duration) * 100}%` }}
          onMouseDown={handleMouseDown("start")}
        ></div>

        <div
          className="absolute top-0 w-2 h-full bg-blue-600 cursor-ew-resize"
          style={{ left: `${(end / duration) * 100}%` }}
          onMouseDown={handleMouseDown("end")}
        ></div>
      </div>

      <div className="flex justify-between text-sm text-gray-400 mt-1">
        <span>Start: {start.toFixed(1)}s</span>
        <span>End: {end.toFixed(1)}s</span>
      </div>
    </div>
  );
}

export default VideoSliceModule;
