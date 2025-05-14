import IndexHeader from "@/components/header";
import ActionBarTool from "@/components/bars/action-bar-tool";
import VideoPreviewBar from "@/components/bars/video-preview-bar";

const IndexRouter = () => {
  return (
    <div className="min-h-screen  ">
      <IndexHeader />

      <div className="mt-6 space-y-4">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-12 lg:col-span-3">
            <ActionBarTool />
          </div>

          <div className="col-span-12 lg:col-span-9">
            <VideoPreviewBar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndexRouter;
