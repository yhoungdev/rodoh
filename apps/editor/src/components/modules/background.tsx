import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import DefaultCard from "@/components/modules/card.tsx";
import useEditorStore from "@/store/editor.store.ts";

const backgroundColors = [
  { id: 1, color: "from-rose-500 to-orange-500 bg-gradient-to-br" },
  { id: 2, color: "from-blue-500 to-cyan-500 bg-gradient-to-br" },
  { id: 3, color: "from-violet-500 to-purple-500 bg-gradient-to-br" },
  { id: 4, color: "from-emerald-500 to-teal-500 bg-gradient-to-br" },
  { id: 5, color: "from-pink-500 to-rose-500 bg-gradient-to-br" },
  { id: 6, color: "from-amber-500 to-yellow-500 bg-gradient-to-br" },
];

const solidColors = [
  { id: 1, color: " bg-slate-900" },
  { id: 2, color: "bg-white" },
  { id: 3, color: "bg-zinc-800" },
  { id: 4, color: "bg-blue-600" },
  { id: 5, color: "bg-green-600" },
  { id: 6, color: "bg-red-600" },
];

export default function BackgroundModule() {
  const { updateEditorBg } = useEditorStore();

  return (
    <DefaultCard title={"Background 🟠"}>
      <Tabs defaultValue="gradient">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="gradient">Gradient</TabsTrigger>
          <TabsTrigger value="solid">Solid</TabsTrigger>
        </TabsList>

        <TabsContent value="gradient" className="mt-4">
          <div className="grid grid-cols-4 gap-2">
            {backgroundColors.map((bg) => (
              <button
                key={bg.id}
                className={cn(
                  "h-15 w-15 rounded-md cursor-pointer bg-gradient-to-br",
                  bg.color,
                  "hover:opacity-90 transition-opacity",
                )}
                onClick={() => updateEditorBg(bg.color)}
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
                )}
                onClick={() => updateEditorBg(bg.color)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </DefaultCard>
  );
}
