import  { FC } from "react";
import useGeneralStore from "../utils/state/generalStore";

type VideoProps = {
  media_url: string;
  type?: string;
  autoPlay?: boolean;
  poster?: string | null;
  controls?: boolean;
  className?: string;
};

const Video: FC<VideoProps> = ({
  media_url,
  type,
  poster,
  autoPlay = true,
  controls = true,
  className,
}) => {
  const volume = useGeneralStore((state) => state.volume);
  const { setVolume } = useGeneralStore((state) => state.actions);
  //   return <div>Video</div>;
  return (
    <video
      loop
      key={media_url}
      className={className}
      poster={poster ?? ""}
      autoPlay={autoPlay}
      controls={controls}
      onLoadStart={(e) => (e.currentTarget.volume = volume)}
      onVolumeChangeCapture={(e) => setVolume(e.currentTarget.volume)}
    >
      <source src={media_url} type={type ?? "video/mp4"} />
    </video>
  );
};

export default Video;
