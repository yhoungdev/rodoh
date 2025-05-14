import React from "react";

interface MediaDisplayProps {
  videoSrc?: string;
  fallbackImage?: string;
  alt?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
}

const MediaDisplay: React.FC<MediaDisplayProps> = ({
  videoSrc,
  fallbackImage,
  alt = "Media preview",
  autoPlay = true,
  loop = true,
  muted = true,
  controls = false,
}) => {
  return (
    <div className="w-full h-full overflow-hidden rounded-xl">
      {videoSrc ? (
        <video
          src={videoSrc}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          controls={controls}
          className="w-full h-full object-cover"
        />
      ) : (
        fallbackImage && (
          <img
            src={fallbackImage}
            alt={alt}
            className="w-full h-full object-cover"
          />
        )
      )}
    </div>
  );
};

export default MediaDisplay;
