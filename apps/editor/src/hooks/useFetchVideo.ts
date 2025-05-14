import { getQueryParam } from "@/utils";
export async function fetchVideoData(fileUrl: string): Promise<string> {
  const videoData = await getQueryParam(fileUrl);
  console.log(videoData);
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch video");
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error fetching video:", error);
    throw error;
  }
}
