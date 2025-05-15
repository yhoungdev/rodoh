import { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore, type StoreState } from "@/store";

interface ZoomSettings {
  scale: number;
  duration: number;
  holdTime: number;
  easing: string;
}

const easingOptions = [
  { value: "cubic-bezier(0.4, 0, 0.2, 1)", label: "Standard" },
  { value: "cubic-bezier(0.65, 0, 0.35, 1)", label: "Smooth" },
  { value: "cubic-bezier(0.22, 1, 0.36, 1)", label: "Swift" },
  { value: "cubic-bezier(0.34, 1.56, 0.64, 1)", label: "Bounce" },
  { value: "cubic-bezier(0.83, 0, 0.17, 1)", label: "Sharp" },
];

function ZoomPanModule() {
  const [autoZoomEnabled, setAutoZoomEnabled] = useState(true);
  const [zoomSettings, setZoomSettings] = useState<ZoomSettings>({
    scale: 2.0,
    duration: 1000,
    holdTime: 1500,
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
  });

  const updateEditorSettings = useStore(
    (state: StoreState) => state.updateEditorSettings,
  );

  useEffect(() => {
    updateEditorSettings({
      zoomPan: { autoZoom: autoZoomEnabled, ...zoomSettings },
    });

    const event = new CustomEvent("rodoh:zoom-settings-changed", {
      detail: { autoZoom: autoZoomEnabled, ...zoomSettings },
    });
    window.dispatchEvent(event);
  }, [autoZoomEnabled, zoomSettings, updateEditorSettings]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="auto-zoom" className="text-sm font-medium">
          Auto-zoom on clicks
        </Label>
        <Switch
          id="auto-zoom"
          checked={autoZoomEnabled}
          onCheckedChange={(checked: boolean) => setAutoZoomEnabled(checked)}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Zoom level</Label>
        <div className="flex justify-between text-xs mb-1">
          <span>1x</span>
          <span>4x</span>
        </div>
        <Slider
          value={[zoomSettings.scale]}
          min={1.2}
          max={4}
          step={0.1}
          onValueChange={(value) =>
            setZoomSettings({ ...zoomSettings, scale: value[0] })
          }
        />
        <div className="text-center text-sm mt-1">
          {zoomSettings.scale.toFixed(1)}x
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="zoom-duration" className="text-sm font-medium">
          Zoom animation duration (ms)
        </Label>
        <div className="flex items-center gap-2">
          <Input
            id="zoom-duration"
            type="number"
            min={100}
            max={2000}
            value={zoomSettings.duration}
            onChange={(e) =>
              setZoomSettings({
                ...zoomSettings,
                duration: parseInt(e.target.value) || 1000,
              })
            }
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoomSettings({ ...zoomSettings, duration: 1000 })}
          >
            Reset
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="hold-time" className="text-sm font-medium">
          Hold time (ms)
        </Label>
        <div className="flex items-center gap-2">
          <Input
            id="hold-time"
            type="number"
            min={500}
            max={5000}
            value={zoomSettings.holdTime}
            onChange={(e) =>
              setZoomSettings({
                ...zoomSettings,
                holdTime: parseInt(e.target.value) || 1500,
              })
            }
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoomSettings({ ...zoomSettings, holdTime: 1500 })}
          >
            Reset
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="easing" className="text-sm font-medium">
          Easing animation
        </Label>
        <select
          id="easing"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={zoomSettings.easing}
          onChange={(e) =>
            setZoomSettings({ ...zoomSettings, easing: e.target.value })
          }
        >
          {easingOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="pt-2">
        <Button
          className="w-full"
          onClick={() => {
            const event = new CustomEvent("rodoh:test-zoom", {
              detail: { autoZoom: true, ...zoomSettings },
            });
            window.dispatchEvent(event);
          }}
        >
          Test Zoom Animation
        </Button>
      </div>
    </div>
  );
}

export default ZoomPanModule;
