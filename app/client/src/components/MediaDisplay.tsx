import { ChangeEvent, FC } from "react";

type ModalDisplayProps = {
  src: string;
  id: string;
  type: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  volume?: number;
  controls?: boolean;
};

const MediaDisplay: FC<ModalDisplayProps> = ({
  id,
  src,
  type,
  autoPlay = true,
  muted = true,
  loop = true,
  volume = 1,
  controls = false,
}) => {
  const setVolume = (e: ChangeEvent<HTMLVideoElement>) => {
    if (volume && !muted) e.currentTarget.volume = volume;
  };
  return (
    <>
      {type.startsWith("image/") ? (
        <img src={src} alt={id} />
      ) : type.startsWith("video/") ? (
        <video
          className="aspect-video h-full object-cover"
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          controls={controls}
          onLoadStart={setVolume}
        >
          <source src={src} type={type} />
        </video>
      ) : (
        <></>
      )}
    </>
  );
};

export default MediaDisplay;
