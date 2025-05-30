import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import DefaultCard from "@/components/modules/card.tsx";
import useEditorStore from "@/store/editor.store.ts";
import {
  backgroundColors,
  solidColors,
  backgroundUrls,
} from "@/utils/colors.ts";

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
          <div className="flex flex-wrap gap-2">
            {backgroundColors.map((bg) => (
              <button
                key={bg.id}
                className={cn(
                  "h-12 w-12  rounded-md cursor-pointer bg-gradient-to-br",
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
