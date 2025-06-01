import BackgroundModule from "../modules/background";
import DefaultCard from "@/components/modules/card.tsx";
import MediaModule from "@/components/modules/media.tsx";
import ZoomPanModule from "@/components/modules/zoom-pan";
import ExportSettings from "@/components/modules/export-settings";

function ActionBarTool() {
  return (
    <div className="bg-white rounded-md overflow-auto p-4  lg:w-[350px] h-[80vh] space-y-4">
      {/*<MediaModule />*/}
      <BackgroundModule />

      {/*<DefaultCard title={" Zoom and Pan 🤚"}>*/}
      {/*  <ZoomPanModule />*/}
      {/*</DefaultCard>*/}

      <DefaultCard title={"Export Settings 🎬"}>
        <ExportSettings />
      </DefaultCard>
    </div>
  );
}

export default ActionBarTool;
