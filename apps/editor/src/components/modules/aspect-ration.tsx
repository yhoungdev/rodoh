import { Button } from "@repo/ui/src";
import { useEditorStore } from "@/store";

const AspectRatio = () => {
  const { aspectRatio, setAspectRatio, isExporting } = useEditorStore();

  return (
    <div className="mb-4">
      <label className="text-sm font-medium mb-2 block">Aspect Ratio</label>
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant={aspectRatio === "16:9" ? "default" : "outline"}
          size="sm"
          onClick={() => setAspectRatio("16:9")}
          disabled={isExporting}
          className="w-full"
        >
          16:9
        </Button>
        <Button
          variant={aspectRatio === "4:3" ? "default" : "outline"}
          size="sm"
          onClick={() => setAspectRatio("4:3")}
          disabled={isExporting}
          className="w-full"
        >
          4:3
        </Button>
        <Button
          variant={aspectRatio === "1:1" ? "default" : "outline"}
          size="sm"
          onClick={() => setAspectRatio("1:1")}
          disabled={isExporting}
          className="w-full"
        >
          1:1
        </Button>
        <Button
          variant={aspectRatio === "9:16" ? "default" : "outline"}
          size="sm"
          onClick={() => setAspectRatio("9:16")}
          disabled={isExporting}
          className="w-full"
        >
          9:16
        </Button>
        <Button
          variant={aspectRatio === "21:9" ? "default" : "outline"}
          size="sm"
          onClick={() => setAspectRatio("21:9")}
          disabled={isExporting}
          className="w-full"
        >
          21:9
        </Button>
        <Button
          variant={aspectRatio === "2:1" ? "default" : "outline"}
          size="sm"
          onClick={() => setAspectRatio("2:1")}
          disabled={isExporting}
          className="w-full"
        >
          2:1
        </Button>
      </div>
    </div>
  );
};
export default AspectRatio;
