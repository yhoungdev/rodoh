import { useState, useEffect, useRef } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import AspectRatio from "@/components/modules/aspect-ration.tsx";
import ConvertVideo from "@/components/modules/convert-video.tsx";

const ExportSettings = () => {
  const ffmpegRef = useRef(new FFmpeg());
  const [loaded, setLoaded] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on("log", ({ message }) => {
      if (messageRef.current) {
        messageRef.current.innerHTML = message;
      }
      console.log(message);
    });

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm",
      ),
    });
    setLoaded(true);
  };

  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [ffmpegLoading, setFfmpegLoading] = useState(false);

  useEffect(() => {
    const checkFfmpegStatus = async () => {
      setFfmpegLoading(true);

      try {
        setTimeout(() => {
          setFfmpegLoaded(true);
          setFfmpegLoading(false);
        }, 2000);
      } catch (error) {
        console.error("Failed to check FFmpeg status:", error);
        setFfmpegLoading(false);
      }
    };

    checkFfmpegStatus();
  }, []);

  return (
    <div className="space-y-10 px-8 mt-[2em] ">
      <AspectRatio />
      <ConvertVideo ffmpegLoaded={ffmpegLoaded} ffmpegLoading={ffmpegLoading} />
      <div ref={messageRef} className="text-sm text-gray-700"></div>
    </div>
  );
};

export default ExportSettings;
