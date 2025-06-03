import VideoPreviewBar from "@/components/bars/video-preview-bar";
import { DashboardLayout } from "@/components/layouts/dashboardLayout.tsx";

const IndexRouter = () => {
  return (
    <DashboardLayout>
      <VideoPreviewBar />
    </DashboardLayout>
  );
};

export default IndexRouter;
