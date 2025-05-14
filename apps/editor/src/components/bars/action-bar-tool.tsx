import BackgroundModule from "../modules/background";
import DefaultCard from "@/components/modules/card.tsx";
import MediaModule from "@/components/modules/media.tsx";

function ActionBarTool() {
  return (
    <div className="bg-white rounded-md overflow-auto p-4  lg:w-[350px] h-[80vh] space-y-4">
      <MediaModule />
      <BackgroundModule />

      <DefaultCard title={" Zoom and Pan 🤚"}></DefaultCard>
    </div>
  );
}

export default ActionBarTool;
