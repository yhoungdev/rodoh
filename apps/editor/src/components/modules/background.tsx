import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import DefaultCard from "@/components/modules/card.tsx";
import useEditorStore from "@/store/editor.store.ts";

const backgroundColors = [
  {
    id: "grad-1",
    name: "Rose to Orange",
    color: "#f43f5e",
    gradient: "from-rose-500 to-orange-500 bg-gradient-to-br",
    type: "gradient",
  },
  {
    id: "grad-2",
    name: "Blue to Cyan",
    color: "#3b82f6",
    gradient: "from-blue-500 to-cyan-500 bg-gradient-to-br",
    type: "gradient",
  },
  {
    id: "grad-3",
    name: "Violet to Purple",
    color: "#8b5cf6",
    gradient: "from-violet-500 to-purple-500 bg-gradient-to-br",
    type: "gradient",
  },
  {
    id: "grad-4",
    name: "Emerald to Teal",
    color: "#10b981",
    gradient: "from-emerald-500 to-teal-500 bg-gradient-to-br",
    type: "gradient",
  },
  {
    id: "grad-5",
    name: "Pink to Rose",
    color: "#ec4899",
    gradient: "from-pink-500 to-rose-500 bg-gradient-to-br",
    type: "gradient",
  },
  {
    id: "grad-6",
    name: "Amber to Yellow",
    color: "#f59e0b",
    gradient: "from-amber-500 to-yellow-500 bg-gradient-to-br",
    type: "gradient",
  },
];

const solidColors = [
  { id: "solid-1", name: "Slate", color: "bg-slate-900", type: "solid" },
  { id: "solid-2", name: "White", color: "bg-white", type: "solid" },
  { id: "solid-3", name: "Zinc", color: "bg-zinc-800", type: "solid" },
  { id: "solid-4", name: "Blue", color: "bg-blue-600", type: "solid" },
  { id: "solid-5", name: "Green", color: "bg-green-600", type: "solid" },
  { id: "solid-6", name: "Red", color: "bg-red-600", type: "solid" },
];

export default function BackgroundModule() {
  const { updateEditorBg, selectedBackground, setSelectedBackground } =
    useEditorStore();

  const handleBgChange = (bg) => {
    updateEditorBg(bg.gradient || bg.color);
    setSelectedBackground(bg);
  };

  return (
    <DefaultCard title={"Background 🎨"}>
      <Tabs defaultValue="gradient">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="gradient">Gradient</TabsTrigger>
          <TabsTrigger value="solid">Solid</TabsTrigger>
        </TabsList>

        <TabsContent value="gradient" className="mt-4">
          <div className="grid grid-cols-3 gap-2">
            {backgroundColors.map((bg) => (
              <button
                key={bg.id}
                className={cn(
                  "h-12 w-full rounded-md cursor-pointer bg-gradient-to-br",
                  bg.gradient,
                  "hover:opacity-90 transition-opacity",
                  selectedBackground?.id === bg.id
                    ? "ring-2 ring-blue-500"
                    : "",
                )}
                onClick={() => handleBgChange(bg)}
                title={bg.name}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="solid" className="mt-4">
          <div className="grid grid-cols-3 gap-2">
            {solidColors.map((bg) => (
              <button
                key={bg.id}
                className={cn(
                  "h-12 rounded-md",
                  bg.color,
                  "hover:opacity-90 transition-opacity",
                  bg.color === "bg-white" && "border border-gray-200",
                  selectedBackground?.id === bg.id
                    ? "ring-2 ring-blue-500"
                    : "",
                )}
                onClick={() => handleBgChange(bg)}
                title={bg.name}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </DefaultCard>
  );
}
